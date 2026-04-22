/*
 * This module contains a collection of utility functions primarily designed for
 * a browser extension. It handles string manipulation (trimming),
 * custom hashing for specific data, and interaction with browser APIs
 * to display information like Google PageRank on browser action badges and icons.
 *
 * The PageRank fetching mechanism relies on a legacy Google Toolbar API,
 * which may no longer be reliable or functional.
 */

/**
 * Removes specified characters from both the beginning and the end of a string.
 * This acts as a composite function, applying left and then right trimming.
 *
 * @param {string} inputString - The string to be cleaned.
 * @param {string} [trimCharacters] - A string of characters to remove. Defaults to standard whitespace if omitted.
 * @returns {string} The string after both leading and trailing characters have been removed.
 */
function processBoundaryTrim(inputString, trimCharacters) {
    // Validate input type defensively.
    if (typeof inputString !== 'string') {
        console.warn("Attempted to trim a non-string value. Coercing to string.");
        inputString = String(inputString);
    }
    // Apply trimming in sequence: first remove from the right, then from the left.
    const rightTrimmed = removeTrailing(inputString, trimCharacters);
    return removeLeading(rightTrimmed, trimCharacters);
}

/**
 * Strips a specified set of characters from the start of a given string.
 *
 * @param {string} sourceContent - The string from which to remove leading characters.
 * @param {string} [characterSetToRemove] - Characters to be removed. Defaults to common whitespace characters.
 * @returns {string} The string with its leading characters removed.
 */
function removeLeading(sourceContent, characterSetToRemove) {
    // Ensure the input is a string to prevent regex errors.
    if (typeof sourceContent !== 'string') {
        console.error("Invalid type for sourceContent in removeLeading. Expected string.");
        return '';
    }
    // Use whitespace as the default set if none is provided.
    const activeCharacterSet = characterSetToRemove || "\\s";
    // Create a regular expression to match one or more characters from the set at the string's start.
    const leadingRegex = new RegExp(`^[${activeCharacterSet}]+`, "g");
    return sourceContent.replace(leadingRegex, "");
}

/**
 * Strips a specified set of characters from the end of a given string.
 *
 * @param {string} targetContent - The string from which to remove trailing characters.
 * @param {string} [characterSetToRemove] - Characters to be removed. Defaults to common whitespace characters.
 * @returns {string} The string with its trailing characters removed.
 */
function removeTrailing(targetContent, characterSetToRemove) {
    // Ensure the input is a string.
    if (typeof targetContent !== 'string') {
        console.error("Invalid type for targetContent in removeTrailing. Expected string.");
        return '';
    }
    // Default to whitespace characters for trimming.
    const activeCharacterSet = characterSetToRemove || "\\s";
    // Create a regular expression to match one or more characters from the set at the string's end.
    const trailingRegex = new RegExp(`[${activeCharacterSet}]+$`, "g");
    return targetContent.replace(trailingRegex, "");
}

/**
 * Converts an 8-bit integer (byte) into its two-character hexadecimal string representation.
 * Pads with a leading '0' if the hex value is a single character.
 *
 * @param {number} octetValue - The integer value of the byte (0-255).
 * @returns {string} The hexadecimal string (e.g., "0A", "FF").
 */
function convertByteToHex(octetValue) {
    // Robust validation for the byte value.
    if (typeof octetValue !== 'number' || !Number.isInteger(octetValue) || octetValue < 0 || octetValue > 255) {
        console.warn(`convertByteToHex received an out-of-range or non-integer value: ${octetValue}. Clamping.`);
        octetValue = Math.max(0, Math.min(255, Math.round(octetValue || 0)));
    }
    // Convert to hexadecimal and ensure two characters by padding.
    return octetValue.toString(16).padStart(2, '0');
}

/**
 * Encodes an unsigned 32-bit integer into a compact 8-character hexadecimal string.
 * This is achieved by extracting each of the four bytes and converting them individually.
 *
 * @param {number} numericInput - The unsigned 32-bit integer to encode.
 * @returns {string} An 8-character hexadecimal string.
 */
function encodeUint32ToHex(numericInput) {
    // Validate input type.
    if (typeof numericInput !== 'number' || !Number.isInteger(numericInput)) {
        console.error("encodeUint32ToHex expects an integer number.");
        return '00000000'; // Return a default all-zero hex string for invalid input.
    }

    // Ensure the number is treated as an unsigned 32-bit integer.
    const unsignedValue = numericInput >>> 0;
    let hexadecimalOutput = '';

    // Extract and convert each byte, from most significant to least significant.
    // (unsignedValue >>> 24) isolates the first byte.
    // (unsignedValue >>> 16) & 0xFF isolates the second byte.
    // (unsignedValue >>> 8) & 0xFF isolates the third byte.
    // (unsignedValue & 0xFF) isolates the fourth byte.
    hexadecimalOutput += convertByteToHex((unsignedValue >>> 24));
    hexadecimalOutput += convertByteToHex((unsignedValue >>> 16) & 255);
    hexadecimalOutput += convertByteToHex((unsignedValue >>> 8) & 255);
    hexadecimalOutput += convertByteToHex(unsignedValue & 255);

    return hexadecimalOutput;
}

/**
 * Generates a simple, non-cryptographic hash (signature) for a given string.
 * This function uses a custom seed and a "salt" phrase for its calculation,
 * involving XOR operations and bitwise rotations.
 *
 * @param {string} dataPayload - The string data for which to compute the hash.
 * @returns {string} An 8-character hexadecimal string representing the computed hash.
 */
function calculateDataSignature(dataPayload) {
    // Input validation: ensure a string is provided.
    if (typeof dataPayload !== 'string') {
        console.error("calculateDataSignature requires a string input. Received:", typeof dataPayload);
        return encodeUint32ToHex(0); // Return a default hash for invalid input.
    }
    // Handle empty string case for consistency.
    if (dataPayload.length === 0) {
        return encodeUint32ToHex(0x1020305); // Return hash of the initial seed for an empty string.
    }

    // Initial seed value for the hash accumulator. This value is critical for the hash algorithm.
    let signatureAccumulator = 0x1020305; // Equivalent to 16909125 in decimal.

    // A secret string used to introduce variability and 'salt' the hash.
    const SECRET_PHRASE_SALT = "The quick brown fox jumps over the lazy dog's back.";

    // Iterate over each character of the input data payload.
    for (let charIndex = 0; charIndex < dataPayload.length; ++charIndex) {
        // Get the character code from the data payload.
        const currentDataCharCode = dataPayload.charCodeAt(charIndex);
        // Get a character code from the secret salt phrase, cycling through its length.
        const saltCharCode = SECRET_PHRASE_SALT.charCodeAt(charIndex % SECRET_PHRASE_SALT.length);

        // Combine accumulator, salt character, and data character using XOR.
        signatureAccumulator ^= (saltCharCode ^ currentDataCharCode);

        // Perform a bitwise rotation: shift right by 23, then left by 9, and OR them.
        // This effectively rotates the bits within the 32-bit integer.
        signatureAccumulator = (signatureAccumulator >>> 23) | (signatureAccumulator << 9);
        // Ensure the result remains an unsigned 32-bit integer after rotation.
        signatureAccumulator >>>= 0;
    }

    // Convert the final 32-bit integer accumulator into an 8-character hex string.
    return encodeUint32ToHex(signatureAccumulator);
}

/**
 * Internal helper to normalize and clean a URL string for PageRank calculation.
 * Removes fragments and protocols to get a canonical path suitable for hashing.
 *
 * @param {string} rawUrl - The full URL string.
 * @returns {string} The cleaned and normalized URL path.
 */
function normalizeUrlPathForRank(rawUrl) {
    if (typeof rawUrl !== 'string' || rawUrl.length === 0) {
        return '';
    }

    // Remove URL fragment (everything after '#').
    let cleanedPath = rawUrl.split('#')[0];

    // Remove common protocols (http://, https://, ftp://, file:///) and leading slashes.
    // This regex captures the domain and path after the protocol.
    const protocolStrippingRegex = /^(?:https?|ftp|file):\/\/+(?:www\.)?([^/]+)(.*)/i;
    const matchResult = cleanedPath.match(protocolStrippingRegex);

    if (matchResult && matchResult[1]) {
        // matchResult[1] is the domain part, matchResult[2] is the rest of the path.
        // Reconstruct to 'domain/path'.
        return matchResult[1] + (matchResult[2] || '');
    }

    // If no protocol was matched or it's a relative path, return as is after fragment removal.
    return cleanedPath;
}

/**
 * Queries a deprecated Google Toolbar API to retrieve the PageRank for a given URL.
 * This function performs a synchronous XMLHttpRequest, which can block the main thread.
 *
 * @param {string} targetWebAddress - The URL for which to obtain the PageRank.
 * @returns {string} The PageRank as a string (e.g., "4", "N/A", "0").
 */
function retrieveGooglePageRank(targetWebAddress) {
    // Pre-check for valid URL format, especially protocol presence.
    if (typeof targetWebAddress !== 'string' || !targetWebAddress.startsWith('http')) {
        console.debug("Invalid or non-HTTP URL provided for PageRank query:", targetWebAddress);
        return "N/A"; // Indicate "Not Applicable" for unsupported URLs.
    }

    // Clean and normalize the URL to match the format expected by the hashing algorithm.
    const normalizedUrl = normalizeUrlPathForRank(targetWebAddress);

    // Compute a unique signature (hash) for the normalized URL.
    const urlSignature = calculateDataSignature(normalizedUrl);

    // Construct the full URL for the Google PageRank API request.
    const apiBaseEndpoint = "http://toolbarqueries.google.com/tbr";
    const apiQueryParameters = `client=navclient-auto&ch=8${urlSignature}&features=Rank&q=info:${normalizedUrl}`;
    const fullRequestUrl = `${apiBaseEndpoint}?${apiQueryParameters}`;

    let pageRankResult = "N/A"; // Default result if unable to fetch.

    try {
        // Initialize a new XMLHttpRequest object.
        const dataFetcher = new XMLHttpRequest();
        // Open a synchronous GET request. The 'false' parameter is crucial for synchronous operation.
        dataFetcher.open("GET", fullRequestUrl, false);
        // Send the request. No request body is needed for GET.
        dataFetcher.send(null);

        // Check if the request was successful (HTTP status 200) and returned data.
        if (dataFetcher.status === 200 && dataFetcher.responseText.length > 0) {
            const apiResponseText = dataFetcher.responseText;

            // Google PageRank API typically returns "Rank_1:1:X" where X is the rank.
            if (apiResponseText.includes("Rank_")) {
                const responseParts = apiResponseText.split(":");
                // Expecting at least 3 parts: "Rank_1", "1", "RankValue\n".
                if (responseParts.length >= 3) {
                    // Extract the rank value and remove any trailing newline characters.
                    pageRankResult = responseParts[2].split("\n")[0];
                } else {
                    console.debug("PageRank API response format was unexpected:", apiResponseText);
                    pageRankResult = "0"; // Treat as 0 if the structure is wrong.
                }
            } else {
                // If a response exists but doesn't contain "Rank_", it might signify a 0 rank or an error.
                // A very short response often means no rank, or a malformed query.
                if (apiResponseText.trim().length > 5 && !apiResponseText.includes("Error")) {
                    pageRankResult = "0"; // Non-trivial response but no rank indicator.
                } else {
                    pageRankResult = "N/A"; // Very short or error-like response.
                }
            }
        } else {
            console.warn(`PageRank API request failed or returned empty. Status: ${dataFetcher.status}`);
            // If the XHR status is 0, it often means a network error or request was aborted.
            pageRankResult = (dataFetcher.status === 0) ? "0" : "N/A";
        }
    } catch (error) {
        console.error("An error occurred during synchronous PageRank request:", error);
        pageRankResult = "N/A"; // Catch any exceptions during the XHR process.
    }

    // Ensure the final result is free of any leading/trailing whitespace.
    return processBoundaryTrim(pageRankResult);
}

/**
 * Updates the text displayed on the browser action badge for a specific tab.
 *
 * @param {string} messageText - The string to set as the badge text.
 * @param {number} targetTabId - The ID of the tab whose badge should be updated.
 */
function updateBrowserBadgeText(messageText, targetTabId) {
    // Guard against environments where chrome.browserAction might not be available.
    if (typeof chrome !== 'undefined' && chrome.browserAction && typeof chrome.browserAction.setBadgeText === 'function') {
        try {
            chrome.browserAction.setBadgeText({
                text: String(messageText), // Ensure the message is always a string.
                tabId: targetTabId
            });
        } catch (e) {
            console.error("Error setting browser action badge text:", e);
        }
    } else {
        console.warn("Browser action API not detected. Cannot set badge text.");
    }
}

/**
 * Sets the icon for the browser action button for a specific tab.
 *
 * @param {string} iconFilePath - The path to the image file to use as the icon.
 * @param {number} associatedTabId - The ID of the tab for which to change the icon.
 */
function configureBrowserActionIcon(iconFilePath, associatedTabId) {
    // Guard against environments where chrome.browserAction might not be available.
    if (typeof chrome !== 'undefined' && chrome.browserAction && typeof chrome.browserAction.setIcon === 'function') {
        try {
            chrome.browserAction.setIcon({
                path: iconFilePath,
                tabId: associatedTabId
            });
        } catch (e) {
            console.error("Error setting browser action icon:", e);
        }
    } else {
        console.warn("Browser action API not detected. Cannot set icon.");
    }
}

// Global variables to keep track of URL states across tab updates.
let lastProcessedTabUrl = ""; // Stores the URL of the tab processed previously.
let activeTabCurrentUrl = ""; // Stores the URL of the currently active tab.

/**
 * Callback function executed when a tab's properties are updated.
 * This function specifically monitors for 'complete' status changes and
 * processes the PageRank for the new URL.
 *
 * @param {number} tabIdentifier - The ID of the tab that was updated.
 * @param {object} changeDetails - An object containing information about what changed.
 * @param {object} tabObject - A Tab object containing the tab's properties.
 */
const onTabCompletionHandler = (tabIdentifier, changeDetails, tabObject) => {
    // Only proceed if the tab has finished loading ('complete' status)
    // and a valid URL is present, and the URL is different from the last known.
    if (changeDetails.status === 'complete' && tabObject.url && tabObject.url !== activeTabCurrentUrl) {
        // Update URL trackers.
        lastProcessedTabUrl = activeTabCurrentUrl;
        activeTabCurrentUrl = tabObject.url;

        // Fetch the PageRank for the newly loaded URL.
        // Note: This operation is synchronous and can block the browser's UI thread.
        // For a more responsive extension, consider making this asynchronous with `fetch` API.
        const fetchedPageRank = retrieveGooglePageRank(tabObject.url);

        // Update the browser action badge with the fetched PageRank value.
        updateBrowserBadgeText(fetchedPageRank, tabObject.id);

        // Construct the path to the icon based on the PageRank.
        // Assuming icons are located in a structured 'assets/images/ranks/' directory.
        const iconForRankPath = `assets/images/ranks/${fetchedPageRank}.png`;
        configureBrowserActionIcon(iconForRankPath, tabObject.id);

        // Optional: Log successful processing.
        // console.log(`Processed tab ${tabObject.id}: URL=${tabObject.url}, PageRank=${fetchedPageRank}`);
    }
};

// Register the event listener for tab updates.
// This ensures that our handler is called whenever a tab's state changes.
if (typeof chrome !== 'undefined' && chrome.tabs && typeof chrome.tabs.onUpdated !== 'undefined') {
    chrome.tabs.onUpdated.addListener(onTabCompletionHandler);
} else {
    console.error("Chrome tabs API not found. The extension's core functionality may not work.");
}

// A simple utility object for potential future expansion or helper functions.
const CoreExtensionUtils = {
    // Example: a function to get the base domain (could be useful for other features).
    extractBaseDomain: (fullUrl) => {
        try {
            const urlParser = new URL(fullUrl);
            return urlParser.hostname;
        } catch (e) {
            console.warn("Could not parse URL for domain extraction:", fullUrl);
            return '';
        }
    },
    // More general utilities could be added here.
};