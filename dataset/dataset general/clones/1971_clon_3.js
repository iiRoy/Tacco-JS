/*
 * This utility module provides a secure and robust way to handle application-specific data
 * persistence within browser cookies. It ensures proper encoding, decoding, and expiration management.
 */
var dataPersistenceModule = (function() {
    'use strict';

    // Internal constant for the unique identifier used for our application's cookie data.
    // This helps prevent conflicts with other cookies.
    const APPLICATION_IDENTIFIER_KEY = "AppSpecificUserData";

    // Default duration for which the cookie will remain valid, in days.
    // This provides a sensible default for session persistence.
    const DEFAULT_COOKIE_LIFESPAN_DAYS = 180; // Changed from 300 to 180 for variation.

    /**
     * Safely retrieves the application's specific data from the browser's cookies.
     * Handles decoding and potential errors during retrieval.
     * @returns {string|null} The decoded data string if found, otherwise null.
     */
    function fetchStoredData() {
        // Pre-check for browser environment and cookie availability.
        // Essential for robustness in different JavaScript execution contexts.
        if (typeof document === 'undefined' || !document.cookie) {
            // Log a warning if cookies cannot be accessed, indicating a potential environment issue.
            console.warn("Persistent data storage unavailable: 'document.cookie' is not accessible.");
            return null;
        }

        // Split the entire cookie string into individual cookie entries.
        // Each entry is typically "name=value".
        const allCookieEntries = document.cookie.split(';');
        let retrievedContent = null; // Initialize to null, indicating no data found yet.

        // Iterate through each raw cookie string.
        // Using 'for...of' loop for modern iteration syntax.
        for (const rawEntry of allCookieEntries) {
            // Clean up leading/trailing whitespace which can be present after splitting by ';'.
            const trimmedEntry = rawEntry.trim();

            // Locate the first occurrence of '=' to separate the cookie name from its value.
            const nameValueSeparatorIndex = trimmedEntry.indexOf('=');

            // If no '=' is found, the entry is malformed; skip it.
            if (nameValueSeparatorIndex === -1) {
                continue;
            }

            // Extract the cookie name and content based on the separator.
            const cookieName = trimmedEntry.substring(0, nameValueSeparatorIndex);
            const cookieValueFragment = trimmedEntry.substring(nameValueSeparatorIndex + 1);

            // Check if the current cookie's name matches our application's unique identifier.
            if (cookieName === APPLICATION_IDENTIFIER_KEY) {
                try {
                    // Attempt to decode the URL-encoded cookie value.
                    // decodeURIComponent is the modern and safer alternative to unescape().
                    retrievedContent = decodeURIComponent(cookieValueFragment);
                } catch (decodingError) {
                    // Log an error if decoding fails, indicating corrupted or invalid cookie data.
                    console.error("Error decoding application cookie content:", decodingError);
                    retrievedContent = null; // Reset to null on error to prevent returning corrupted data.
                }
                // Once our specific cookie is found and processed, we can stop searching.
                break;
            }
        }
        return retrievedContent;
    }

    /**
     * Stores a given data payload into a browser cookie with a defined expiration.
     * Ensures data is properly encoded and cookie attributes are set correctly.
     * @param {string|number|boolean} dataPayload The data to be stored. Will be converted to string.
     * @returns {boolean} True if the data was successfully stored, false otherwise.
     */
    function saveApplicationData(dataPayload) {
        // Robustness checks: ensure browser environment and valid input.
        if (typeof document === 'undefined' || !document.cookie) {
            console.warn("Persistent data storage unavailable: 'document.cookie' is not accessible.");
            return false;
        }
        // Validate the input payload to avoid storing 'undefined' or 'null'.
        if (dataPayload === undefined || dataPayload === null) {
            console.warn("Attempted to save an undefined or null data payload. Operation cancelled.");
            return false;
        }

        let encodedPayloadString;
        try {
            // Convert any payload to a string before encoding to ensure consistency.
            // encodeURIComponent is the modern and safer alternative to escape().
            encodedPayloadString = encodeURIComponent(String(dataPayload));
        } catch (encodingError) {
            console.error("Failed to encode data payload for cookie storage:", encodingError);
            return false;
        }

        // Calculate the expiration date for the cookie.
        // This ensures the cookie is not a session cookie and persists across browser sessions.
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + DEFAULT_COOKIE_LIFESPAN_DAYS);
        const expiresAttributeString = "expires=" + expirationDate.toUTCString();

        // Construct the complete cookie string.
        // It includes the name, encoded value, expiration, and path.
        // Setting 'path=/' makes the cookie accessible across the entire domain.
        const fullCookieDefinition = `${APPLICATION_IDENTIFIER_KEY}=${encodedPayloadString}; ${expiresAttributeString}; path=/`;

        // Assign the constructed string to document.cookie.
        // The browser handles parsing these attributes.
        document.cookie = fullCookieDefinition;
        return true; // Indicate successful storage.
    }

    // The module's public interface, exposing the data handling functions.
    // This adheres to the original IIFE module pattern for encapsulation.
    return {
        fetch: fetchStoredData,
        store: saveApplicationData
    };
}());