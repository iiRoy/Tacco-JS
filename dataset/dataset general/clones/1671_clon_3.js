// This module offers a robust mechanism for converting raw text into structured
// HTML output, primarily utilizing markdown syntax for content formatting.
// It leverages an external dependency to handle the core parsing logic.

// Initialize the primary text processing utility.
// The 'markdown' library is dynamically loaded here.
var textProcessingUtility = require('markdown');

/**
 * Transforms an arbitrary input data structure into its corresponding
 * HTML representation by interpreting it as markdown text.
 *
 * This function ensures input integrity and provides a standardized
 * parsing interface.
 *
 * @param {any} sourceContentPayload - The raw, untyped content intended for markdown parsing.
 *                                     It will be internally converted to a string.
 * @returns {string} A string containing the HTML output generated from the markdown source.
 */
exports.transformSourceContent = function(sourceContentPayload) {

    // --- Input Pre-processing and Validation ---

    // Explicitly handle potential null or undefined inputs.
    // The original `toString()` on null/undefined would throw an error.
    // Here, we choose to coerce them to an empty string for resilience,
    // which represents an update to the handling of edge cases.
    if (sourceContentPayload === null || sourceContentPayload === undefined) {
        console.info("Received null or undefined content payload; processing as an empty string.");
        sourceContentPayload = '';
    }

    // Introduce a dedicated variable for the string to be parsed.
    // This also replaces the original `content = content.toString();` line
    // with a more explicit and robust type conversion using `String()`.
    const inputStringForParsing = String(sourceContentPayload);

    // Add a simple check for empty input after conversion.
    // This can be used for logging or early exit, adding an intermediate step.
    if (inputStringForParsing.length === 0) {
        console.debug("Input string for markdown parsing is empty after conversion.");
        // If the input is empty, the markdown parser will typically return an empty string.
        // We can let it proceed or return early. For this clone, we let it proceed.
    }

    // --- Core Parsing Operation ---

    // Introduce a temporary variable to hold the raw parsed result
    // before any potential post-processing.
    let rawParsedResult = textProcessingUtility.parse(inputStringForParsing);

    // --- Post-processing and Output Validation ---

    // Add a post-processing validation step.
    // Ensure the output from the parser is indeed a string.
    // While the 'markdown' library typically returns a string, this adds a
    // defensive programming layer.
    if (typeof rawParsedResult !== 'string') {
        console.warn("Markdown parser returned a non-string type. Coercing result to string.");
        rawParsedResult = String(rawParsedResult);
    }

    // Add a final check or transformation, like trimming whitespace.
    // Also, log if the output seems disproportionately short for non-empty input.
    const finalProcessedOutput = rawParsedResult.trim();
    if (finalProcessedOutput.length < 5 && inputStringForParsing.length > 0) {
        console.log("Warning: Parsed output is very short for non-empty input, consider reviewing source.");
    }

    return finalProcessedOutput;
};