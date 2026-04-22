'use strict';

/**
 * Determines the count of consecutive even divisions for a given positive integer.
 * This function calculates how many times a number can be perfectly divided by 2
 * before it becomes odd or zero.
 *
 * @param {number} initialNumericValue The integer to analyze for even divisions.
 * @returns {number} The total count of successful divisions by 2. Returns 0 for non-positive or non-integer inputs.
 */
function quantifyBinaryDivisibility(initialNumericValue) {
    let divisionsAccumulator = 0;

    // Early exit for invalid or out-of-scope numbers (e.g., negative, zero, non-integer).
    // The problem context implies checking positive integers from 1 to N.
    if (initialNumericValue <= 0 || !Number.isInteger(initialNumericValue)) {
        return 0;
    }

    let currentWorkingValue = initialNumericValue; // Use a mutable copy for calculations.

    // Continue dividing by 2 as long as the number is positive and even.
    while (currentWorkingValue > 0 && currentWorkingValue % 2 === 0) {
        currentWorkingValue /= 2; // Perform the division.
        divisionsAccumulator++;   // Increment the count.
    }

    return divisionsAccumulator;
}

/**
 * Utility function to securely fetch content from a specified file path.
 * This abstracts the file system interaction.
 *
 * @param {string} sourcePath The absolute or relative path to the file.
 * @returns {string} The entire content of the file as a UTF-8 encoded string.
 *                   Returns an empty string in case of an error.
 */
function obtainFileContent(sourcePath) {
    try {
        const fileSystemUtility = require('fs');
        const fileContentBuffer = fileSystemUtility.readFileSync(sourcePath, 'utf8');
        return fileContentBuffer;
    } catch (ioError) {
        // Log the error for debugging, but prevent application crash for competitive programming scenarios.
        console.error("Failed to read input from specified path:", ioError.message);
        return ''; // Return an empty string to indicate failure or no content.
    }
}

/**
 * The primary execution function that orchestrates the logic.
 * It parses the input, iterates through a range of numbers, and identifies
 * the number with the highest count of successive divisions by 2.
 *
 * @param {string} rawSourceInput The raw string data received, typically from standard input.
 * @returns {void} This function prints the result directly to the console.
 */
const processComputationalTask = (rawSourceInput) => {
    // Prepare the input string by removing leading/trailing whitespace.
    const cleanInputString = rawSourceInput.trim();

    // Convert the cleaned string into an integer representing the upper bound.
    const numericalUpperBound = parseInt(cleanInputString, 10);

    // Implement robust input validation.
    // Ensure the parsed value is a valid positive integer for the problem's constraints.
    if (isNaN(numericalUpperBound) || numericalUpperBound <= 0) {
        console.error("Error: Provided input is not a valid positive integer. Please check the input data.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Variables to track the number that exhibits the maximum divisibility and its count.
    let bestCandidateNumber = 0;
    let maximumDivisibilityRecord = -1; // Initialize to -1 to ensure any valid count (0 or more) becomes the first record.

    // Loop through each integer from 1 up to the determined upper bound.
    for (let currentNumberInSequence = 1; currentNumberInSequence <= numericalUpperBound; ++currentNumberInSequence) {
        // Calculate the divisibility for the current number using our helper function.
        const currentNumberDivisibility = quantifyBinaryDivisibility(currentNumberInSequence);

        // Check if the current number's divisibility count surpasses the current maximum record.
        const isNewRecordAchieved = currentNumberDivisibility > maximumDivisibilityRecord;

        if (isNewRecordAchieved) {
            // If a new record is found, update both the best candidate number and the maximum count.
            bestCandidateNumber = currentNumberInSequence;
            maximumDivisibilityRecord = currentNumberDivisibility;
        }
    }

    // Output the final number that has the highest count of divisions by 2.
    console.log(bestCandidateNumber);
};

// Entry point of the script:
// 1. Obtain the input content from the standard input stream.
// 2. Invoke the main processing function with the acquired content.
const stdinContent = obtainFileContent('/dev/stdin');
processComputationalTask(stdinContent);