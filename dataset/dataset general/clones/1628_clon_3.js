// This module provides a robust utility for managing browser cookies, offering both read and write capabilities.
// It is an advanced adaptation inspired by the jQuery Cookie Plugin.
// Licensing: This code is released under the MIT License, allowing for free use, modification, and distribution.

(function (moduleInitializer) {
    // Attempt to integrate with an Asynchronous Module Definition (AMD) loader like RequireJS.
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], moduleInitializer);
    }
    // Fallback for standard browser environments, checking for a global jQuery object.
    else if (typeof window !== 'undefined' && typeof window.jQuery !== 'undefined') {
        moduleInitializer(window.jQuery);
    }
    // If jQuery is not found, issue a warning and provide a NO-OP placeholder.
    else {
        console.warn("Cookie management utility requires jQuery. Functionality will be severely limited or unavailable.");
        moduleInitializer(function() { /* Placeholder for jQuery if not found. */ });
    }
}(function (hostLib) { // The 'hostLib' parameter represents the jQuery object passed in.

    // A regular expression to find all '+' characters globally.
    // This is crucial for correctly decoding cookie values where '+' represents a space.
    const urlPlusToSpaceConverter = new RegExp('\\+', 'g');

    /**
     * Decodes a given string, handling URI encoding and the '+' to space conversion.
     * It respects the raw content handling setting of the cookie manager.
     * @param {string} rawInputString The string segment to be decoded.
     * @returns {string} The fully decoded string.
     */
    function decodeCookieComponent(rawInputString) {
        // If raw content handling is enabled, return the string without decoding.
        if (cookieManager.rawContentHandling) {
            return rawInputString;
        }
        // Basic validation: ensure the input is indeed a string.
        if (typeof rawInputString !== 'string') {
            console.warn("Non-string input provided for cookie component decoding:", rawInputString);
            return String(rawInputString); // Coerce to string and proceed.
        }

        // First, replace '+' characters with spaces, then perform URI decoding.
        const intermediateResult = rawInputString.replace(urlPlusToSpaceConverter, ' ');
        try {
            return decodeURIComponent(intermediateResult);
        } catch (decodingError) {
            // Log any errors during URI decoding and return the original string to prevent data loss.
            console.error("Failed to decode URI component:", intermediateResult, decodingError);
            return rawInputString;
        }
    }

    /**
     * Parses a raw cookie value string, handling RFC2068 quoted strings and optional JSON deserialization.
     * @param {string} rawValueString The raw value part of a cookie.
     * @returns {*} The parsed value, which could be a string, object, or array.
     */
    function parseCookieValueContent(rawValueString) {
        let currentProcessedValue = rawValueString;

        // Check for RFC2068 quoted cookie values (starts and ends with a double quote).
        if (currentProcessedValue.length > 1 && currentProcessedValue.charAt(0) === '"' && currentProcessedValue.charAt(currentProcessedValue.length - 1) === '"') {
            // Remove the outer quotes and unescape any internal escaped quotes or backslashes.
            currentProcessedValue = currentProcessedValue.substring(1, currentProcessedValue.length - 1)
                                                       .replace(/\\"/g, '"')
                                                       .replace(/\\\\/g, '\\');
        }

        // Apply the standard decoding process (URI and plus-to-space).
        const fullyDecodedValue = decodeCookieComponent(currentProcessedValue);

        // If JSON serialization is enabled, attempt to parse the value as JSON.
        if (cookieManager.jsonSerializationEnabled) {
            try {
                return JSON.parse(fullyDecodedValue);
            } catch (jsonParsingIssue) {
                // If JSON parsing fails, log a debug message and return the plain decoded string.
                console.debug("JSON parsing failed for cookie value:", fullyDecodedValue, jsonParsingIssue);
                return fullyDecodedValue;
            }
        }
        return fullyDecodedValue;
    }

    /**
     * Calculates and returns an expiration Date object based on the input.
     * @param {number|Date} expiryDurationOrDate Either the number of days until expiration, or a specific Date object.
     * @returns {Date|null} The calculated expiration Date object, or null if no valid expiration is provided.
     */
    function computeExpirationDate(expiryDurationOrDate) {
        if (typeof expiryDurationOrDate === 'number') {
            const calculatedDate = new Date();
            calculatedDate.setDate(calculatedDate.getDate() + expiryDurationOrDate);
            return calculatedDate;
        } else if (expiryDurationOrDate instanceof Date) {
            return expiryDurationOrDate;
        }
        return null; // No valid expiration specified.
    }

    // The core cookie management function, exposed as 'hostLib.cookieUtil'.
    // This function can both set (write) and retrieve (read) cookies.
    const cookieManager = hostLib.cookieUtil = function (cookieIdentifier, cookieContent, operationalSettings) {

        // --- Cookie Writing Operations (Setter) ---
        // If 'cookieContent' is defined, we are performing a write operation.
        if (cookieContent !== undefined) {
            // Merge default settings with any provided operational settings.
            const effectiveSettings = hostLib.extend({}, cookieManager.defaultConfiguration, operationalSettings);

            // Basic validation for the cookie identifier.
            if (!cookieIdentifier || typeof cookieIdentifier !== 'string') {
                console.error("Invalid cookie identifier provided for writing:", cookieIdentifier);
                return null; // Indicate failure.
            }

            let finalValueForStorage;
            // Apply JSON serialization if configured.
            if (cookieManager.jsonSerializationEnabled) {
                finalValueForStorage = JSON.stringify(cookieContent);
            } else {
                finalValueForStorage = String(cookieContent); // Ensure the value is stringified.
            }

            // Determine the expiration date.
            const expirationDateObject = computeExpirationDate(effectiveSettings.expires);

            // Build the cookie string components.
            const cookieParts = [
                cookieManager.rawContentHandling ? cookieIdentifier : encodeURIComponent(cookieIdentifier),
                '=',
                cookieManager.rawContentHandling ? finalValueForStorage : encodeURIComponent(finalValueForStorage)
            ];

            // Append expiration date if available.
            if (expirationDateObject) {
                cookieParts.push('; expires=' + expirationDateObject.toUTCString());
            }

            // Append other optional cookie attributes.
            if (effectiveSettings.path) {
                cookieParts.push('; path=' + effectiveSettings.path);
            }
            if (effectiveSettings.domain) {
                cookieParts.push('; domain=' + effectiveSettings.domain);
            }
            if (effectiveSettings.isSecure) { // Renamed 'secure' to 'isSecure' for clarity.
                cookieParts.push('; secure');
            }
            if (effectiveSettings.sameSitePolicy) { // Added 'sameSitePolicy' option.
                cookieParts.push('; SameSite=' + effectiveSettings.sameSitePolicy);
            }

            // Construct the final cookie string and attempt to set it.
            const completeCookieString = cookieParts.join('');
            try {
                document.cookie = completeCookieString;
                console.debug("Cookie set successfully:", completeCookieString);
                return completeCookieString; // Return the string for confirmation.
            } catch (settingError) {
                console.error("Failed to set cookie:", completeCookieString, settingError);
                return null; // Indicate failure in setting the cookie.
            }
        }

        // --- Cookie Reading Operations (Getter) ---
        // If 'cookieContent' is undefined, we are performing a read operation.
        const allBrowserCookies = document.cookie.split('; ');
        let collectedData = cookieIdentifier ? undefined : {}; // Initialize based on whether a specific key is requested.
        let targetCookieFound = false; // Flag to track if the specific requested cookie is found.

        // Handle case where no cookies are present or only an empty string.
        if (allBrowserCookies.length === 0 || (allBrowserCookies.length === 1 && allBrowserCookies[0] === '')) {
            return collectedData;
        }

        // Iterate through each cookie entry found in document.cookie.
        for (let currentIndex = 0; currentIndex < allBrowserCookies.length; currentIndex++) {
            const currentEntry = allBrowserCookies[currentIndex];
            const firstEqualsSign = currentEntry.indexOf('=');

            let currentEntryName;
            let currentEntryValue;

            // Robustly parse cookie name and value, handling cases with no '=' or multiple '=' signs.
            if (firstEqualsSign === -1) {
                // If no '=', treat the whole string as the name, with an empty value.
                currentEntryName = decodeCookieComponent(currentEntry);
                currentEntryValue = '';
            } else {
                currentEntryName = decodeCookieComponent(currentEntry.substring(0, firstEqualsSign));
                currentEntryValue = currentEntry.substring(firstEqualsSign + 1);
            }

            // If a specific cookie identifier is provided, look for a match.
            if (cookieIdentifier && cookieIdentifier === currentEntryName) {
                collectedData = parseCookieValueContent(currentEntryValue);
                targetCookieFound = true;
                break; // Exit loop early once the target cookie is found.
            }

            // If no specific cookie is requested, collect all of them into an object.
            if (!cookieIdentifier && collectedData) { // Ensure collectedData is an object for aggregation.
                collectedData[currentEntryName] = parseCookieValueContent(currentEntryValue);
            }
        }
        
        // If a specific identifier was requested but not found, return undefined.
        if (cookieIdentifier && !targetCookieFound) {
            return undefined;
        }

        return collectedData;
    };

    // Default configuration object for all cookie operations.
    cookieManager.defaultConfiguration = {
        // expires: undefined, // Default expiration is session-based.
        // path: '/', // Often a sensible default, but not set by original.
        // domain: undefined,
        // isSecure: false,
        // sameSitePolicy: 'Lax' // Example of a newly added default for SameSite.
    };

    // Global flags to control cookie behavior.
    cookieManager.jsonSerializationEnabled = false; // Controls automatic JSON parsing/stringifying.
    cookieManager.rawContentHandling = false;     // Controls URI encoding/decoding.


    /**
     * Destroys a specified cookie by setting its expiration date to the past.
     * @param {string} cookieIdentifier The name of the cookie to be removed.
     * @param {Object} [removalOptions] Optional settings like path, domain, isSecure that must match the original cookie.
     * @returns {boolean} True if the cookie was found and removal attempted, false otherwise.
     */
    hostLib.destroyCookie = function (cookieIdentifier, removalOptions) {
        // Validate the cookie identifier.
        if (!cookieIdentifier || typeof cookieIdentifier !== 'string') {
            console.error("Invalid cookie identifier provided for destruction:", cookieIdentifier);
            return false;
        }

        // First, check if the cookie actually exists. This provides better feedback.
        const existingCookieValue = hostLib.cookieUtil(cookieIdentifier);
        if (existingCookieValue === undefined) {
            console.debug("Attempted to remove a non-existent cookie:", cookieIdentifier);
            return false; // Cookie was not found.
        }

        // Merge removal options, ensuring 'expires' is set to a past date (-1 day).
        const specificRemovalSettings = hostLib.extend({}, removalOptions, { expires: -1 });

        // Call the main utility to set the cookie with an empty value and an expired date.
        const removalExecutionResult = hostLib.cookieUtil(cookieIdentifier, '', specificRemovalSettings);

        if (removalExecutionResult !== null) { // Assuming 'null' indicates a failure to set.
            console.log("Cookie destruction initiated for:", cookieIdentifier);
            return true;
        } else {
            console.error("Failed to initiate cookie destruction for:", cookieIdentifier);
            return false;
        }
    };

}));