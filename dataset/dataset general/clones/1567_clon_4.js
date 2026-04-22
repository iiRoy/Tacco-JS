const AddressValidationTool = {
  // Renamed constants for default thresholds
  domainProximityThreshold: 2,
  secondLevelProximityThreshold: 2,
  topLevelProximityThreshold: 2,

  // Renamed and frozen default domain lists
  standardDomains: Object.freeze([
    'msn.com', 'bellsouth.net', 'telus.net', 'comcast.net', 'optusnet.com.au',
    'earthlink.net', 'qq.com', 'sky.com', 'icloud.com', 'mac.com', 'sympatico.ca',
    'googlemail.com', 'att.net', 'xtra.co.nz', 'web.de', 'cox.net', 'gmail.com',
    'ymail.com', 'aim.com', 'rogers.com', 'verizon.net', 'rocketmail.com',
    'google.com', 'optonline.net', 'sbcglobal.net', 'aol.com', 'me.com',
    'btinternet.com', 'charter.net', 'shaw.ca'
  ]),

  standardSecondaryDomains: Object.freeze([
    "yahoo", "hotmail", "mail", "live", "outlook", "gmx"
  ]),

  standardTopLevelDomains: Object.freeze([
    "com", "com.au", "com.tw", "ca", "co.nz", "co.uk", "de", "fr", "it", "ru",
    "net", "org", "edu", "gov", "jp", "nl", "kr", "se", "eu", "ie", "co.il",
    "us", "at", "be", "dk", "hk", "es", "gr", "ch", "no", "cz", "in", "net",
    "net.au", "info", "biz", "mil", "co.jp", "sg", "hu"
  ]),

  // Private helper method for string distance calculation (Sift3 algorithm)
  #calculateStringProximity: function(str1, str2) {
    if (!str1 || str1.length === 0) {
      return str2 ? str2.length : 0;
    }
    if (!str2 || str2.length === 0) {
      return str1.length;
    }

    let matchCount = 0;
    let currentOffset1 = 0;
    let currentOffset2 = 0;
    const maxScanOffset = 5;

    for (let currentPosition = 0;
         currentPosition + currentOffset1 < str1.length && currentPosition + currentOffset2 < str2.length;
         currentPosition++) {
      if (str1.charAt(currentPosition + currentOffset1) === str2.charAt(currentPosition + currentOffset2)) {
        matchCount++;
      } else {
        currentOffset1 = 0;
        currentOffset2 = 0;
        for (let j = 0; j < maxScanOffset; j++) {
          if ((currentPosition + j < str1.length) && (str1.charAt(currentPosition + j) === str2.charAt(currentPosition))) {
            currentOffset1 = j;
            break;
          }
          if ((currentPosition + j < str2.length) && (str1.charAt(currentPosition) === str2.charAt(currentPosition + j))) {
            currentOffset2 = j;
            break;
          }
        }
      }
    }
    return (str1.length + str2.length) / 2 - matchCount;
  },

  // Private helper method to parse an email address into its constituent parts
  #parseEmailAddress: function(fullInput) {
    const cleanedInput = fullInput.trim();
    const components = cleanedInput.split('@');

    if (components.length < 2 || components.some(part => part === '')) {
      return null; // Invalid format if no '@' or empty parts
    }

    const domainPart = components.pop();
    const userPart = components.join('@'); // Rejoin local part if it contained '@'

    const domainSegments = domainPart.split('.');

    if (domainSegments.length === 0) {
      return null; // Domain is empty
    }

    let parsedSld = '';
    let parsedTld = '';

    if (domainSegments.length === 1) {
      // e.g., "user@localhost" or "user@com"
      parsedTld = domainSegments[0];
    } else {
      // e.g., "user@example.com"
      parsedSld = domainSegments[0];
      parsedTld = domainSegments.slice(1).join('.'); // Join remaining segments for TLD (e.g., "co.uk")
    }

    return {
      tldIdentifier: parsedTld,
      sldIdentifier: parsedSld,
      fullIdentifier: domainPart,
      userIdentifier: userPart
    };
  },

  // Private helper method to normalize and sanitize the email input string
  #prepareEmailInput: function(rawString) {
    // Encode URI, then apply specific replacements for allowed characters
    const uriEncoded = encodeURI(rawString.toLowerCase());
    const characterReplacements = {
      '%20': ' ', '%25': '%', '%5E': '^',
      '%60': '`', '%7B': '{', '%7C': '|',
      '%7D': '}'
    };
    // Use a regex with a replacer function for a different approach than chained .replace()
    return uriEncoded.replace(/%20|%25|%5E|%60|%7B|%7C|%7D/g, (match) => characterReplacements[match]);
  },

  // Private helper method to find the closest matching element in a list
  #searchForNearestElement: function(targetElement, elementList, metricMethod, proximityLimit) {
    if (!targetElement || !elementList || elementList.length === 0) {
      return null;
    }

    let minimumDistance = Infinity;
    let closestCandidate = null;

    // Use a for...of loop for iteration, a different syntax from traditional for (var i...)
    for (const candidate of elementList) {
      if (targetElement === candidate) {
        return candidate; // Exact match found, return immediately as it's the best possible
      }
      const currentElementDistance = metricMethod(targetElement, candidate);
      if (currentElementDistance < minimumDistance) {
        minimumDistance = currentElementDistance;
        closestCandidate = candidate;
      }
    }

    if (minimumDistance <= proximityLimit && closestCandidate !== null) {
      return closestCandidate;
    } else {
      return null;
    }
  },

  // Private helper method containing the core logic for determining email address corrections
  #determineProposedCorrection: function(parsedData, domainList, sldList, tldList, metricFunction, domainThreshold, sldThreshold, tldThreshold) {
    const currentDomain = parsedData.fullIdentifier;
    const currentSld = parsedData.sldIdentifier;
    const currentTld = parsedData.tldIdentifier;
    const userPart = parsedData.userIdentifier;

    // First, check for a full domain correction
    const bestDomainMatch = AddressValidationTool.#searchForNearestElement(
      currentDomain,
      domainList,
      metricFunction,
      domainThreshold
    );

    if (bestDomainMatch) {
      if (bestDomainMatch === currentDomain) {
        return null; // Exact domain match, no suggestion needed
      } else {
        return {
          userSegment: userPart,
          suggestedDomainSegment: bestDomainMatch,
          fullProposedAddress: `${userPart}@${bestDomainMatch}`
        };
      }
    }

    // If no full domain correction, check for SLD and TLD misspellings
    let modifiedDomain = currentDomain;
    let modificationFlag = false; // Flag to indicate if any part of the domain was changed

    const bestSldMatch = AddressValidationTool.#searchForNearestElement(
      currentSld,
      sldList,
      metricFunction,
      sldThreshold
    );

    if (bestSldMatch && bestSldMatch !== currentSld) {
      // Replace the SLD. Using indexOf for a different approach to locate the part.
      const sldPosition = modifiedDomain.indexOf(currentSld);
      if (sldPosition !== -1) {
        modifiedDomain = modifiedDomain.substring(0, sldPosition) +
                         bestSldMatch +
                         modifiedDomain.substring(sldPosition + currentSld.length);
        modificationFlag = true;
      }
    }

    const bestTldMatch = AddressValidationTool.#searchForNearestElement(
      currentTld,
      tldList,
      metricFunction,
      tldThreshold
    );

    if (bestTldMatch && bestTldMatch !== currentTld) {
      // Replace the TLD. Using lastIndexOf to ensure TLD at the end.
      const tldPosition = modifiedDomain.lastIndexOf(currentTld);
      if (tldPosition !== -1 && tldPosition + currentTld.length === modifiedDomain.length) {
        modifiedDomain = modifiedDomain.substring(0, tldPosition) + bestTldMatch;
        modificationFlag = true;
      }
    }

    if (modificationFlag) {
      return {
        userSegment: userPart,
        suggestedDomainSegment: modifiedDomain,
        fullProposedAddress: `${userPart}@${modifiedDomain}`
      };
    }

    return null; // No suitable suggestion found
  },

  // The primary entry point for the validation tool, mimicking the original `run` method's signature
  executeValidation: function(configuration) {
    const userEmail = configuration.email;
    const candidateDomains = configuration.domains || AddressValidationTool.standardDomains;
    const candidateSecondLevels = configuration.secondLevelDomains || AddressValidationTool.standardSecondaryDomains;
    const candidateTopLevels = configuration.topLevelDomains || AddressValidationTool.standardTopLevelDomains;
    const proximityMethod = configuration.distanceFunction || AddressValidationTool.#calculateStringProximity;

    const domainLimit = configuration.domainThreshold || AddressValidationTool.domainProximityThreshold;
    const sldLimit = configuration.secondLevelThreshold || AddressValidationTool.secondLevelProximityThreshold;
    const tldLimit = configuration.topLevelThreshold || AddressValidationTool.topLevelProximityThreshold;

    const successAction = configuration.suggested || ((result) => result); // Default callback
    const failureAction = configuration.empty || (() => null); // Default callback

    const preparedEmail = AddressValidationTool.#prepareEmailInput(userEmail);
    const emailData = AddressValidationTool.#parseEmailAddress(preparedEmail);

    if (!emailData) {
      return failureAction();
    }

    const proposedResult = AddressValidationTool.#determineProposedCorrection(
      emailData,
      candidateDomains,
      candidateSecondLevels,
      candidateTopLevels,
      proximityMethod,
      domainLimit,
      sldLimit,
      tldLimit
    );

    if (proposedResult) {
      // Structure the result to match the original's callback format
      return successAction({
        address: proposedResult.userSegment,
        domain: proposedResult.suggestedDomainSegment,
        full: proposedResult.fullProposedAddress
      });
    } else {
      return failureAction();
    }
  }
};