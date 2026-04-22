/**
 * @file This script processes numerical pairs from standard input, summing the larger value of each pair
 *       when the first value is less than the second. It's designed for environments where input is
 *       provided via `/dev/stdin` and output to `stdout`.
 * @author [AI Clone Generator]
 * @version 1.2.0
 */

// --- Configuration and Core Utilities ---

// Defines distinct modes for transforming raw string input.
// Using Symbols ensures unique and collision-free mode identifiers.
const DataParsingModes = Object.freeze({
    RAW_STRING: Symbol('raw_string_identity'),                      // Returns the string as is.
    TO_INTEGER: Symbol('convert_to_integer'),                       // Converts string to a base-10 integer.
    SPLIT_BY_SPACE: Symbol('split_on_space_char'),                 // Splits string by space character into an array of strings.
    SPLIT_BY_NEWLINE: Symbol('split_on_newline_char'),             // Splits string by newline character into an array of strings.
    SPACE_DELIMITED_NUM_ARRAY: Symbol('space_delimited_numbers'),   // Splits by space, then maps each part to a number.
    NEWLINE_DELIMITED_NUM_ARRAY: Symbol('newline_delimited_numbers'), // Splits by newline, then maps each part to a number.
    CHAR_ARRAY: Symbol('character_array'),                          // Splits string into an array of individual characters.
    CHAR_NUM_ARRAY: Symbol('character_number_array'),               // Splits into characters, then maps each character to a number.
});

/**
 * Acquires the complete raw input string from the standard input stream.
 * This function abstracts the file system interaction.
 * @returns {string} The content read from `/dev/stdin`, with leading/trailing whitespace removed.
 */
function obtainSourceContent() {
    // The 'fs' module is necessary for file system operations in Node.js.
    // Synchronous reading is common in competitive programming for simplicity.
    const fileSystemModule = require("fs");
    return fileSystemModule.readFileSync("/dev/stdin", "utf8").trim();
}

/**
 * Renders the final computed result to the standard output console.
 * This function serves as the designated output gateway.
 * @param {any} valueToDisplay - The data or message to be outputted.
 */
function renderFinalOutput(valueToDisplay) {
    // `console.log` is the standard method for writing to stdout in Node.js.
    console.log(valueToDisplay);
}

/**
 * A versatile utility function for applying various transformations to a string input.
 * It uses a `Symbol`-based mode system for clear intent.
 * @param {string} sourceString - The string data that needs to be transformed.
 * @param {Symbol} transformationMode - A symbol from `DataParsingModes` dictating the desired operation.
 * @returns {any} The result of the transformation, which can be a string, number, or an array.
 */
function applyInputTransformation(sourceString, transformationMode) {
    // Ensure the input is always treated as a string for consistent method calls,
    // handling potential null or undefined inputs gracefully.
    const processedString = String(sourceString || '');

    switch (transformationMode) {
        case DataParsingModes.RAW_STRING:
            return processedString;
        case DataParsingModes.TO_INTEGER:
            // `Number.parseInt` with radix 10 ensures correct integer parsing.
            return Number.parseInt(processedString, 10);
        case DataParsingModes.SPLIT_BY_SPACE:
            return processedString.split(" ");
        case DataParsingModes.SPLIT_BY_NEWLINE:
            return processedString.split("\n");
        case DataParsingModes.SPACE_DELIMITED_NUM_ARRAY:
            // `map(Number)` is a concise way to convert string elements to numbers.
            return processedString.split(" ").map(Number);
        case DataParsingModes.NEWLINE_DELIMITED_NUM_ARRAY:
            return processedString.split("\n").map(Number);
        case DataParsingModes.CHAR_ARRAY:
            return processedString.split("");
        case DataParsingModes.CHAR_NUM_ARRAY:
            return processedString.split("").map(Number);
        default:
            // Fallback for unrecognized modes, issuing a warning and returning the original string.
            console.warn(`[WARNING] Unrecognized transformation mode provided: ${String(transformationMode)}. Returning original string.`);
            return sourceString;
    }
}

// --- Main Application Logic ---

/**
 * Encapsulates the primary problem-solving algorithm.
 * It reads the raw input, processes it line by line, and computes a specific cumulative sum.
 * @param {string} rawInputContent - The entire raw string content obtained from the input source.
 */
function processMainSolution(rawInputContent) {
    // Initial parsing: break the entire input string into an array of individual lines.
    let parsedInputLines = applyInputTransformation(rawInputContent, DataParsingModes.SPLIT_BY_NEWLINE);

    // Guard clause: Validate that the input yielded an array of lines and is not empty.
    if (!Array.isArray(parsedInputLines) || parsedInputLines.length === 0) {
        console.error("Input processing error: No valid data lines were found in the provided content.");
        renderFinalOutput(0); // Output a default value and terminate if input is invalid.
        return;
    }

    // The first line of input often contains metadata (e.g., item count) that needs to be skipped
    // or processed separately. Here, it is simply removed as per the problem's typical structure.
    const initialMetadataLine = parsedInputLines.shift();
    // (Optional: `initialMetadataLine` could be parsed if its content was relevant, e.g.,
    //  `const expectedEntries = Number.parseInt(initialMetadataLine, 10);` for validation.)

    let totalAccumulatedValue = 0; // Initialize the variable that will store the final sum.

    // Helper function to safely parse a string into an integer, returning null for invalid numbers.
    const safelyParseInteger = (strValue) => {
        const num = Number.parseInt(strValue.trim(), 10);
        return Number.isNaN(num) ? null : num; // Return `null` for any non-numeric result.
    };

    // Iterate through each remaining line to perform the core calculation.
    parsedInputLines.forEach((currentEntryLine, lineArrayIndex) => {
        // Skip lines that are empty or contain only whitespace, as they hold no relevant data.
        if (!currentEntryLine.trim()) {
            // console.debug(`Skipping empty or whitespace-only line at data index ${lineArrayIndex}.`);
            return; // Continue to the next line.
        }

        // Split the current line into its expected two numerical string components.
        const stringComponents = applyInputTransformation(currentEntryLine, DataParsingModes.SPLIT_BY_SPACE);

        // Validation: Ensure there are at least two components to parse.
        if (stringComponents.length < 2) {
            console.warn(`Malformed line detected on line ${lineArrayIndex + 2} (original index): "${currentEntryLine}". Expected at least two space-separated values. Skipping.`);
            return; // Skip lines that do not conform to the expected format.
        }

        // Parse the two values, leveraging the `safelyParseInteger` helper.
        const firstNumericValue = safelyParseInteger(stringComponents[0]);  // Corresponds to 'A'
        const secondNumericValue = safelyParseInteger(stringComponents[1]); // Corresponds to 'B'

        // Validation: Ensure both parsed values are indeed valid numbers.
        if (firstNumericValue === null || secondNumericValue === null) {
            console.warn(`Non-numeric content identified on line ${lineArrayIndex + 2}: "${currentEntryLine}". Skipping.`);
            return; // Skip lines containing non-numeric data.
        }

        // Core business logic: If the first value is strictly less than the second,
        // add the second value to our running total.
        if (firstNumericValue < secondNumericValue) {
            totalAccumulatedValue += secondNumericValue;
        }
        // Alternative compact expression:
        // totalAccumulatedValue += (firstNumericValue < secondNumericValue ? secondNumericValue : 0);
    });

    // Output the final calculated sum.
    renderFinalOutput(totalAccumulatedValue);
}

// --- Application Entry Point ---

// The script execution commences here:
// 1. Obtain the raw input string.
// 2. Pass the raw input to the main solution processing function.
processMainSolution(obtainSourceContent());