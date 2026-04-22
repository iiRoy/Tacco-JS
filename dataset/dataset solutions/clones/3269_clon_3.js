var DataProcessor = (function () {
    // Defines a factory function to create input stream handlers.
    function createStreamHandler(sourceText) {
        return new TextStreamHandler(sourceText);
    }

    // Represents an internal class for handling text input, line by line.
    function TextStreamHandler(rawContent) {
        // Initialize internal storage: trim whitespace and split content into an array of lines.
        // Also, ensure an empty array if rawContent is null/undefined to prevent errors.
        this._sourceLines = String(rawContent || '').trim().split('\n');
        // Initialize the current line cursor to the beginning of the stream.
        this._currentLineIndex = 0;
    }

    // Helper constants for number/string conversion.
    const CONVERT_TO_NUMERIC = true;
    const RETAIN_AS_STRING = false;

    // Prototype methods for TextStreamHandler.

    /**
     * Extracts a single token (word) from the current line.
     * The line is processed in reverse order to simulate popping from the front.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more tokens or line is empty.
     */
    TextStreamHandler.prototype.fetchNextWord = function (returnAsString = RETAIN_AS_STRING) {
        const lines = this._sourceLines;
        const currentPos = this._currentLineIndex;

        // Check for end of stream or invalid line.
        if (currentPos >= lines.length || !lines[currentPos]) {
            return undefined;
        }

        let lineBuffer = lines[currentPos];

        // If the line hasn't been split into words yet, split it and reverse to enable efficient "pop-from-front" behavior.
        // We'll store the split array back into the same position, effectively caching it.
        if (typeof lineBuffer === 'string') {
            lines[currentPos] = lineBuffer.split(' ').reverse();
            lineBuffer = lines[currentPos]; // Update lineBuffer reference
        }

        // Retrieve the last element from the reversed array (which is the first word in original order).
        const extractedToken = lineBuffer.pop();

        // If the current line is now exhausted, advance the line cursor.
        if (lineBuffer.length === 0) {
            this._currentLineIndex++;
        }

        // Return the token, converting to number if requested and possible.
        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * Reads and processes an entire line of tokens.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {string[]|number[]|undefined} An array of tokens, or undefined if end of stream.
     */
    TextStreamHandler.prototype.getLineTokens = function (returnAsString = RETAIN_AS_STRING) {
        const lines = this._sourceLines;
        const currentPos = this._currentLineIndex;

        if (currentPos >= lines.length) {
            return undefined; // No more lines
        }

        // Fetch the line, split it by space, and then advance the cursor.
        const rawTokens = String(lines[this._currentLineIndex++]).split(' ');

        // Convert tokens to numbers if not requested as strings.
        return returnAsString ? rawTokens : rawTokens.map(token => Number(token));
    };

    /**
     * Reads a specified number of lines, processing each into an array of tokens.
     * @param {number} numberOfLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {string[][]|number[][]|[]} An array of arrays of tokens, or an empty array if invalid count.
     */
    TextStreamHandler.prototype.readTokenMatrix = function (numberOfLines, returnAsString = RETAIN_AS_STRING) {
        if (numberOfLines <= 0) return []; // Guard clause for invalid count

        const startIdx = this._currentLineIndex;
        // Slice the required number of lines and advance the cursor.
        this._currentLineIndex += numberOfLines;
        const selectedLines = this._sourceLines.slice(startIdx, this._currentLineIndex);

        // Process each selected line: split into tokens.
        const processedLines = selectedLines.map(line => String(line).split(' '));

        // Convert tokens to numbers if required.
        return returnAsString ? processedLines : processedLines.map(line => line.map(token => Number(token)));
    };

    /**
     * Reads a specified number of lines as raw strings or attempts to convert them to numbers.
     * Useful for single-value-per-line input.
     * @param {number} numberOfLines - The number of lines to read.
     * @param {boolean} [returnAsString=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {string[]|number[]|[]} An array of raw line strings or numbers, or an empty array if invalid count.
     */
    TextStreamHandler.prototype.fetchRawLines = function (numberOfLines, returnAsString = RETAIN_AS_STRING) {
        if (numberOfLines <= 0) return []; // Guard clause for invalid count

        const startIdx = this._currentLineIndex;
        // Slice the required number of lines and advance the cursor.
        this._currentLineIndex += numberOfLines;
        const selectedLines = this._sourceLines.slice(startIdx, this._currentLineIndex);

        // Return lines as strings or converted to numbers.
        return returnAsString ? selectedLines : selectedLines.map(line => Number(line));
    };

    // Expose the factory function.
    return createStreamHandler;
})();

// Constants for the main logic.
const SUCCESS_INDICATOR = "YES";
const FAILURE_INDICATOR = "NO";
const SEARCH_KEYWORD = "keyence"; // The string we are looking for patterns of.

// Initialize the input data parser using Node.js file system to read from stdin.
// The `readFileSync` call is wrapped in a try-catch for robustness.
let standardInputContent;
try {
    standardInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
} catch (error) {
    console.error("Error reading from stdin:", error.message);
    // In case of an error, provide a default empty string to prevent further issues.
    standardInputContent = "";
}

const inputReader = DataProcessor(standardInputContent);

// Output the result of the primary application logic.
console.log(executeKeywordSearch());

/**
 * Main application logic to search for a specific pattern within an input string.
 * It checks if the input string can be formed by concatenating a prefix of "keyence",
 * any intermediate string, and a suffix of "keyence".
 * @returns {string} "YES" if a match is found, otherwise "NO".
 */
function executeKeywordSearch() {
    // Read the primary input string for analysis.
    // We explicitly request it as a string using RETAIN_AS_STRING constant.
    const candidateString = inputReader.fetchNextWord(RETAIN_AS_STRING);

    // Basic validation: ensure candidateString is a string and not empty.
    if (typeof candidateString !== 'string' || candidateString.length === 0) {
        return FAILURE_INDICATOR; // No valid input to check against.
    }

    // Iterate through all possible split points of the target keyword.
    // A split point 'splitIdx' means we take SEARCH_KEYWORD.substring(0, splitIdx) as prefix
    // and SEARCH_KEYWORD.substring(splitIdx) as suffix.
    // The loop goes from 0 (empty prefix, full suffix) to SEARCH_KEYWORD.length (full prefix, empty suffix).
    for (let splitIdx = 0; splitIdx <= SEARCH_KEYWORD.length; splitIdx++) {
        // Extract the prefix part of the target keyword.
        const currentPrefix = SEARCH_KEYWORD.substring(0, splitIdx);
        // Extract the suffix part of the target keyword.
        const currentSuffix = SEARCH_KEYWORD.substring(splitIdx);

        // Construct the regular expression pattern.
        // It looks for: (start of string) + (escaped prefix) + (any characters) + (escaped suffix) + (end of string).
        const searchRegex = new RegExp(
            `^${escapeRegexSpecialChars(currentPrefix)}.*${escapeRegexSpecialChars(currentSuffix)}$`
        );

        // Test if the input candidate matches the constructed pattern.
        if (searchRegex.test(candidateString)) {
            return SUCCESS_INDICATOR; // Match found, no need to check further.
        }
    }

    // If the loop completes without finding any match, return failure.
    return FAILURE_INDICATOR;
}

/**
 * Helper function to escape special characters in a string for safe use within a regular expression.
 * @param {string} inputString - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeRegexSpecialChars(inputString) {
    return inputString.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the matched substring
}