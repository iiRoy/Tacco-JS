"use strict";

/**
 * @function safeParseInteger
 * @description A robust helper function to parse a string into an integer.
 *              Handles null, undefined, empty strings, and non-numeric values gracefully.
 * @param {string} stringValue - The string to parse.
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
function safeParseInteger(stringValue) {
    // Check for null or undefined input to prevent errors
    if (stringValue === null || stringValue === undefined) {
        return NaN;
    }
    // Trim whitespace and check if the string is empty
    const trimmedValue = String(stringValue).trim();
    if (trimmedValue === '') {
        return NaN;
    }
    // Attempt to parse the integer with radix 10 for explicit base
    const parsed = parseInt(trimmedValue, 10);
    // Return NaN if parsing was unsuccessful
    return isNaN(parsed) ? NaN : parsed;
}

/**
 * @class InputProcessor
 * @description A utility class designed for sequential parsing of input data,
 *              breaking it down line by line and then token by token.
 */
function InputProcessor(sourceDataString, defaultItemConverter) {
    // Validate that the primary input is indeed a string.
    if (typeof sourceDataString !== 'string') {
        throw new Error("InputProcessor: Source data must be provided as a string.");
    }

    // Store all input lines, splitting by the newline character.
    this._lineStore = sourceDataString.split("\n");
    // Initialize the current token's index within the active line.
    this._tokenIndex = 0;
    // Initialize the pointer to the current line being processed.
    this._linePointer = 0;
    // Set the default function for converting extracted string tokens to their desired type.
    // If no custom converter is provided, use our robust safeParseInteger function.
    this._defaultItemConverter = defaultItemConverter || safeParseInteger;

    // Optional: Pre-process lines to ensure they are trimmed and non-empty,
    // though current logic handles this dynamically.
    // this._lineStore = this._lineStore.map(line => line.trim()).filter(line => line.length > 0);
}

// --- Prototype Methods for InputProcessor ---

/**
 * @method getNextToken
 * @description Reads and returns the very next individual token from the input stream.
 *              It advances the internal pointers (line and token index) accordingly.
 * @param {function} [customTokenParser] - An optional function to parse this specific token.
 * @returns {*} The parsed token, or undefined if no more tokens are available.
 */
InputProcessor.prototype.getNextToken = function(customTokenParser) {
    // Check if all lines have been processed.
    if (this._linePointer >= this._lineStore.length) {
        return undefined; // No more data to read.
    }

    let activeInputLine = this._lineStore[this._linePointer];

    // Handle cases where the current line might be undefined, null, or just whitespace.
    // If so, skip to the next line and try again.
    if (activeInputLine === undefined || activeInputLine === null || activeInputLine.trim() === '') {
        this._linePointer++; // Move to the subsequent line.
        this._tokenIndex = 0; // Reset token index for the new line.
        // Recursively call to find the next valid token.
        return this.getNextToken(customTokenParser);
    }

    // Split the current line into fragments (tokens) using one or more whitespace characters as delimiters.
    // Using a regular expression `/\s+/` provides more robust splitting than a single space.
    const lineFragments = activeInputLine.trim().split(/\s+/);

    // If the line, after trimming and splitting, results in no actual fragments (e.g., "   "),
    // then it's effectively an empty line. Move to the next.
    if (lineFragments.length === 0 || (lineFragments.length === 1 && lineFragments[0] === '')) {
        this._linePointer++;
        this._tokenIndex = 0;
        return this.getNextToken(customTokenParser);
    }

    // Check if the current token index is beyond the bounds of the current line's fragments.
    // This means all tokens on the current line have been consumed.
    if (this._tokenIndex >= lineFragments.length) {
        this._linePointer++; // Advance to the next line.
        this._tokenIndex = 0; // Reset the token index for the new line.
        // Recursively call to fetch a token from the newly advanced line.
        return this.getNextToken(customTokenParser);
    }

    // Extract the token string at the current index.
    const currentFragment = lineFragments[this._tokenIndex];

    // Increment the token index to point to the next token for the subsequent read.
    this._tokenIndex = this._tokenIndex + 1;

    // Determine which parser function to use: the provided custom one or the default.
    const converterToUse = customTokenParser || this._defaultItemConverter;
    // Apply the chosen converter to the extracted fragment and return the result.
    return converterToUse(currentFragment);
};

/**
 * @method getAllLineTokens
 * @description Reads all remaining tokens from the current line, processes them,
 *              and returns them as an array. It then advances to the next line.
 * @param {function} [lineSpecificParser] - An optional function to parse each item on this line.
 * @returns {Array<*>} An array of parsed tokens from the current line, or an empty array.
 */
InputProcessor.prototype.getAllLineTokens = function(lineSpecificParser) {
    // Check if all lines in the store have been exhausted.
    if (this._linePointer >= this._lineStore.length) {
        return []; // No more lines, return an empty array.
    }

    let activeInputLine = this._lineStore[this._linePointer];

    // Advance the line pointer and reset the token index, as the entire line is being consumed.
    this._linePointer = this._linePointer + 1;
    this._tokenIndex = 0;

    // Handle cases where the line might be undefined, null, or consists only of whitespace.
    if (activeInputLine === undefined || activeInputLine === null || activeInputLine.trim() === '') {
        return []; // Return an empty array for effectively empty lines.
    }

    // Split the line into fragments using robust whitespace splitting.
    const lineFragments = activeInputLine.trim().split(/\s+/);

    // If the line was empty after trimming/splitting, return an empty array.
    if (lineFragments.length === 0 || (lineFragments.length === 1 && lineFragments[0] === '')) {
        return [];
    }

    // Decide which converter function to apply to each fragment.
    const converterToApply = lineSpecificParser || this._defaultItemConverter;

    // Map each string fragment to its parsed value using the chosen converter.
    const processedTokens = lineFragments.map(fragment => converterToApply(fragment));
    return processedTokens;
};

// Export the InputProcessor class for modular use.
module.exports = InputProcessor;

// --- Main Application Logic ---

/**
 * @function executeMainLogic
 * @description The central function that orchestrates the problem's solution.
 *              It takes raw input, parses it, performs calculations, and outputs the result.
 * @param {string} rawInputContent - The complete raw string content obtained from the input source.
 */
function executeMainLogic(rawInputContent) {
    // Initialize an instance of our data processor with the raw input string.
    const dataProcessor = new InputProcessor(rawInputContent);

    // Read the first required numeric value from the input stream.
    const primaryValue = dataProcessor.getNextToken();
    // Read the second required numeric value from the input stream.
    const secondaryValue = dataProcessor.getNextToken();

    // Implement robust validation for the extracted numeric values.
    if (isNaN(primaryValue) || isNaN(secondaryValue)) {
        // Log an error if either value could not be successfully parsed as a number.
        console.error("Error: Failed to parse one or both required numeric values from the input data.");
        // Terminate execution or handle the error appropriately, as calculation cannot proceed.
        return;
    }

    // Perform the core calculation based on the problem's logic.
    // The original problem typically involves counting elements in a range [K, N],
    // which is calculated as N - K + 1.
    const finalResult = primaryValue - secondaryValue + 1;

    // Output the computed result to the console with a descriptive label.
    console.log(`Computed Result: ${finalResult}`);
}

// --- Input Handling and Execution Wrapper ---

/**
 * @function readInputFile
 * @description A helper function to safely read content from a specified file path.
 *              Includes error handling and checks for Node.js environment.
 * @param {string} filePath - The path to the file to be read.
 * @returns {string} The content of the file as a UTF-8 string, or an empty string on error.
 */
function readInputFile(filePath) {
    try {
        // Check if the 'fs' module (Node.js File System) is available in the current environment.
        if (typeof require === 'function' && require.resolve && require.resolve('fs')) {
            const fs = require("fs"); // Dynamically require the fs module.
            return fs.readFileSync(filePath, "utf8"); // Read file synchronously with UTF-8 encoding.
        } else {
            // If 'fs' is not available (e.g., in a browser environment).
            console.error("File system module 'fs' is not available. Cannot read local files.");
            return ""; // Return an empty string as a fallback.
        }
    } catch (error) {
        // Catch and log any errors encountered during file reading.
        console.error(`Failed to read input file from '${filePath}': ${error.message}`);
        return ""; // Return an empty string to indicate failure.
    }
}

// The entry point for the application: read input and execute main logic.
// Attempt to read the input data from standard input, typically '/dev/stdin' on Linux/macOS.
const inputData = readInputFile("/dev/stdin");

// Only proceed with the main logic if input data was successfully retrieved.
if (inputData.length > 0) {
    executeMainLogic(inputData);
} else {
    // If no input data was obtained, issue a warning.
    console.warn("No input data received or file reading failed. Skipping main logic execution.");
}