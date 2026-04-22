// Import a utility library for common operations.
const helperTools = require('underscore');

/**
 * Transforms a multi-line string by prepending a consistent whitespace prefix
 * to the beginning of each individual line within the content.
 * This effectively indents the entire block of text.
 *
 * @param {string} sourceTextContent - The original textual content that needs indentation.
 *                                     If this is not a string, the function will return an empty string.
 * @param {number} [prefixDepth=0] - An integer representing the number of indentation levels to apply.
 *                                   Each level corresponds to two space characters. Non-numeric or negative
 *                                   values will default to zero indentation levels.
 * @returns {string} The modified string with the specified indentation applied to every line.
 *                   Returns an empty string if the input `sourceTextContent` is not a string or is empty.
 */
function applyLinePrefixing (sourceTextContent, prefixDepth) {
    // Validate the primary input: ensure it's a string.
    // If the input is not a string, it cannot be processed, so return an empty result.
    if (typeof sourceTextContent !== 'string') {
        return '';
    }

    // Optimization: If the input string is empty, there's no work to do.
    if (sourceTextContent.length === 0) {
        return '';
    }

    // Determine the effective indentation depth.
    // Ensure 'prefixDepth' is a non-negative number; otherwise, default to zero.
    const actualDepth = (typeof prefixDepth === 'number' && !isNaN(prefixDepth) && prefixDepth > 0)
                        ? Math.floor(prefixDepth) // Use floor to ensure integer depth.
                        : 0;

    // Define the basic unit of indentation (two spaces).
    const baseIndentationUnit = '  ';

    // Generate the complete leading whitespace string by repeating the base unit.
    const leadingWhitespace = baseIndentationUnit.repeat(actualDepth);

    // Split the entire source content into an array of individual lines.
    const contentRows = sourceTextContent.split('\n');

    // Prepare a new array to store the lines after they have been processed.
    const modifiedContentRows = [];

    // Iterate through each line in the `contentRows` array.
    for (let currentLineIndex = 0; currentLineIndex < contentRows.length; currentLineIndex++) {
        const originalLine = contentRows[currentLineIndex];

        // Prepend the generated leading whitespace to the current line.
        modifiedContentRows.push(leadingWhitespace + originalLine);
    }

    // Join the processed lines back into a single string, using the newline character
    // to reconstruct the multi-line structure.
    const finalProcessedString = modifiedContentRows.join('\n');

    return finalProcessedString;
}

// Export the newly defined function as the module's primary export.
module.exports = applyLinePrefixing;