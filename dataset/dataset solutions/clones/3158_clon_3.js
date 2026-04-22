"use strict"; // Maintaining strict mode for robust code execution

/**
 * A utility function designed to securely read input from the standard input stream.
 * This function is critical for processing external data provided to the script.
 * Error handling is included to manage potential issues during file system access.
 *
 * @returns {string} The complete raw string content read from '/dev/stdin'.
 *                   Returns an empty string if an error occurs during reading.
 */
function acquireSystemInputData() {
    try {
        // Dynamically requiring the 'fs' (file system) module, which is standard in Node.js environments.
        const fileSystemUtility = require('fs');
        // Reading the entire content of '/dev/stdin' as a UTF-8 encoded string.
        return fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
    } catch (inputError) {
        // Logging an error message if input cannot be read, which is a Type III addition for robustness.
        console.error("Critical Input Error: Unable to read data from /dev/stdin. Details:", inputError.message);
        // In a production scenario, one might terminate the process or use a fallback.
        // For this clone, an empty string is returned to allow the program to attempt graceful continuation.
        return "";
    }
}

/**
 * Processes the raw input payload to extract the primary sequence of interest.
 * This typically involves taking the first line of a potentially multi-line input.
 * Includes basic type and content validation for the input string.
 *
 * @param {string} fullInputPayload - The entire string received from the input source.
 * @returns {string} The first significant line of the input, or an empty string if input is invalid.
 */
function extractPrimaryDataLine(fullInputPayload) {
    // Guard clause: Checks if the input is a valid non-empty string.
    if (typeof fullInputPayload !== 'string' || fullInputPayload.trim().length === 0) {
        console.warn("Input Warning: Provided payload is empty or not a string. No data to process.");
        return ""; // Returning an empty string signifies no valid data was found.
    }
    // Splitting the input by newline characters and taking the very first element.
    const inputLinesArray = fullInputPayload.split("\n");
    return inputLinesArray[0];
}

/**
 * Displays the final computed numerical result to the console.
 * This helper function centralizes output operations, making them easier to manage or modify.
 *
 * @param {number} calculatedOutcome - The numerical value representing the final result.
 */
function presentFinalCalculation(calculatedOutcome) {
    // Using console.log as the standard output mechanism.
    console.log(calculatedOutcome);
    // Optional: Add more descriptive output if required, e.g., `console.log("Characters removed: " + calculatedOutcome);`
}

/**
 * The main execution flow for processing a given binary sequence.
 * It identifies and counts characters that can be "cancelled out" by adjacent '01' or '10' pairs.
 * The cancellation process is iterative until no more such pairs can be found.
 *
 * @param {string} rawInputContent - The raw string input received, potentially multi-line.
 */
const initiateSequenceReduction = (rawInputContent) => {
    // Initial validation of the raw input content as a Type III guard clause.
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.error("Processing Halted: Invalid or empty raw input received. Cannot proceed.");
        presentFinalCalculation(0); // If no valid input, no characters could be removed.
        return;
    }

    const initialBinarySequence = extractPrimaryDataLine(rawInputContent);

    // Additional validation: Ensure the extracted sequence consists only of '0's and '1's.
    // This is a Type III addition for input robustness.
    const binaryCharacterPattern = /^[01]*$/;
    if (!binaryCharacterPattern.test(initialBinarySequence)) {
        console.warn("Data Integrity Alert: Input sequence contains characters other than '0' or '1'. " +
                     "Processing will continue, but results might be unexpected for non-binary data.");
        // One could choose to throw an error here, sanitize, or filter, depending on strictness.
    }

    const originalSequenceLength = initialBinarySequence.length;
    let currentMutableSequence = initialBinarySequence;
    let wasAnyCancellationPerformedInThisCycle; // Flag to track if modifications occurred in a full pass

    // The core iterative cancellation loop. It continues as long as any '01' or '10' pairs
    // are successfully removed within a complete pass, ensuring full reduction.
    do {
        wasAnyCancellationPerformedInThisCycle = false; // Reset flag for the current iteration of the do-while loop

        // Step 1: Remove all occurrences of "01" from the current sequence.
        // Using split-join is functionally equivalent to replaceAll but is widely compatible.
        const sequenceAfterZeroOneReduction = currentMutableSequence.split("01").join("");
        if (sequenceAfterZeroOneReduction.length < currentMutableSequence.length) {
            // If the length decreased, it means "01" pairs were removed.
            wasAnyCancellationPerformedInThisCycle = true;
            currentMutableSequence = sequenceAfterZeroOneReduction;
        }

        // Step 2: Remove all occurrences of "10" from the (potentially updated) sequence.
        const sequenceAfterOneZeroReduction = currentMutableSequence.split("10").join("");
        if (sequenceAfterOneZeroReduction.length < currentMutableSequence.length) {
            // If the length decreased, it means "10" pairs were removed.
            wasAnyCancellationPerformedInThisCycle = true;
            currentMutableSequence = sequenceAfterOneZeroReduction;
        }

        // The loop repeats if any reduction (either "01" or "10") happened in this cycle.
        // This ensures that new pairs formed by previous reductions (e.g., "0110" -> "00" then "0" if "10" is removed)
        // are also caught and processed.
    } while (wasAnyCancellationPerformedInThisCycle);

    // Calculate the final count of characters that were successfully eliminated.
    const totalCancelledCharacters = originalSequenceLength - currentMutableSequence.length;

    // Output the final result using the dedicated presentation function.
    presentFinalCalculation(totalCancelledCharacters);
};

// The primary entry point for script execution.
// It orchestrates fetching the input and then initiating the processing.
initiateSequenceReduction(acquireSystemInputData());