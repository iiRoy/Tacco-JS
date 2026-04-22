// This module provides utilities for formatting data, primarily for JSONP consumption.
module.exports.produceJsonpPayload = function (clientCallbackName, dataToEncode) {
    // Initialize the final output string.
    let formattedResponse = '';

    // Guard against null or undefined data payloads.
    // For consistency, an empty JSON object string is returned if no data is provided.
    if (dataToEncode === null || typeof dataToEncode === 'undefined') {
        return JSON.stringify({});
    }

    // Convert the data object into its JSON string representation.
    const jsonEncodedData = JSON.stringify(dataToEncode);

    // Check if a valid callback identifier has been provided.
    // A valid identifier must be a non-empty string after trimming whitespace.
    if (typeof clientCallbackName === 'string' && clientCallbackName.trim().length > 0) {
        // Sanitize the callback name to ensure it's a safe JavaScript identifier.
        // This regular expression removes any characters that are not alphanumeric,
        // underscore, or dollar sign, which are typically allowed in JS identifiers.
        // This also handles cases where a '?' or other invalid characters might be present
        // (e.g., from a URL query parameter).
        const sanitizedCallback = clientCallbackName.replace(/[^a-zA-Z0-9_$]/g, '');

        // If, after sanitization, the callback name becomes empty,
        // we treat it as if no valid callback was originally provided.
        if (sanitizedCallback.length === 0) {
            formattedResponse = jsonEncodedData;
        } else {
            // Construct the JSONP format string, using a placeholder for the data.
            // The format is typically `callbackName(data);`
            const jsonpWrapperTemplate = `${sanitizedCallback}({0});`;
            // Apply the JSON data into the template using the custom prototype method.
            formattedResponse = String.prototype.injectValues.call(jsonpWrapperTemplate, jsonEncodedData);
        }
    } else {
        // If no valid callback name is present, just return the raw JSON string.
        formattedResponse = jsonEncodedData;
    }

    // Return the final formatted output, either JSONP or plain JSON.
    return formattedResponse;
};

// Extends the String prototype with a custom formatting method.
// This method allows for positional arguments to be injected into a string,
// similar to Python's or C#'s string.format.
//
// Usage Example:
// let message = "Hello {0}, welcome to {1}!".injectValues("John", "our website");
// console.log(message); // Outputs: "Hello John, welcome to our website!"
String.prototype.injectValues = function () {
    // The string instance itself is the format template (e.g., "Hello {0}").
    let currentTemplateString = this.toString();

    // Convert the function's arguments (the values to be injected) into an array.
    // The first argument to `injectValues` corresponds to placeholder {0}, the second to {1}, etc.
    const replacementArguments = Array.from(arguments);

    // Iterate through the provided arguments.
    // Each argument's index corresponds to a placeholder number (e.g., index 0 for {0}).
    for (let i = 0; i < replacementArguments.length; i++) {
        // Create a regular expression to find all occurrences of the current placeholder.
        // The 'g' flag ensures that all instances of a placeholder (e.g., all '{0}'s) are replaced.
        const placeholderRegex = new RegExp("\\{" + i + "\\}", "g");
        // Replace all found placeholders with their corresponding value from the arguments array.
        currentTemplateString = currentTemplateString.replace(placeholderRegex, replacementArguments[i]);
    }

    // Return the string with all placeholders replaced by their respective values.
    return currentTemplateString;
};