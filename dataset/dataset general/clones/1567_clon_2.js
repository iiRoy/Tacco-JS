/*
 * Input Correction Utility https://example.com/inputcorrector
 * Creator
 * Derek K. (@dk_dev)
 *
 * Distributed under the MIT License, version 1.0.
 *
 * v 1.1.0-beta
 */

var InputCorrector = {
    // Threshold for domain-level similarity checks
    zoneLimit: 2,
    // Threshold for second-level domain similarity checks
    subZoneLimit: 2,
    // Threshold for top-level domain similarity checks
    rootZoneLimit: 2,

    // A list of common email domains for suggestions
    standardZones: ['msn.com', 'bellsouth.net', 'telus.net', 'comcast.net',
      'optusnet.com.au', 'earthlink.net', 'qq.com', 'sky.com', 'icloud.com',
      'mac.com', 'sympatico.ca', 'googlemail.com', 'att.net', 'xtra.co.nz',
      'web.de', 'cox.net', 'gmail.com', 'ymail.com', 'aim.com', 'rogers.com',
      'verizon.net', 'rocketmail.com', 'google.com', 'optonline.net',
      'sbcglobal.net', 'aol.com', 'me.com', 'btinternet.com', 'charter.net',
      'shaw.ca'],

    // A collection of standard second-level domain parts
    standardSubZones: ["yahoo", "hotmail", "mail", "live", "outlook", "gmx"],

    // Common top-level domain extensions
    standardRootZones: ["com", "com.au", "com.tw", "ca", "co.nz", "co.uk", "de",
      "fr", "it", "ru", "net", "org", "edu", "gov", "jp", "nl", "kr", "se", "eu",
      "ie", "co.il", "us", "at", "be", "dk", "hk", "es", "gr", "ch", "no", "cz",
      "in", "net", "net.au", "info", "biz", "mil", "co.jp", "sg", "hu"],

    // Main function to initiate the email correction process
    processInput: function(config) {
        // Assign default domain lists if not provided in configuration
        config.domains = config.domains || InputCorrector.standardZones;
        config.secondLevelDomains = config.secondLevelDomains || InputCorrector.standardSubZones;
        config.topLevelDomains = config.topLevelDomains || InputCorrector.standardRootZones;
        // Assign default distance function if not specified
        config.distanceFunction = config.distanceFunction || InputCorrector.charDiffAlgo;

        // Define a default handler for results
        var baseHandler = function(finding) { return finding; };
        // Use provided suggested callback or the default one
        var recommendHandler = config.suggested || baseHandler;
        // Use provided empty callback or the default one
        var emptyHandler = config.empty || baseHandler;

        // Generate a suggestion based on the sanitized email and provided lists
        var outcome = InputCorrector.generateSuggestion(
            InputCorrector.sanitizeInput(config.email),
            config.domains,
            config.secondLevelDomains,
            config.topLevelDomains,
            config.distanceFunction
        );

        // Return the outcome using the appropriate handler
        return outcome ? recommendHandler(outcome) : emptyHandler();
    },

    // Generates a potential correction for an email address
    generateSuggestion: function(inputAddr, zoneList, subZoneList, rootZoneList, similarityMeasure) {
        // Normalize the input address to lowercase
        inputAddr = inputAddr.toLowerCase();

        // Break down the email into its constituent parts
        var parsedAddr = this.dissectAddress(inputAddr);

        // Find the closest matching domain from the provided list
        var nearestZone = this.searchBestMatch(parsedAddr.domain, zoneList, similarityMeasure, this.zoneLimit);

        // If a close domain match is found
        if (nearestZone) {
            // If the domain is an exact match, no suggestion is needed
            if (nearestZone === parsedAddr.domain) {
                return false;
            } else {
                // Otherwise, return the suggested address
                return {
                    usernamePart: parsedAddr.address,
                    domain: nearestZone,
                    completeAddr: parsedAddr.address + "@" + nearestZone
                };
            }
        }

        // If no direct domain match, check for second-level and top-level domain mismatches
        var nearestSubZone = this.searchBestMatch(parsedAddr.secondLevelDomain, subZoneList, similarityMeasure, this.subZoneLimit);
        var nearestRootZone = this.searchBestMatch(parsedAddr.topLevelDomain, rootZoneList, similarityMeasure, this.rootZoneLimit);

        // Only proceed if a domain part exists
        if (parsedAddr.domain) {
            var currentZone = parsedAddr.domain;
            var isModified = false; // Flag to indicate if a modification occurred

            // Check if a second-level domain correction is possible
            if (nearestSubZone && nearestSubZone !== parsedAddr.secondLevelDomain) {
                currentZone = currentZone.replace(parsedAddr.secondLevelDomain, nearestSubZone);
                isModified = true;
            }

            // Check if a top-level domain correction is possible
            if (nearestRootZone && nearestRootZone !== parsedAddr.topLevelDomain) {
                currentZone = currentZone.replace(parsedAddr.topLevelDomain, nearestRootZone);
                isModified = true;
            }

            // If any part of the domain was modified, return the suggestion
            if (isModified === true) {
                return {
                    usernamePart: parsedAddr.address,
                    domain: currentZone,
                    completeAddr: parsedAddr.address + "@" + currentZone
                };
            }
        }

        /*
         * No close matches found, or the address is malformed.
         * Therefore, no suggestion can be confidently provided.
         */
        return false;
    },

    // Finds the domain closest to the input from a given list, within a threshold
    searchBestMatch: function(zoneName, zoneList, similarityMeasure, limit) {
        // Use default top-level threshold if no specific limit is provided
        limit = limit || this.rootZoneLimit;
        var difference;
        var minDifference = 99; // Initialize with a high value
        var bestMatchZone = null;

        // If input or list is invalid, return immediately
        if (!zoneName || !zoneList) {
            return false;
        }
        // Use default character difference algorithm if none specified
        if (!similarityMeasure) {
            similarityMeasure = this.charDiffAlgo;
        }

        // Iterate through all domains in the list
        for (var k = 0; k < zoneList.length; k++) {
            // If an exact match is found, return it immediately
            if (zoneName === zoneList[k]) {
                return zoneName;
            }
            // Calculate the difference using the provided metric
            difference = similarityMeasure(zoneName, zoneList[k]);
            // Update minimum difference and closest domain if a better match is found
            if (difference < minDifference) {
                minDifference = difference;
                bestMatchZone = zoneList[k];
            }
        }

        // If the best match is within the allowed difference limit, return it
        if (minDifference <= limit && bestMatchZone !== null) {
            return bestMatchZone;
        } else {
            // Otherwise, no suitable match found
            return false;
        }
    },

    // Implements the SIFT3 string distance algorithm
    charDiffAlgo: function(strA, strB) {
        // SIFT3 Algorithm reference: http://siderite.blogspot.com/2007/04/super-fast-and-accurate-string-distance.html
        if (strA === null || strA.length === 0) {
            if (strB === null || strB.length === 0) {
                return 0; // Both strings are empty, no difference
            } else {
                return strB.length; // String A is empty, difference is length of B
            }
        }

        if (strB === null || strB.length === 0) {
            return strA.length; // String B is empty, difference is length of A
        }

        var idx = 0;
        var offA = 0;
        var offB = 0;
        var commonSeq = 0; // Length of longest common subsequence
        var maxOff = 5; // Maximum offset for character comparison

        // Loop through characters of both strings
        while ((idx + offA < strA.length) && (idx + offB < strB.length)) {
            // If characters match, increment common subsequence count
            if (strA.charAt(idx + offA) === strB.charAt(idx + offB)) {
                commonSeq++;
            } else {
                // If characters don't match, reset offsets and search for potential matches nearby
                offA = 0;
                offB = 0;
                for (var k = 0; k < maxOff; k++) {
                    // Check for match in strA at offset k
                    if ((idx + k < strA.length) && (strA.charAt(idx + k) === strB.charAt(idx))) {
                        offA = k;
                        break;
                    }
                    // Check for match in strB at offset k
                    if ((idx + k < strB.length) && (strA.charAt(idx) === strB.charAt(idx + k))) {
                        offB = k;
                        break;
                    }
                }
            }
            idx++; // Move to the next character
        }
        // Calculate the distance based on total length and common subsequence
        return (strA.length + strB.length) / 2 - commonSeq;
    },

    // Parses an email string into its constituent parts (local, domain, second-level, top-level)
    dissectAddress: function(inputAddr) {
        var components = inputAddr.trim().split('@');

        // An email address must have at least two parts (local@domain)
        if (components.length < 2) {
            return false;
        }

        // Ensure no empty parts (e.g., "user@@domain.com")
        for (var k = 0; k < components.length; k++) {
            if (components[k] === '') {
                return false;
            }
        }

        var zoneName = components.pop(); // The last part is the domain
        var zoneComponents = zoneName.split('.');
        var secondaryLabel = ''; // Corresponds to second-level domain
        var primaryLabel = ''; // Corresponds to top-level domain

        if (zoneComponents.length === 0) {
            // Domain part is empty or malformed
            return false;
        } else if (zoneComponents.length === 1) {
            // Only a single label, assume it's the TLD (e.g., "localhost")
            primaryLabel = zoneComponents[0];
        } else {
            // Standard case: multiple labels
            secondaryLabel = zoneComponents[0];
            // Concatenate remaining parts to form the TLD
            for (var k = 1; k < zoneComponents.length; k++) {
                primaryLabel += zoneComponents[k] + '.';
            }
            primaryLabel = primaryLabel.substring(0, primaryLabel.length - 1); // Remove trailing dot
        }

        return {
            primaryLabel: primaryLabel,
            secondaryLabel: secondaryLabel,
            domain: zoneName,
            usernamePart: components.join('@') // Reconstruct local part
        };
    },

    // Encodes the email address to prevent XSS while preserving valid characters.
    // Based on official spec: http://en.wikipedia.org/wiki/Email_address#Syntax
    sanitizeInput: function(inputAddr) {
        var sanitizedString = encodeURI(inputAddr);
        // Replace specific encoded characters back to their original form
        sanitizedString = sanitizedString.replace('%20', ' ').replace('%25', '%').replace('%5E', '^')
            .replace('%60', '`').replace('%7B', '{').replace('%7C', '|')
            .replace('%7D', '}');
        return sanitizedString;
    }
};

// Export the utility object if a CommonJS environment is detected (e.g., Node.js).
// This pattern is inspired by Underscore.js.
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputCorrector;
}

// Provide support for Asynchronous Module Definition (AMD) loaders.
// Based on jQuery's AMD definition structure.
if (typeof define === "function" && define.amd) {
    define("inputcorrector", [], function() {
        return InputCorrector;
    });
}

// Integrate as a jQuery plugin if jQuery and window object are available.
if (typeof window !== 'undefined' && window.jQuery) {
    (function(jq) { // Use jq instead of $ to avoid conflicts
        jq.fn.checkInput = function(config) { // Renamed plugin function
            var currentContext = this; // Store the current jQuery element context
            if (config.suggested) {
                var originalProposed = config.suggested;
                config.suggested = function(finding) {
                    originalProposed(currentContext, finding); // Pass element and finding
                };
            }

            if (config.empty) {
                var originalEmpty = config.empty;
                config.empty = function() {
                    originalEmpty.call(null, currentContext); // Pass element to empty handler
                };
            }

            config.email = this.val(); // Get the value from the current element
            InputCorrector.processInput(config); // Run the core correction logic
        };
    })(jQuery); // Pass jQuery object to the IIFE
}