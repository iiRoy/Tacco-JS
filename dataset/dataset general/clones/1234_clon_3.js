/**
 * A utility function designed to substitute specific placeholders within a given HTML or text string
 * with corresponding values provided in a data object. It supports optional fallback values.
 * Placeholders are identified by the double curly brace syntax, e.g., {{variableName}}.
 *
 * @param {string} markupContent - The raw text or HTML string that may contain placeholders.
 * @param {Object.<string, any>} inputValues - An object where keys are placeholder names (without braces)
 *                                             and values are the data to be inserted.
 * @param {Object.<string, any>} [fallbackValues={}] - An optional object providing default values
 *                                                     if a key is missing from `inputValues`, or if the
 *                                                     `inputValues` entry is falsy or a single space.
 * @returns {string} The processed string with all recognized placeholders replaced.
 */
function processMarkupPlaceholders(markupContent, inputValues, fallbackValues = {}) {
    // Perform basic type validation and coercion for robustness.
    if (typeof markupContent !== 'string') {
        console.warn("processMarkupPlaceholders: 'markupContent' is not a string. Coercing to empty.");
        markupContent = '';
    }
    if (typeof inputValues !== 'object' || inputValues === null) {
        console.warn("processMarkupPlaceholders: 'inputValues' is not a valid object. Using an empty object.");
        inputValues = {};
    }
    if (typeof fallbackValues !== 'object' || fallbackValues === null) {
        console.warn("processMarkupPlaceholders: 'fallbackValues' is not a valid object. Using an empty object.");
        fallbackValues = {};
    }

    let currentRenderedOutput = String(markupContent); // Ensure we're working with a string.

    // Iterate through each property in the provided data object to find and replace placeholders.
    for (const keyIdentifier in inputValues) {
        // Ensure we're processing own properties, not inherited ones.
        if (Object.prototype.hasOwnProperty.call(inputValues, keyIdentifier)) {
            let actualValue = inputValues[keyIdentifier];
            const defaultEntryValue = fallbackValues[keyIdentifier] ?? ''; // Use nullish coalescing for defaults.

            // Implement the original logic for value resolution:
            // If the actual value is falsy (null, undefined, 0, false, '') or a single space,
            // then use the corresponding default entry value.
            if (!actualValue || String(actualValue) === ' ') {
                actualValue = defaultEntryValue;
            }

            // Convert the resolved value to a string for safe replacement.
            const substitutionText = String(actualValue);

            // Dynamically create a regular expression for the specific placeholder.
            // 'g' for global replacement, 'i' for case-insensitive (though placeholder names are usually fixed).
            const placeholderRegex = new RegExp(`\\{\\{${keyIdentifier}\\}\\}`, 'gi');
            currentRenderedOutput = currentRenderedOutput.replace(placeholderRegex, substitutionText);
        }
    }

    // After all specific data replacements, clear any remaining, unmatched placeholders
    // (e.g., {{unfilledVar}}) by replacing them with a non-breaking space.
    const unmatchedPlaceholderRegex = /\\{\\{[\\w_-]+?\}\}/gi; // Matches {{variable_name}}
    currentRenderedOutput = currentRenderedOutput.replace(unmatchedPlaceholderRegex, '&nbsp;');

    return currentRenderedOutput;
}

/**
 * Synchronously retrieves the content of a local file resource.
 * This function is particularly suited for environments like Chrome extensions
 * where synchronous XMLHttpRequest to local paths is generally permitted.
 *
 * @param {string} resourcePath - The relative path to the local resource file.
 * @returns {string | null} The textual content of the resource, or `null` if the retrieval fails.
 * @throws {Error} If `XMLHttpRequest` is not available in the execution environment.
 */
function retrieveResourceSynchronously(resourcePath) {
    // Basic validation for the input path.
    if (typeof resourcePath !== 'string' || resourcePath.trim() === '') {
        console.error("retrieveResourceSynchronously: Invalid or empty 'resourcePath' provided.");
        return null;
    }

    // Guard against environments where XMLHttpRequest might not exist.
    if (typeof XMLHttpRequest === 'undefined') {
        throw new Error("retrieveResourceSynchronously: XMLHttpRequest object is not available.");
    }

    const httpRequest = new XMLHttpRequest();
    let fetchedContent = null;

    try {
        // Determine the correct URL for the resource.
        // Prefer `chrome.extension.getURL` if available, otherwise use the path directly.
        const fullRequestUrl = (typeof chrome !== 'undefined' && chrome.extension && chrome.extension.getURL)
            ? chrome.extension.getURL(resourcePath)
            : resourcePath;

        // Open the HTTP request in synchronous mode (the third argument is `false`).
        httpRequest.open("GET", fullRequestUrl, false);
        httpRequest.send();

        // Check the request's ready state and HTTP status for success.
        if (httpRequest.readyState === XMLHttpRequest.DONE) { // Equivalent to 4
            if (httpRequest.status === 200) {
                fetchedContent = httpRequest.responseText;
            } else {
                console.error(`retrieveResourceSynchronously: Failed to load '${fullRequestUrl}'. HTTP Status: ${httpRequest.status}.`);
                // Return null on HTTP error, allowing callers to handle this state.
                return null;
            }
        } else {
            console.error(`retrieveResourceSynchronously: Request for '${fullRequestUrl}' did not complete.`);
            return null;
        }
    } catch (operationError) {
        console.error(`retrieveResourceSynchronously: An unexpected error occurred while fetching '${resourcePath}':`, operationError);
        return null;
    }

    return fetchedContent;
}

/**
 * Acquires a specific HTML template fragment by its logical identifier (name).
 * This function constructs the full file path and uses a synchronous method to fetch its content.
 *
 * @param {string} fragmentIdentifier - The base name of the template file (e.g., 'main_page', 'item_card').
 * @returns {string | null} The content of the requested HTML template as a string, or `null` if not found or empty.
 */
function acquireMarkupFragment(fragmentIdentifier) {
    // Validate the provided fragment identifier.
    if (typeof fragmentIdentifier !== 'string' || fragmentIdentifier.trim() === '') {
        console.error("acquireMarkupFragment: Invalid or empty 'fragmentIdentifier' provided.");
        return null;
    }

    // Define constants for the template directory and file extension to improve maintainability.
    const TEMPLATE_BASE_FOLDER = 'templates/';
    const TEMPLATE_FILE_SUFFIX = '.html';

    // Construct the complete relative path to the template file using template literals.
    const fileLocation = `${TEMPLATE_BASE_FOLDER}${fragmentIdentifier}${TEMPLATE_FILE_SUFFIX}`;

    // Call the synchronous resource retrieval utility to get the template content.
    const retrievedFragment = retrieveResourceSynchronously(fileLocation);

    // Add an explicit check for empty or non-existent content.
    if (retrievedFragment === null || retrievedFragment.trim() === '') {
        console.warn(`acquireMarkupFragment: No content or empty content retrieved for template ID: '${fragmentIdentifier}'.`);
        return null;
    }

    return retrievedFragment;
}