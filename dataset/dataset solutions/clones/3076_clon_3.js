'use strict';

/**
 * Global instance for managing input operations, initialized once at script start.
 * This object handles reading lines from stdin sequentially.
 */
const inputHandler = initializeInputProcessor();

/**
 * Kicks off the main problem-solving routine after input setup.
 */
processSolution();

/**
 * Reads the entire input from standard input (/dev/stdin) as a UTF-8 string,
 * trims leading/trailing whitespace, and then splits it into an array of individual lines.
 *
 * @returns {string[]} An array where each element represents a single line from the input.
 *                     Returns an empty array if input is empty or an error occurs.
 */
function loadRawInputFromFile() {
    try {
        const fileSystem = require("fs"); // Dynamically require fs module.
        const rawContent = fileSystem.readFileSync("/dev/stdin", "utf8");
        // Remove any leading/trailing blank lines or whitespace from the entire input.
        const processedLines = rawContent.trim().split("\n");

        // If the input was just whitespace or completely empty, split might return [''],
        // so we normalize it to an empty array.
        if (processedLines.length === 1 && processedLines[0] === '') {
            return [];
        }
        return processedLines;
    } catch (errorReading) {
        logError(`Failed to read input file from /dev/stdin: ${errorReading.message}`);
        // In a production environment, this might lead to process exit or a more complex fallback.
        return []; // Gracefully return an empty array to prevent immediate crash.
    }
}

/**
 * Initializes a stateful object designed for sequential access to input lines.
 * This object encapsulates the input buffer and its current reading position.
 *
 * @returns {object} An object containing methods to check for and retrieve the next input lines.
 */
function initializeInputProcessor() {
    const rawInputLines = loadRawInputFromFile(); // Load all input lines upfront.

    const readerState = {
        linesBuffer: rawInputLines,      // Stores all lines read from input.
        currentLineIdx: 0,               // Tracks the index of the next line to be read.
        totalLines: rawInputLines.length, // Total number of lines available.

        /**
         * Determines if there are any unread lines left in the input buffer.
         *
         * @returns {boolean} `true` if more lines are available, `false` otherwise.
         */
        hasMoreLines: function() {
            return this.currentLineIdx < this.totalLines;
        },

        /**
         * Retrieves the next available line from the input buffer and advances the pointer.
         *
         * @returns {string} The next line of input. Returns an empty string if no more lines
         *                   are available, accompanied by an error log.
         */
        fetchNextLine: function() {
            if (!this.hasMoreLines()) {
                logError("Attempted to read beyond the end of the input data stream.");
                return ""; // Provide a default empty string to avoid crashes.
            }
            const lineContent = this.linesBuffer[this.currentLineIdx];
            this.currentLineIdx++; // Move to the next line for subsequent calls.
            return lineContent;
        }
    };
    return readerState;
}

/**
 * Retrieves the next raw input line by delegating to the global input handler.
 *
 * @returns {string} The next line of input as a string.
 */
function fetchNextLine() {
    return inputHandler.fetchNextLine();
}

/**
 * Checks if there are more lines available in the input stream.
 *
 * @returns {boolean} `true` if more lines can be fetched, `false` otherwise.
 */
function hasMoreLines() {
    return inputHandler.hasMoreLines();
}

/**
 * Processes an input value according to a specified conversion type.
 * This function centralizes various parsing and formatting operations.
 *
 * @param {string|string[]} inputValue The value (string or array of strings) to be processed.
 * @param {number} conversionType A numeric code indicating the desired operation:
 *   - 1: Convert string to an integer.
 *   - 2: Split string by spaces into a string array.
 *   - 4: Split string by spaces and convert each part to a number array.
 *   - 6: Split string into an array of individual characters.
 *   - 7: Split string into characters and convert each to a number array.
 *   - 8: Join an array of items with a single space.
 *   - 9: Join an array of items with a newline character.
 *   - 0: Join an array of items without any separator.
 * @returns {any} The result of the conversion or the original value if conversion fails or is unknown.
 */
function processInputValue(inputValue, conversionType) {
    let splitResult; // Helper variable for split operations.
    try {
        switch (conversionType) {
            case 1: // Convert to integer
                const parsedInteger = parseInt(String(inputValue), 10); // Ensure base 10.
                if (isNaN(parsedInteger)) {
                    logError(`Warning: Failed to parse "${inputValue}" as an integer. Returning 0.`);
                    return 0; // Fallback to 0 or original value.
                }
                return parsedInteger;
            case 2: // Split string by space into an array of strings
                return String(inputValue).split(" ");
            case 4: // Split string by space and convert to an array of numbers
                splitResult = String(inputValue).split(" ");
                return splitResult.map((segment) => Number(segment));
            case 6: // Split string into an array of individual characters
                return String(inputValue).split("");
            case 7: // Split string into characters and convert to an array of numbers
                splitResult = String(inputValue).split("");
                return splitResult.map((charSegment) => Number(charSegment));
            case 8: // Join an array of items with a space
                if (Array.isArray(inputValue)) {
                    return inputValue.join(" ");
                }
                logError(`Error: Expected an array for join type 8, but received: ${typeof inputValue}.`);
                return String(inputValue); // Fallback.
            case 9: // Join an array of items with a newline
                if (Array.isArray(inputValue)) {
                    return inputValue.join("\n");
                }
                logError(`Error: Expected an array for join type 9, but received: ${typeof inputValue}.`);
                return String(inputValue); // Fallback.
            case 0: // Join an array of items without any separator
                if (Array.isArray(inputValue)) {
                    return inputValue.join("");
                }
                logError(`Error: Expected an array for join type 0, but received: ${typeof inputValue}.`);
                return String(inputValue); // Fallback.
            default:
                logError(`Unknown conversion type specified: ${conversionType}. Returning original value.`);
                return inputValue; // Return original value for unknown types.
        }
    } catch (conversionError) {
        logError(`An unexpected error occurred during value conversion (type ${conversionType}): ${conversionError.message}`);
        return inputValue; // Return original value if any error occurs during processing.
    }
}

/**
 * Reads the next line from input and attempts to convert it into an integer.
 *
 * @returns {number} The parsed integer value.
 */
function readInteger() {
    return processInputValue(fetchNextLine(), 1);
}

/**
 * Reads the next line, splits it by spaces, and returns the parts as a string array.
 *
 * @returns {string[]} An array of strings.
 */
function readStringArray() {
    return processInputValue(fetchNextLine(), 2);
}

/**
 * Reads the next line, splits it by spaces, and converts each part into a number,
 * returning them as an array of numbers.
 *
 * @returns {number[]} An array of numbers.
 */
function readIntegerArray() {
    return processInputValue(fetchNextLine(), 4);
}

/**
 * Reads the next line and breaks it down into an array of individual characters.
 *
 * @returns {string[]} An array of characters.
 */
function readCharList() {
    return processInputValue(fetchNextLine(), 6);
}

/**
 * Outputs the provided content to the standard output stream (console.log).
 * This function serves as the primary mechanism for displaying results.
 *
 * @param {any} content The data or message to be printed to stdout.
 */
function displayResult(content) {
    console.log(content);
}

/**
 * Logs an error message to the standard error stream (console.error).
 * Each error message is prefixed with a timestamp for better debugging context.
 *
 * @param {string} message The error description or message to log.
 */
function logError(message) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ERROR: ${message}`);
}

/**
 * The main function containing the problem's solution logic.
 * It reads dimensions, combines lists of numbers in stages, sorts the sums,
 * and outputs the top K results.
 */
function processSolution() {
    // Read the initial line containing problem parameters: dimX, dimY, dimZ, limitK.
    const initialParameters = readIntegerArray();

    // Validate the number of initial parameters.
    if (initialParameters.length < 4) {
        logError("Insufficient initial parameters provided. Expected 4 values (X, Y, Z, K).");
        return; // Terminate execution if critical input is missing.
    }

    const dimX = initialParameters[0];
    const dimY = initialParameters[1];
    const dimZ = initialParameters[2];
    const limitK = initialParameters[3];

    // Basic validation for the limitK parameter.
    if (limitK <= 0) {
        logError(`Invalid limit K value: ${limitK}. K must be a positive integer.`);
        return; // Terminate if K is non-positive.
    }

    // Read the three lists of integers for X, Y, and Z dimensions.
    const dataX = readIntegerArray();
    const dataY = readIntegerArray();
    const dataZ = readIntegerArray();

    // Optional: Add validation for actual array lengths vs. declared dimensions.
    if (dataX.length !== dimX || dataY.length !== dimY || dataZ.length !== dimZ) {
         logError(`Dimension mismatch detected: Declared X=${dimX}, Y=${dimY}, Z=${dimZ} vs. Actual X=${dataX.length}, Y=${dataY.length}, Z=${dataZ.length}. Proceeding with actual lengths.`);
         // For competitive programming, often assumed valid, but good for robustness.
    }

    // --- Stage 1: Combine elements from dataX and dataY by summing them. ---
    // Pre-allocate the array to its maximum possible size for efficiency.
    const intermediateSumsXY = new Array(dimX * dimY);
    let currentFillIdxXY = 0; // Tracks the current insertion point in intermediateSumsXY.

    for (let i = 0; i < dimX; i++) {
        // Guard against dataX being shorter than declared dimX.
        if (i >= dataX.length) {
            logError(`dataX index ${i} out of bounds (length ${dataX.length}). Breaking outer loop early.`);
            break;
        }
        const valueX = dataX[i];

        for (let j = 0; j < dimY; j++) {
            // Guard against dataY being shorter than declared dimY.
            if (j >= dataY.length) {
                logError(`dataY index ${j} out of bounds (length ${dataY.length}). Breaking inner loop early.`);
                break;
            }
            const valueY = dataY[j];
            const currentSumXY = valueX + valueY;
            intermediateSumsXY[currentFillIdxXY++] = currentSumXY;
        }
    }

    // Adjust the array to its actual filled size, in case loops broke early.
    const actualIntermediateSumsXY = intermediateSumsXY.slice(0, currentFillIdxXY);

    // Sort the combined sums in descending order (largest first).
    actualIntermediateSumsXY.sort((valA, valB) => valB - valA);

    // Type III change: Limit the intermediate sums to 'limitK' elements.
    // This is a crucial optimization for performance, as only the top 'limitK' sums
    // are relevant for the next stage, especially when dimX * dimY is very large.
    const topKIntermediateSums = actualIntermediateSumsXY.slice(0, limitK);

    // --- Stage 2: Combine the top K intermediate sums with elements from dataZ. ---
    // Pre-allocate the final combinations array.
    const finalCombinations = new Array(topKIntermediateSums.length * dimZ);
    let currentFillIdxFinal = 0; // Tracks the current insertion point in finalCombinations.

    for (let i = 0; i < topKIntermediateSums.length; i++) {
        const sumFromXY = topKIntermediateSums[i];

        for (let j = 0; j < dimZ; j++) {
            // Guard against dataZ being shorter than declared dimZ.
            if (j >= dataZ.length) {
                logError(`dataZ index ${j} out of bounds (length ${dataZ.length}). Breaking inner loop early.`);
                break;
            }
            const valueZ = dataZ[j];
            const currentTotalSum = sumFromXY + valueZ;
            finalCombinations[currentFillIdxFinal++] = currentTotalSum;
        }
    }

    // Adjust the final array to its actual filled size.
    const actualFinalCombinations = finalCombinations.slice(0, currentFillIdxFinal);

    // Sort the final combined sums in descending order.
    actualFinalCombinations.sort((valA, valB) => valB - valA);

    // Type III change: Limit the final combinations to 'limitK' elements for the output.
    const topKFinalResults = actualFinalCombinations.slice(0, limitK);

    // Output the top K sums, with each sum on a new line.
    displayResult(processInputValue(topKFinalResults, 9));
}