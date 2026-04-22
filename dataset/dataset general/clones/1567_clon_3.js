const DomainSuggester = (function() {

  /*
   * Email Address Correction and Suggestion Utility
   * Project Name: DomainSuggesterJS
   * Original Author: Derrick Ko (mailcheck)
   * This version adapted and restructured for Type III clone demonstration.
   *
   * License: MIT License (as per original project)
   *
   * Version: 2.0.0 (Type III Clone)
   *
   * This module provides functionality to check email addresses for common typos
   * in domain names and suggest corrections. It supports custom domain lists
   * and distance functions.
   */

  // Internal configuration for similarity tolerances
  const _similarityThresholds = {
    // Levenshtein-like distance threshold for the entire domain part (e.g., 'gmail.com')
    completeDomainTolerance: 2,
    // Threshold for the second-level domain (e.g., 'gmail' in 'gmail.com')
    secondaryDomainTolerance: 2,
    // Threshold for the top-level domain (e.g., 'com' in 'gmail.com')
    primaryDomainTolerance: 2
  };

  // Default lists of common email domains
  const _standardFullDomains = Object.freeze([
    'msn.com', 'bellsouth.net', 'telus.net', 'comcast.net', 'optusnet.com.au',
    'earthlink.net', 'qq.com', 'sky.com', 'icloud.com', 'mac.com', 'sympatico.ca',
    'googlemail.com', 'att.net', 'xtra.co.nz', 'web.de', 'cox.net', 'gmail.com',
    'ymail.com', 'aim.com', 'rogers.com', 'verizon.net', 'rocketmail.com',
    'google.com', 'optonline.net', 'sbcglobal.net', 'aol.com', 'me.com',
    'btinternet.com', 'charter.net', 'shaw.ca'
  ]);

  // Default lists of common second-level domain names (without TLD)
  const _standardSecondLevelNames = Object.freeze(["yahoo", "hotmail", "mail", "live", "outlook", "gmx"]);

  // Default lists of common top-level domain names
  const _standardTopLevelNames = Object.freeze([
    "com", "com.au", "com.tw", "ca", "co.nz", "co.uk", "de", "fr", "it", "ru",
    "net", "org", "edu", "gov", "jp", "nl", "kr", "se", "eu", "ie", "co.il",
    "us", "at", "be", "dk", "hk", "es", "gr", "ch", "no", "cz", "in", "net.au",
    "info", "biz", "mil", "co.jp", "sg", "hu"
  ]);

  /**
   * Computes the Sift3 string distance between two input strings.
   * This algorithm is efficient for short strings and sensitive to transpositions.
   * Reference: http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html
   * @param {string} strA - The first string.
   * @param {string} strB - The second string.
   * @returns {number} The calculated Sift3 distance.
   */
  function _calculateSift3Distance(strA, strB) {
    // Handle edge cases for empty or null strings
    if (!strA || strA.length === 0) {
      return strB ? strB.length : 0;
    }
    if (!strB || strB.length === 0) {
      return strA.length;
    }

    let currentCursor = 0;
    let offsetOne = 0;
    let offsetTwo = 0;
    let matchingChars = 0;
    const maxSearchOffset = 5; // Maximum offset to look for transpositions

    while ((currentCursor + offsetOne < strA.length) && (currentCursor + offsetTwo < strB.length)) {
      if (strA.charAt(currentCursor + offsetOne) === strB.charAt(currentCursor + offsetTwo)) {
        matchingChars++;
      } else {
        offsetOne = 0;
        offsetTwo = 0;
        // Search for transpositions within a small window
        for (let i = 0; i < maxSearchOffset; i++) {
          if ((currentCursor + i < strA.length) && (strA.charAt(currentCursor + i) === strB.charAt(currentCursor))) {
            offsetOne = i;
            break;
          }
          if ((currentCursor + i < strB.length) && (strA.charAt(currentCursor) === strB.charAt(currentCursor + i))) {
            offsetTwo = i;
            break;
          }
        }
      }
      currentCursor++;
    }
    // The Sift3 formula for distance calculation
    return (strA.length + strB.length) / 2 - matchingChars;
  }

  /**
   * Cleans and encodes an email string to ensure it's safe for comparison
   * and adheres to common email character rules, preventing XSS.
   * @param {string} rawAddress - The raw email address string.
   * @returns {string} The processed and sanitized email string.
   */
  function _normalizeAndSanitizeEmail(rawAddress) {
    if (typeof rawAddress !== 'string') {
        return ''; // Return an empty string for non-string inputs
    }
    let processed = encodeURI(rawAddress);
    // Explicitly decode characters that are valid in email addresses but encoded by encodeURI
    processed = processed
      .replace(/%20/g, ' ') // Space
      .replace(/%25/g, '%') // Percent
      .replace(/%5E/g, '^') // Caret
      .replace(/%60/g, '`') // Backtick
      .replace(/%7B/g, '{') // Left brace
      .replace(/%7C/g, '|') // Pipe
      .replace(/%7D/g, '}'); // Right brace
    return processed;
  }

  /**
   * Parses an email address string into its local part, full domain,
   * second-level domain (SLD), and top-level domain (TLD).
   * @param {string} emailStr - The email address string to dissect.
   * @returns {object|null} An object containing parsed components, or null if invalid format.
   */
  function _dissectEmailAddress(emailStr) {
    if (!emailStr || typeof emailStr !== 'string' || emailStr.length === 0) {
      return null;
    }

    const trimmedAddress = emailStr.trim();
    const addressSegments = trimmedAddress.split('@');

    // An email must have at least two parts (local@domain) and a non-empty local part.
    if (addressSegments.length < 2 || addressSegments[0].length === 0) {
      return null;
    }

    // Ensure no intermediate empty segments (e.g., "user@@domain.com")
    if (addressSegments.some(segment => segment.length === 0)) {
        return null;
    }

    const fullDomainPart = addressSegments.pop(); // The last segment is the domain
    const localUserIdentifier = addressSegments.join('@'); // Rejoin if local part contained '@'

    const domainSubparts = fullDomainPart.split('.');
    if (domainSubparts.length === 0) {
      return null; // Domain must have at least one part
    }

    let topLevelName = '';
    let secondLevelName = '';

    if (domainSubparts.length === 1) {
      // Example: "user@localhost" or "user@com" (RFC-valid but uncommon)
      topLevelName = domainSubparts[0];
      secondLevelName = ''; // No distinct second-level domain
    } else {
      // Standard case: sld.tld or sub.sld.tld
      secondLevelName = domainSubparts[0];
      topLevelName = domainSubparts.slice(1).join('.'); // Combine remaining for TLD
    }

    return {
      tld: topLevelName,
      sld: secondLevelName,
      fullDomain: fullDomainPart,
      localPart: localUserIdentifier
    };
  }

  /**
   * Searches a list of candidates for the closest match to a target string,
   * using a specified distance function and threshold.
   * @param {string} targetString - The string to find a match for.
   * @param {string[]} candidateList - An array of strings to search within.
   * @param {Function} distanceCalculator - The function to compute string distance.
   * @param {number} currentTolerance - The maximum allowed distance for a match.
   * @returns {string|null} The closest matching string if within tolerance, otherwise null.
   */
  function _findBestStringMatch(targetString, candidateList, distanceCalculator, currentTolerance) {
    if (!targetString || typeof targetString !== 'string' || !candidateList || candidateList.length === 0) {
      return null;
    }

    const effectiveDistanceFunc = distanceCalculator || _calculateSift3Distance;
    const effectiveTolerance = currentTolerance !== undefined ? currentTolerance : _similarityThresholds.primaryDomainTolerance;

    let minimumAchievedDistance = Infinity;
    let bestMatchingCandidate = null;

    for (const candidate of candidateList) {
      if (targetString === candidate) {
        return targetString; // Exact match found, return immediately
      }
      const currentDistance = effectiveDistanceFunc(targetString, candidate);
      if (currentDistance < minimumAchievedDistance) {
        minimumAchievedDistance = currentDistance;
        bestMatchingCandidate = candidate;
      }
    }

    return (minimumAchievedDistance <= effectiveTolerance && bestMatchingCandidate !== null) ? bestMatchingCandidate : null;
  }

  /**
   * Generates a suggested email address correction based on common domain misspellings.
   * It attempts to correct the full domain, then falls back to correcting SLD and TLD separately.
   * @param {string} emailAddressInput - The email address string to check for suggestions.
   * @param {string[]} configuredFullDomains - List of full domains to use for suggestions.
   * @param {string[]} configuredSlds - List of second-level domains for suggestions.
   * @param {string[]} configuredTlds - List of top-level domains for suggestions.
   * @param {Function} customDistanceFunc - Optional custom distance function.
   * @returns {object|null} An object with `localPart`, `suggestedDomain`, `fullSuggestedEmail`
   *                        if a suggestion is found, otherwise null.
   */
  function _proposeEmailCorrection(emailAddressInput, configuredFullDomains, configuredSlds, configuredTlds, customDistanceFunc) {
    const lowercasedEmail = emailAddressInput.toLowerCase();
    const parsedComponents = _dissectEmailAddress(lowercasedEmail);

    if (!parsedComponents) {
      return null; // Invalid email format, no suggestion possible
    }

    // --- Phase 1: Check for full domain correction ---
    const correctedFullDomain = _findBestStringMatch(
      parsedComponents.fullDomain,
      configuredFullDomains,
      customDistanceFunc,
      _similarityThresholds.completeDomainTolerance
    );

    if (correctedFullDomain) {
      if (correctedFullDomain === parsedComponents.fullDomain) {
        // The domain is already a perfect match from the list, no correction needed.
        return null;
      } else {
        // Found a close match for the entire domain.
        return {
          localPart: parsedComponents.localPart,
          suggestedDomain: correctedFullDomain,
          fullSuggestedEmail: `${parsedComponents.localPart}@${correctedFullDomain}`
        };
      }
    }

    // --- Phase 2: If no full domain correction, try to correct SLD and TLD separately ---
    let evolvingDomain = parsedComponents.fullDomain;
    let domainModified = false;

    // Check for Second-Level Domain (SLD) correction
    const correctedSld = _findBestStringMatch(
      parsedComponents.sld,
      configuredSlds,
      customDistanceFunc,
      _similarityThresholds.secondaryDomainTolerance
    );

    if (correctedSld && correctedSld !== parsedComponents.sld) {
      // Replace only the first occurrence of the SLD to avoid issues in complex domains
      evolvingDomain = evolvingDomain.replace(parsedComponents.sld, correctedSld);
      domainModified = true;
    }

    // Check for Top-Level Domain (TLD) correction
    const correctedTld = _findBestStringMatch(
      parsedComponents.tld,
      configuredTlds,
      customDistanceFunc,
      _similarityThresholds.primaryDomainTolerance
    );

    if (correctedTld && correctedTld !== parsedComponents.tld) {
      // Replace the TLD part more robustly by finding the last instance of the original TLD
      const tldReplacementIndex = evolvingDomain.lastIndexOf(parsedComponents.tld);
      if (tldReplacementIndex !== -1 && tldReplacementIndex + parsedComponents.tld.length === evolvingDomain.length) {
          // Only replace if the TLD is at the very end of the domain string
          evolvingDomain = evolvingDomain.substring(0, tldReplacementIndex) + correctedTld;
      } else {
          // Fallback for less precise TLD replacement if the above condition isn't met
          // (e.g., 'example.cmo' where 'cmo' is not the actual TLD but misspelled)
          evolvingDomain = evolvingDomain.replace(parsedComponents.tld, correctedTld);
      }
      domainModified = true;
    }

    if (domainModified) {
      return {
        localPart: parsedComponents.localPart,
        suggestedDomain: evolvingDomain,
        fullSuggestedEmail: `${parsedComponents.localPart}@${evolvingDomain}`
      };
    }

    // No significant correction found after all checks
    return null;
  }

  // --- Public API Definition ---
  const publicInterface = {
    // Expose modifiable configuration settings
    settings: _similarityThresholds,

    // Expose default lists (can be overridden in options for `check` method)
    defaultFullDomainList: _standardFullDomains,
    defaultSecondLevelDomainList: _standardSecondLevelNames,
    defaultTopLevelDomainList: _standardTopLevelNames,

    // Expose internal utility functions for advanced users or testing (prefixed with underscore)
    _internal: {
      calculateDistance: _calculateSift3Distance,
      parseEmailComponents: _dissectEmailAddress,
      findClosestCandidate: _findBestStringMatch,
      cleanEmailString: _normalizeAndSanitizeEmail
    },

    /**
     * Initiates the email suggestion process.
     * @param {object} options - Configuration object for the check.
     * @param {string} options.email - The email address string to be checked.
     * @param {string[]} [options.fullDomains] - Custom list of full domains.
     * @param {string[]} [options.secondLevelDomains] - Custom list of SLDs.
     * @param {string[]} [options.topLevelDomains] - Custom list of TLDs.
     * @param {Function} [options.distanceFunction] - Custom string distance function.
     * @param {Function} [options.onSuggestionFound] - Callback function for when a suggestion is found.
     * @param {Function} [options.onNoSuggestionFound] - Callback function for when no suggestion is found.
     * @returns {object|null} The suggestion object if a correction is found, otherwise null.
     */
    checkEmailForSuggestions: function(options) {
      // Validate input options
      if (!options || typeof options.email !== 'string' || options.email.length === 0) {
        console.warn("DomainSuggester: Invalid or empty email provided in options for 'checkEmailForSuggestions'.");
        if (typeof options.onNoSuggestionFound === 'function') {
            options.onNoSuggestionFound(); // Inform caller that no suggestion could be made due to bad input
        }
        return null;
      }

      // Consolidate and apply default values for all parameters
      const processingOptions = {
        fullDomains: options.fullDomains || publicInterface.defaultFullDomainList,
        secondLevelDomains: options.secondLevelDomains || publicInterface.defaultSecondLevelDomainList,
        topLevelDomains: options.topLevelDomains || publicInterface.defaultTopLevelDomainList,
        distanceFunction: options.distanceFunction || _calculateSift3Distance,
        onSuggestionFound: options.onSuggestionFound || (() => {}), // Default to a no-op function
        onNoSuggestionFound: options.onNoSuggestionFound || (() => {}) // Default to a no-op function
      };

      const cleanedEmail = publicInterface._internal.cleanEmailString(options.email);
      const correctionResult = _proposeEmailCorrection(
        cleanedEmail,
        processingOptions.fullDomains,
        processingOptions.secondLevelDomains,
        processingOptions.topLevelDomains,
        processingOptions.distanceFunction
      );

      if (correctionResult) {
        processingOptions.onSuggestionFound(correctionResult);
        return correctionResult;
      } else {
        processingOptions.onNoSuggestionFound();
        return null;
      }
    }
  };

  return publicInterface;

})(); // End of IIFE for DomainSuggester

// --- Module Export Mechanisms ---

// CommonJS/Node.js environment export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DomainSuggester;
}

// AMD (Asynchronous Module Definition) environment export
if (typeof define === "function" && define.amd) {
  define("domainSuggester", [], function() {
    return DomainSuggester;
  });
}

// jQuery plugin integration for browser environments
if (typeof window !== 'undefined' && window.jQuery) {
  (function($){
    // Extends jQuery's prototype with a new method for convenience
    $.fn.suggestDomainCorrection = function(userProvidedOptions) {
      const $currentElement = $(this); // Reference to the jQuery element

      // Create a working copy of options to modify callbacks
      let effectiveOptions = { ...userProvidedOptions };

      // Wrap the 'onSuggestionFound' callback to pass the jQuery element
      if (typeof effectiveOptions.onSuggestionFound === 'function') {
        const originalSuggestionCallback = effectiveOptions.onSuggestionFound;
        effectiveOptions.onSuggestionFound = function(suggestionDetails) {
          // Call original callback with the DOM element as 'this' context and jQuery element as first argument
          originalSuggestionCallback.call($currentElement[0], $currentElement, suggestionDetails);
        };
      }

      // Wrap the 'onNoSuggestionFound' callback to pass the jQuery element
      if (typeof effectiveOptions.onNoSuggestionFound === 'function') {
        const originalNoSuggestionCallback = effectiveOptions.onNoSuggestionFound;
        effectiveOptions.onNoSuggestionFound = function() {
          // Call original callback with the DOM element as 'this' context and jQuery element as first argument
          originalNoSuggestionCallback.call($currentElement[0], $currentElement);
        };
      }

      // Ensure the email property is populated from the input element's value
      if (!effectiveOptions.email) {
          effectiveOptions.email = $currentElement.val();
      }

      // Execute the core suggestion logic and return its result
      return DomainSuggester.checkEmailForSuggestions(effectiveOptions);
    };
  })(window.jQuery);
}