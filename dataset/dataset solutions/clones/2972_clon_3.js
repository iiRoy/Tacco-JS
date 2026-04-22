"use strict"; // Enforce strict mode for cleaner code practices

/**
 * @class DataStreamProcessor
 * @description A utility class designed to parse and extract data from a multi-line string input.
 *              It provides methods to read individual tokens or entire lines,
 *              applying a specified parsing function to convert string values.
 */
function DataStreamProcessor(sourcePayload, valueConverter) {
    // Type III change: Added validation and default handling for sourcePayload.
    // To match original behavior for empty/whitespace input, we don't filter empty lines initially,
    // as the original `split("\n")` would produce empty string elements for empty lines.
    if (typeof sourcePayload !== 'string') {
        // If payload is not a string, treat it as an empty input string.
        this._sourceLines = [""]; // Ensure at least one line to process, which will yield "0"
        console.warn("DataStreamProcessor initialized with non-string payload. Using an empty string for processing.");
    } else {
        this._sourceLines = sourcePayload.split("\n");
    }

    // Initialize pointers for tracking current position within the data stream.
    this._currentLineIndex = 0;   // Tracks the current line number being processed.
    this._currentTokenIndex = 0;  // Tracks the current token's position within the active line.

    // Assign the default parsing function. If none is provided, use the built-in Number converter.
    // This function is applied to each extracted string token.
    this._valueTransform = valueConverter === undefined ? Number : valueConverter;

    // A flag to indicate if there's more data to be processed.
    // This is a Type III addition for internal state management.
    this._hasMoreData = this._sourceLines.length > 0;
}

/**
 * @method getNextValue
 * @description Reads and parses the next available token from the data stream.
 *              It advances the internal token and line pointers accordingly.
 * @param {Function} [specificConverter] - An optional, custom function to parse this specific token.
 *                                         If not provided, the default `_valueTransform` is used.
 * @returns {*} The parsed value of the next token, or null/undefined if no more tokens.
 */
DataStreamProcessor.prototype.getNextValue = function(specificConverter) {
    // Type III change: Guard clause for end of stream.
    if (this._currentLineIndex >= this._sourceLines.length) {
        this._hasMoreData = false;
        return null; // No more data to read.
    }

    // Retrieve the current line from the source array.
    const activeLineContent = this._sourceLines[this._currentLineIndex];

    // Type III change: Rewriting string splitting to match original behavior more closely
    // `trim()` and then `split(" ")` can result in `[""]` for empty/whitespace lines.
    const lineSegments = activeLineContent.trim().split(" ");

    // Type III change: Defensive check for token index validity.
    if (this._currentTokenIndex >= lineSegments.length) {
        // This might happen if a line was empty after trimming and splitting yields `[""]`
        // and we already processed that single empty token.
        // Or if there are multiple spaces and `split(" ")` creates `["", ""]` and we go past them.
        // For robustness, advance to next line and try again.
        this._currentTokenIndex = 0;
        this._currentLineIndex++;
        return this.getNextValue(specificConverter); // Recursive call to handle next line
    }

    // Extract the raw string token.
    const rawTokenValue = lineSegments[this._currentTokenIndex];

    // Increment the token index for the next read operation.
    this._currentTokenIndex++;

    // Check if all tokens on the current line have been processed.
    // Type III change: Separate conditions for clarity.
    if (this._currentTokenIndex >= lineSegments.length) {
        // If so, reset the token index and move to the next line.
        this._currentTokenIndex = 0;
        this._currentLineIndex++;
        // Type III addition: Update internal state if no more lines.
        if (this._currentLineIndex >= this._sourceLines.length) {
            this._hasMoreData = false;
        }
    }

    // Apply the provided custom converter, or fall back to the default one.
    // Type III change: Using a variable for the result and a more explicit function call.
    const effectiveParser = specificConverter || this._valueTransform;
    const finalParsedValue = effectiveParser(rawTokenValue);

    return finalParsedValue;
};

/**
 * @method consumeCurrentLine
 * @description Reads and parses all tokens from the current line, then advances to the next line.
 *              The internal token pointer is reset.
 * @param {Function} [lineItemParser] - An optional, custom function to parse each item on the line.
 *                                      If not provided, the default `_valueTransform` is used.
 * @returns {Array<*>} An array of parsed values from the current line, or an empty array if no more lines.
 */
DataStreamProcessor.prototype.consumeCurrentLine = function(lineItemParser) {
    // Type III change: Guard clause for end of stream.
    if (this._currentLineIndex >= this._sourceLines.length) {
        this._hasMoreData = false;
        return []; // No more lines to read.
    }

    // Retrieve the current raw line.
    const currentRawLineText = this._sourceLines[this._currentLineIndex];

    // Reset the token pointer as we're processing the entire line.
    this._currentTokenIndex = 0;
    // Advance to the next line immediately.
    this._currentLineIndex++;

    // Type III change: More explicit mapping for line tokens.
    // `split(" ")` includes empty strings between multiple spaces, matching original behavior.
    const rawLineSegments = currentRawLineText.split(" ");
    const parsedLineValues = rawLineSegments
        .map(segment => (lineItemParser || this._valueTransform)(segment));

    // Type III addition: Update internal state if no more lines.
    if (this._currentLineIndex >= this._sourceLines.length) {
        this._hasMoreData = false;
    }

    return parsedLineValues;
};

/**
 * @method hasRemainingData
 * @description Checks if there is more data (lines or tokens) left to be processed in the stream.
 * @returns {boolean} True if there's more data, false otherwise.
 */
DataStreamProcessor.prototype.hasRemainingData = function() {
    // Type III addition: Provides a public interface for stream status.
    return this._hasMoreData;
};


/**
 * @constant {string} ERROR_OUTPUT - Standard error message for a specific condition.
 */
const ERROR_OUTPUT = "-1";

/**
 * @constant {number} CONTROL_FLAG_ZERO - The specific value of the control flag that triggers array generation.
 */
const CONTROL_FLAG_ZERO = 0;

/**
 * @function generateSymmetricSequence
 * @description Generates a sequence of numbers from 0 to (2^exponent - 1) and then back down to 0.
 *              e.g., if exponent = 2, sequence is [0, 1, 2, 3, 3, 2, 1, 0]
 * @param {number} exponent - The exponent for calculating the upper bound (2^exponent).
 * @returns {Array<number>} An array containing the generated symmetric sequence.
 */
function generateSymmetricSequence(exponent) {
    // Type III addition: Input validation for the exponent parameter.
    // If not a valid integer, treat as 0 to avoid errors and produce `0 0`.
    if (typeof exponent !== 'number' || !Number.isInteger(exponent) || exponent < 0) {
        console.error(`Warning: Invalid or non-integer exponent provided: ${exponent}. Defaulting to 0.`);
        exponent = 0;
    }

    // Type III change: Using bit shift for Math.pow(2, exponent) for potential performance and style.
    const rangeLimit = 1 << exponent; // This is 2^exponent.

    const ascendingPart = [];
    // Type III change: Using `let` for loop variables.
    for (let currentNumber = 0; currentNumber < rangeLimit; currentNumber++) {
        ascendingPart.push(currentNumber);
    }

    const descendingPart = [];
    // Type III change: Using `let` for loop variables.
    for (let currentNumber = rangeLimit - 1; currentNumber >= 0; currentNumber--) {
        descendingPart.push(currentNumber);
    }

    // Concatenate the two parts to form the final symmetric sequence.
    return ascendingPart.concat(descendingPart);
}

/**
 * @function formatArrayToString
 * @description Joins an array of elements into a single string, separated by spaces.
 * @param {Array<any>} elementsToJoin - The array of elements to join.
 * @returns {string} The joined string.
 */
function formatArrayToString(elementsToJoin) {
    // Type III addition: Input validation for robustness.
    if (!Array.isArray(elementsToJoin)) {
        console.warn("formatArrayToString received non-array input. Returning empty string.");
        return "";
    }
    return elementsToJoin.join(" ");
}

/**
 * @function executeSolutionLogic
 * @description Main function to process the input, determine the operation, and output the result.
 * @param {string} rawInputText - The raw string data read from an input source.
 */
function executeSolutionLogic(rawInputText) {
    // Create an instance of our custom data stream processor.
    // Since DataStreamProcessor is defined in the same scope, we can use it directly.
    const inputHandler = new DataStreamProcessor(rawInputText);

    // Extract the first two numeric parameters from the input stream.
    // Type III change: More descriptive variable names.
    const primaryInputVal = inputHandler.getNextValue();
    const controlDecisionFlag = inputHandler.getNextValue();

    // Type III addition: Robust validation for the extracted parameters.
    // If input was empty/malformed, `getNextValue` might return `null` or `NaN` after `Number` conversion.
    if (primaryInputVal === null || controlDecisionFlag === null ||
        typeof primaryInputVal !== 'number' || typeof controlDecisionFlag !== 'number' ||
        isNaN(primaryInputVal) || isNaN(controlDecisionFlag)) {
        console.log(ERROR_OUTPUT);
        return;
    }

    // Check the control flag to decide the processing path.
    if (controlDecisionFlag === CONTROL_FLAG_ZERO) {
        // If the control flag is 0, generate and print the symmetric sequence.
        const sequenceResult = generateSymmetricSequence(primaryInputVal);
        const finalOutputString = formatArrayToString(sequenceResult);
        console.log(finalOutputString);
    } else {
        // Otherwise, print the predefined error output.
        console.log(ERROR_OUTPUT);
    }
}

// Define a constant for the standard input file path.
const STDIN_FILE_PATH = "/dev/stdin";

// Main execution block: Read input from stdin and pass it to the solution logic.
// Type III addition: Comprehensive error handling for file system operations.
try {
    const fileSystemModule = require("fs");
    const inputContent = fileSystemModule.readFileSync(STDIN_FILE_PATH, "utf8");
    executeSolutionLogic(inputContent);
} catch (fileReadError) {
    console.error(`An error occurred while reading from ${STDIN_FILE_PATH}:`, fileReadError.message);
    // As per problem requirements for certain error conditions, output "-1".
    console.log(ERROR_OUTPUT);
}