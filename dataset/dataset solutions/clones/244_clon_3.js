// This module is essential for file system operations, particularly reading input.
const fileSystemModule = require('fs');

// Extending String.prototype for demonstrating Type III transformations.
// This is not standard practice but serves to illustrate extensive code modifications.
if (!String.prototype.stripWhitespace) {
    /**
     * Custom method to remove leading and trailing whitespace from a string.
     * Behaves identically to String.prototype.trim().
     * @returns {string} The string with whitespace removed.
     */
    String.prototype.stripWhitespace = function() {
        return this.trim();
    };
}
if (!String.prototype.divideIntoTokens) {
    /**
     * Custom method to split a string into an array of substrings using a specified separator.
     * Behaves identically to String.prototype.split().
     * @param {string|RegExp} separator - The pattern describing where each split should occur.
     * @returns {string[]} An array of strings.
     */
    String.prototype.divideIntoTokens = function(separator) {
        return this.split(separator);
    };
}

// Defining the standard input path for data acquisition.
const standardInputSourcePath = '/dev/stdin';

// Constants for configuring the processing logic and enhancing readability.
const REFERENCE_SEQUENCE_START = 1;
const REFERENCE_SEQUENCE_END = 10;
const CALCULATION_MAGIC_BASE = 20;
const REQUIRED_POSITIVE_MATCHES = 4;
const INPUT_TRIPLET_SIZE = 3; // Input data is processed in groups of three elements.

/**
 * Converts a string into its numeric representation. If the string cannot be
 * parsed as a number, it returns NaN, which preserves behavior similar to
 * implicit numeric conversions (e.g., `string * 1`).
 * @param {string} textValue - The string to be converted.
 * @returns {number} The numeric value of the string, or NaN if parsing fails.
 */
const convertToNumberSafely = (textValue) => {
    return Number(textValue);
};

/**
 * Generates an ordered array of integers within a specified inclusive range.
 * @param {number} beginningValue - The starting integer of the sequence.
 * @param {number} endingValue - The last integer of the sequence.
 * @returns {number[]} An array containing numbers from beginningValue to endingValue.
 */
const generateIntegerSequence = (beginningValue, endingValue) => {
    const resultingSequence = [];
    for (let currentNum = beginningValue; currentNum <= endingValue; currentNum++) {
        resultingSequence.push(currentNum);
    }
    return resultingSequence;
};

// Main application logic, encapsulated within an Immediately Invoked Function Expression (IIFE)
// to maintain a clean global scope and manage execution flow.
(function executeProcessingWorkflow() {
    let rawFileData; // Variable to hold the raw content read from the input source.
    try {
        // Attempt to read the entire file content synchronously.
        rawFileData = fileSystemModule.readFileSync(standardInputSourcePath, 'utf8');
    } catch (inputReadError) {
        // Log an error and terminate if the input file cannot be read, which is a critical failure.
        console.error(`FATAL ERROR: Failed to read from input source "${standardInputSourcePath}". Details: ${inputReadError.message}`);
        return;
    }

    // Pre-process the raw file data: remove leading/trailing whitespace, then split into tokens.
    const processedInputTokens = rawFileData.stripWhitespace().divideIntoTokens(/\s/);

    // Validate the input: ensure there are enough tokens to form at least one complete triplet.
    if (processedInputTokens.length < INPUT_TRIPLET_SIZE) {
        console.log("No complete data triplets detected in the input. Processing terminated.");
        return;
    }

    // Construct the fixed reference sequence of numbers (1 through 10).
    const referenceNumberCollection = generateIntegerSequence(REFERENCE_SEQUENCE_START, REFERENCE_SEQUENCE_END);

    let currentSegmentStartingIndex = 0; // Index to track the beginning of the current triplet.

    // Iterate through the input tokens, processing them in chunks of INPUT_TRIPLET_SIZE.
    // The loop continues as long as a full triplet can be extracted.
    while (currentSegmentStartingIndex <= processedInputTokens.length - INPUT_TRIPLET_SIZE) {
        // Extract and explicitly convert the three components of the current triplet to numbers.
        const firstInputComponent = convertToNumberSafely(processedInputTokens[currentSegmentStartingIndex]);
        const secondInputComponent = convertToNumberSafely(processedInputTokens[currentSegmentStartingIndex + 1]);
        const thirdInputComponent = convertToNumberSafely(processedInputTokens[currentSegmentStartingIndex + 2]);

        let successfulMatchCounter = 0; // Counter for valid matches within the current triplet context.

        // Calculate a dynamic upper limit for comparison based on the first two components.
        // If firstInputComponent or secondInputComponent is NaN, this will also result in NaN.
        const computedComparisonLimit = CALCULATION_MAGIC_BASE - (firstInputComponent + secondInputComponent);

        // Create a Set for efficient checking of values that should be excluded from matches.
        // NaN values in the Set are handled correctly for checking against other NaN values.
        const forbiddenValuesSet = new Set([firstInputComponent, secondInputComponent, thirdInputComponent]);

        // Iterate through each number in the predefined reference collection.
        for (const candidateValue of referenceNumberCollection) {
            // Check the first criterion: candidate value must be less than or equal to the computed limit.
            // If computedComparisonLimit is NaN, this comparison will always be false.
            const satisfiesLimitCondition = candidateValue <= computedComparisonLimit;

            // Check the second criterion: candidate value must not be one of the three input components.
            // This handles numeric and NaN comparisons correctly.
            const isNotAmongForbidden = !forbiddenValuesSet.has(candidateValue);

            // If both conditions are met, increment the match counter.
            if (satisfiesLimitCondition && isNotAmongForbidden) {
                successfulMatchCounter++;
            }
        }

        // Determine and output the final result based on the total successful matches.
        const finalDetermination = (successfulMatchCounter >= REQUIRED_POSITIVE_MATCHES) ? "Yes" : "No";
        console.log(finalDetermination);

        // Advance the index to the beginning of the next triplet for subsequent processing.
        currentSegmentStartingIndex += INPUT_TRIPLET_SIZE;
    }
})(); // End of the IIFE execution.