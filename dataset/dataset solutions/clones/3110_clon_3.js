// This module provides a set of robust utilities for handling standard input and output
// in a structured manner, specifically tailored for competitive programming environments.
// It includes functions for reading various data types and performing common transformations.

// --- Global Input Stream Manager ---
// A singleton instance responsible for managing the sequential reading of input lines.
let inputProcessorInstance;

// Immediately initialize the input system when the script loads.
// This sets up the input buffer and prepares for line-by-line consumption.
initializeInputSystem();

// --- Program Entry Point ---
// The primary function where the main algorithm logic resides.
executeMainAlgorithm();

// --- Input Acquisition Functions ---

/**
 * Reads the next available line from the input stream and attempts to parse it as an integer.
 * Handles cases where no more input is available by returning NaN and logging an error.
 * @returns {number} The parsed integer value, or NaN if parsing fails or no input.
 */
function obtainIntegerLine() {
    const currentLineData = getNextInputLine();
    if (currentLineData === null) {
        logDiagnosticMessage("ERROR", "Attempted to read integer from an exhausted input stream.");
        return NaN; // Indicate failure to parse a valid integer.
    }
    // Delegate to the data transformer for actual conversion.
    return dataTransformer(currentLineData, 1); // Type 1: String to integer conversion.
}

/**
 * Retrieves the next line, splits it by whitespace characters, and returns an array of strings.
 * Returns an empty array if the input stream is empty.
 * @returns {string[]} An array containing string tokens from the line.
 */
function obtainStringTokens() {
    const currentLineData = getNextInputLine();
    if (currentLineData === null) {
        logDiagnosticMessage("WARNING", "Attempted to read string tokens from an empty input stream.");
        return [];
    }
    return dataTransformer(currentLineData, 2); // Type 2: String split by space.
}

/**
 * Fetches the next line, splits it by whitespace, and converts each resulting token into a number.
 * Returns an empty array if the input stream is empty.
 * @returns {number[]} An array of numbers parsed from the line's tokens.
 */
function obtainIntegerTokens() {
    const currentLineData = getNextInputLine();
    if (currentLineData === null) {
        logDiagnosticMessage("WARNING", "Attempted to read integer tokens from an empty input stream.");
        return [];
    }
    return dataTransformer(currentLineData, 4); // Type 4: String split by space and mapped to numbers.
}

/**
 * Reads the next line and breaks it down into an array where each element is a single character.
 * Returns an empty array if the input stream is empty.
 * @returns {string[]} An array of individual characters from the line.
 */
function obtainCharacterTokens() {
    const currentLineData = getNextInputLine();
    if (currentLineData === null) {
        logDiagnosticMessage("WARNING", "Attempted to read character tokens from an empty input stream.");
        return [];
    }
    return dataTransformer(currentLineData, 6); // Type 6: String split into individual characters.
}

/**
 * Delegates to the global input processor to fetch the subsequent line of input.
 * @returns {string | null} The next line of input as a string, or null if the stream is exhausted.
 */
function getNextInputLine() {
    // Ensure the input processor is ready before attempting to fetch.
    if (!inputProcessorInstance || !inputProcessorInstance.hasMoreData()) {
        return null;
    }
    return inputProcessorInstance.retrieveNextItem();
}

/**
 * Checks if there are any remaining lines in the input stream that can be read.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function checkMoreInputAvailable() {
    return inputProcessorInstance ? inputProcessorInstance.hasMoreData() : false;
}

// --- Fundamental I/O Operations ---

/**
 * Reads all raw input data from standard input (`/dev/stdin`).
 * This function is specific to Node.js environments.
 * @returns {string[]} An array where each element is a line from the input file.
 */
function acquireRawInputData() {
    // Requires the 'fs' module for file system operations.
    const rawBuffer = require("fs").readFileSync("/dev/stdin", "utf8");
    // Trim any leading/trailing whitespace from the entire input and then split by newline.
    return rawBuffer.trim().split("\n");
}

/**
 * Sets up the global input processing system. This involves reading all input
 * into a buffer and preparing an object to manage sequential access.
 */
function initializeInputSystem() {
    const acquiredLines = acquireRawInputData();
    const totalInputLines = acquiredLines.length;

    // A preliminary check to ensure that some input was actually provided.
    if (totalInputLines === 0) {
        logDiagnosticMessage("WARNING", "No input lines were detected from /dev/stdin. The input stream is empty.");
        // Create a dummy processor to prevent runtime errors if input is expected later.
        inputProcessorInstance = {
            lineBuffer: [],
            currentPosition: 0,
            bufferSize: 0,
            hasMoreData: () => false,
            retrieveNextItem: () => null
        };
        return;
    }

    // Configure the global input processor with the acquired data.
    inputProcessorInstance = {
        lineBuffer: acquiredLines,
        currentPosition: 0,
        bufferSize: totalInputLines,

        /**
         * Determines if there are more lines left in the input buffer to be processed.
         * @returns {boolean} True if `currentPosition` is within the bounds of `bufferSize`.
         */
        hasMoreData: function() {
            return this.currentPosition < this.bufferSize;
        },

        /**
         * Fetches the next line from the buffer and advances the internal pointer.
         * @returns {string | null} The content of the next line, or null if no more lines.
         */
        retrieveNextItem: function() {
            if (!this.hasMoreData()) {
                return null; // All input lines have been consumed.
            }
            const dataToReturn = this.lineBuffer[this.currentPosition];
            this.currentPosition++; // Increment the pointer for the next read.
            return dataToReturn;
        }
    };
}

/**
 * Outputs a given message to standard console output.
 * This is the primary function for displaying results to the user.
 * @param {any} messageData The data to be printed to stdout.
 */
function displayProgramOutput(messageData) {
    console.log(messageData);
}

/**
 * Logs a diagnostic message to standard error output.
 * Useful for debugging, warnings, or non-critical error reporting.
 * @param {"INFO" | "WARNING" | "ERROR"} level The severity level of the message.
 * @param {string} message The diagnostic message content.
 */
function logDiagnosticMessage(level, message) {
    console.error(`[${level}] ${message}`);
}

/**
 * A versatile utility function for transforming input values (strings or arrays)
 * based on a specified transformation type code.
 *
 * @param {any} inputVal The value to be transformed. Can be a string or an array.
 * @param {number} transformCode A numeric code defining the desired transformation:
 *   - 1: Converts a string to a number.
 *   - 2: Splits a string by single spaces into an array of strings.
 *   - 4: Splits a string by spaces and converts each part to a number, returning an array of numbers.
 *   - 6: Splits a string into an array of individual characters.
 *   - 7: Splits a string into individual characters and converts each to a number, returning an array of numbers.
 *   - 8: Joins array elements into a single string, separated by spaces.
 *   - 9: Joins array elements into a single string, separated by newline characters.
 *   - 0: Joins array elements into a single string without any separator.
 * @returns {any} The transformed value. If an error occurs or the `transformCode` is unknown,
 *                 the original `inputVal` is returned, and an error is logged.
 */
function dataTransformer(inputVal, transformCode) {
    // Initial validation: check for null or undefined input to prevent immediate errors.
    if (inputVal === null || typeof inputVal === 'undefined') {
        logDiagnosticMessage("WARNING", `Transformation attempted on null/undefined input for code ${transformCode}.`);
        return inputVal; // Return the original null/undefined value.
    }

    try {
        switch (transformCode) {
            case 1: // Convert to integer
                return Number(inputVal);
            case 2: // Split string by space
                if (typeof inputVal !== 'string') throw new TypeError("Input for type 2 transformation must be a string.");
                return inputVal.split(" ");
            case 4: // Split string by space and convert to numbers
                if (typeof inputVal !== 'string') throw new TypeError("Input for type 4 transformation must be a string.");
                return inputVal.split(" ").map((itemSegment) => Number(itemSegment));
            case 6: // Split string into individual characters
                if (typeof inputVal !== 'string') throw new TypeError("Input for type 6 transformation must be a string.");
                return inputVal.split("");
            case 7: // Split string into individual characters and convert to numbers
                if (typeof inputVal !== 'string') throw new TypeError("Input for type 7 transformation must be a string.");
                return inputVal.split("").map((charSegment) => Number(charSegment));
            case 8: // Join array elements with space
                if (!Array.isArray(inputVal)) throw new TypeError("Input for type 8 transformation must be an array.");
                return inputVal.join(" ");
            case 9: // Join array elements with newline
                if (!Array.isArray(inputVal)) throw new TypeError("Input for type 9 transformation must be an array.");
                return inputVal.join("\n");
            case 0: // Join array elements without separator
                if (!Array.isArray(inputVal)) throw new TypeError("Input for type 0 transformation must be an array.");
                return inputVal.join("");
            default:
                // Log an error for unrecognized transformation codes.
                logDiagnosticMessage("ERROR", `Unrecognized transformation code: ${transformCode}. Returning original input.`);
                return inputVal;
        }
    } catch (conversionError) {
        logDiagnosticMessage("ERROR", `Failed during data transformation (code ${transformCode}): ${conversionError.message}`);
        return inputVal; // Return the original value if an error occurs during conversion.
    }
}

/**
 * The core algorithm of the program. It reads a sequence of numbers, performs
 * a specific validation, and then reorders the sequence based on a defined rule.
 * The goal is to extract elements from the sequence until it's empty,
 * placing them into a result stack in a specific order.
 */
function executeMainAlgorithm() {
    const totalCount = obtainIntegerLine(); // Read N, the total number of elements.

    // --- Input Validation: Initial Count ---
    // Ensure N is a valid positive integer.
    if (isNaN(totalCount) || totalCount <= 0) {
        logDiagnosticMessage("ERROR", `Invalid or non-positive value for total elements received: ${totalCount}. Program halted.`);
        displayProgramOutput(-1);
        return; // Terminate execution early.
    }

    const numberSequence = obtainIntegerTokens(); // Read the array of N integers.

    // --- Input Validation: Sequence Length Mismatch ---
    // Verify that the actual number of elements read matches the declared total count.
    if (numberSequence.length !== totalCount) {
        logDiagnosticMessage("ERROR", `Declared total elements (${totalCount}) does not match actual sequence length (${numberSequence.length}). Program halted.`);
        displayProgramOutput(-1);
        return;
    }

    // --- Pre-processing Validation: Sequence Property Check ---
    // Iterate through the sequence to ensure that no element `numberSequence[k]` is greater than `k + 1`.
    let isSequenceInitiallyViolated = false;
    for (let currentElementIndex = 0; currentElementIndex < totalCount; currentElementIndex++) {
        if (numberSequence[currentElementIndex] > (currentElementIndex + 1)) {
            isSequenceInitiallyViolated = true;
            break; // A violation is found; no need to check further.
        }
    }

    if (isSequenceInitiallyViolated) {
        logDiagnosticMessage("ERROR", "Initial sequence condition violated: an element's value exceeds its maximum allowed index-based value. Program halted.");
        displayProgramOutput(-1);
        return; // Exit if the sequence doesn't meet the initial criteria.
    }

    // --- Core Algorithm: Sequence Reordering ---
    const finalResultStack = []; // This array will store the elements in their final, reordered form.
    let inspectionPointer = 0; // Acts as a mutable index for traversing the `numberSequence`.
    const maximumIterationsAllowed = 1000000; // A safeguard against potential infinite loops.
    let currentIterationCount = 0;

    // Continue processing as long as there are elements left in the `numberSequence`.
    while (numberSequence.length > 0) {
        currentIterationCount++;
        // Emergency break for extremely long or potentially infinite loops.
        if (currentIterationCount > maximumIterationsAllowed) {
            logDiagnosticMessage("FATAL", "Algorithm exceeded maximum allowed iterations. This indicates a potential infinite loop or extremely large input.");
            displayProgramOutput(-1);
            return;
        }

        // Check if the current element matches its expected value based on its current position.
        // The condition is `value === index + 1`.
        if (numberSequence[inspectionPointer] === (inspectionPointer + 1)) {
            // If the element matches, simply move the pointer to the next element.
            inspectionPointer++;
        } else {
            // If the element does not match, it implies the element *before* the current pointer
            // is the one that needs to be removed and added to the result.
            // This case should not be hit if `inspectionPointer` is 0, as `numberSequence[0]`
            // must be 1 for the sequence to be constructible.
            if (inspectionPointer === 0) {
                logDiagnosticMessage("ERROR", "Algorithm reached an unexpected state: inspection pointer is at 0, but the element does not match its expected value (1). This state is unresolvable.");
                displayProgramOutput(-1);
                return;
            }

            const elementToExtract = numberSequence[inspectionPointer - 1];
            finalResultStack.unshift(elementToExtract); // Add to the beginning of the result stack.
            numberSequence.splice(inspectionPointer - 1, 1); // Remove the element from its current position.

            // Reset the inspection pointer to the beginning of the (now modified) sequence
            // to re-evaluate from the start.
            inspectionPointer = 0;
        }
    }

    // --- Final Output Generation ---
    // If the `finalResultStack` is unexpectedly empty despite a positive `totalCount`,
    // it suggests an issue. Otherwise, format and display the result.
    if (finalResultStack.length === 0 && totalCount > 0) {
        logDiagnosticMessage("WARNING", "The final result stack is empty, but the initial input count was positive. This might indicate an unhandled edge case or an issue in the algorithm logic.");
        displayProgramOutput(-1); // Or an appropriate empty result string.
    } else {
        // Transform the array of numbers into a newline-separated string for output.
        displayProgramOutput(dataTransformer(finalResultStack, 9));
    }
}