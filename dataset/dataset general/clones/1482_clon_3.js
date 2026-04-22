// This module is responsible for defining and registering a specialized string processing utility.
// It uses a custom module definition system to manage its dependencies.
declareModule(['./coreApplicationServices'], function (applicationServicesRegistry) {
    'use strict'; // Enforces strict parsing and error handling within this script.

    /**
     * Configuration settings for the version replacement mechanism.
     * Using an object allows for easier management and potential externalization of these values.
     * @type {Readonly<{filterTag: string, versionTagPattern: string}>}
     */
    const VERSION_REPLACEMENT_CONFIG = Object.freeze({
        filterTag: 'stringBuildIdentifierTransformer', // A new, descriptive name for the filter.
        versionTagPattern: '__BUILD_ID_PLACEHOLDER__' // The specific placeholder string to be replaced.
    });

    /**
     * A utility function to ensure that any input value is safely converted into a string.
     * This prevents errors from attempting string operations on non-string types (e.g., null, undefined).
     * @param {*} valueToConvert - The value that needs to be treated as a string.
     * @returns {string} The string representation of the input value.
     */
    function convertValueToString(valueToConvert) {
        // Explicitly handle null or undefined by returning an empty string.
        // Otherwise, use the standard String() constructor for conversion.
        return (valueToConvert === null || valueToConvert === undefined) ? '' : String(valueToConvert);
    }

    /**
     * This function acts as the factory for our filter. It receives the application's
     * build information (e.g., version string) via dependency injection.
     * It then returns the actual function that will perform the string transformation.
     * @param {string} currentBuildIdentifier - The build version/identifier injected by the framework.
     * @returns {function(string): string} The main filter function that processes text.
     */
    const createBuildIdTransformer = function (currentBuildIdentifier) {
        // Validate and normalize the build identifier to ensure it's a string.
        const normalizedBuildId = convertValueToString(currentBuildIdentifier);

        // Compile the regular expression for finding the placeholder.
        // 'g' ensures all occurrences are replaced, 'm' allows multi-line matching.
        const regexForPlaceholder = new RegExp(VERSION_REPLACEMENT_CONFIG.versionTagPattern, 'gm');

        /**
         * The actual filter logic. This function takes an input string and replaces
         * all occurrences of the defined placeholder with the application's build identifier.
         * @param {string} sourceStringContent - The text content to be processed.
         * @returns {string} The modified string with placeholders replaced.
         */
        return function processTextForBuildId(sourceStringContent) {
            // Implement a guard clause: if the input is not valid, return an empty string
            // or the original content, depending on desired behavior. Here, we return empty.
            if (sourceStringContent === null || sourceStringContent === undefined) {
                return '';
            }

            // Ensure the input string is a valid string type before performing replacement.
            const sanitisedSource = convertValueToString(sourceStringContent);

            // Execute the string replacement using the pre-compiled regex and normalized build ID.
            const transformedString = sanitisedSource.replace(regexForPlaceholder, normalizedBuildId);

            return transformedString;
        };
    };

    // Register the newly created filter with the application's service registry.
    // The array defines the filter's name and its dependencies (here, 'appBuildInfo').
    return applicationServicesRegistry.registerFilter(
        VERSION_REPLACEMENT_CONFIG.filterTag,
        ['appBuildInfo', createBuildIdTransformer]
    );
});