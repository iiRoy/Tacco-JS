"use strict";

/**
 * Core function to process a numeric value:
 * 1. Parses the number from the provided raw data.
 * 2. Calculates the sum of its digits.
 * 3. Determines if the original number is perfectly divisible by the sum of its digits.
 * 4. Outputs a predefined success or failure message.
 * Extensive error handling and validation are included for robustness.
 * @param {string} rawDataContent - The raw string input, expected to contain a number on the first line.
 */
function processInputData(rawDataContent) {
    let parsedNumericValue;       // Holds the initial number extracted from input.
    let currentWorkingNumber;     // A mutable copy of the number used for digit extraction.
    let accumulatedDigitSum = 0;  // Accumulator for the total sum of digits.

    // Constants for standardized output messages.
    const successMessage = "Result: YES";
    const failureMessage = "Result: NO";

    try {
        // --- Input Extraction and Initial Validation ---
        // Split the raw content into individual lines.
        const inputLines = rawDataContent.split('\n');

        // Guard clause: Check if the input is empty or the first line is blank.
        if (inputLines.length === 0 || inputLines[0].trim() === '') {
            console.error("Error: Input data is empty or contains no valid numeric line.");
            console.log(failureMessage); // Default to failure for invalid input.
            return;
        }

        // Attempt to convert the first line into a number, trimming any whitespace.
        parsedNumericValue = Number(inputLines[0].trim());

        // Guard clause: Validate the parsed number.
        // It must be a valid, non-negative integer.
        if (isNaN(parsedNumericValue) || parsedNumericValue < 0 || !Number.isInteger(parsedNumericValue)) {
            console.error(`Validation Error: Provided input "${inputLines[0].trim()}" is not a valid non-negative integer.`);
            console.log(failureMessage);
            return;
        }

        // --- Special Case: Handling the number zero ---
        // If the number is 0, its sum of digits is 0. Division by zero is undefined.
        // We define the behavior for 0 as not being divisible by the sum of its digits.
        if (parsedNumericValue === 0) {
            console.log(failureMessage);
            return;
        }

        // Initialize the working copy with the original parsed value.
        currentWorkingNumber = parsedNumericValue;

        // --- Digit Sum Calculation Loop ---
        // This loop iteratively extracts and sums the digits of the number.
        // It continues as long as there are digits remaining in 'currentWorkingNumber'.
        while (currentWorkingNumber > 0) {
            const lastDigit = currentWorkingNumber % 10;         // Get the units digit.
            accumulatedDigitSum += lastDigit;                    // Add it to the running total.
            currentWorkingNumber = Math.trunc(currentWorkingNumber / 10); // Remove the units digit, effectively shifting right.
        }

        // Add a debug point or intermediate log if needed:
        // console.log(`Debug Info: Original value: ${parsedNumericValue}, Calculated digit sum: ${accumulatedDigitSum}`);

        // Guard clause: Prevent division by zero if, for some unexpected reason, the sum is zero.
        // (This should ideally only happen for 0, which is handled above).
        if (accumulatedDigitSum === 0) {
            console.error("Logical Error: Sum of digits resulted in zero for a non-zero number.");
            console.log(failureMessage);
            return;
        }

        // --- Divisibility Check ---
        // Determine if the original number is perfectly divisible by the sum of its digits.
        const isPerfectlyDivisible = (parsedNumericValue % accumulatedDigitSum === 0);

        // --- Final Output ---
        // Print the appropriate message based on the divisibility check.
        if (isPerfectlyDivisible) {
            console.log(successMessage);
        } else {
            console.log(failureMessage);
        }

    } catch (operationError) {
        // Catch any unexpected errors during the processing logic.
        console.error(`An unhandled processing error occurred: ${operationError.message}`);
        console.log(failureMessage); // Ensure a consistent output even on internal errors.
    }
}

/**
 * Helper function to manage reading data from standard input
 * and initiating the primary processing logic.
 */
function initiateProcessingFromFile() {
    let fileContentsBuffer; // Variable to hold the raw data read from the file.
    try {
        // Use Node.js 'fs' module to synchronously read from stdin.
        // Specify 'utf8' encoding to correctly interpret text data.
        fileContentsBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

        // Pass the read contents to the main processing function.
        processInputData(fileContentsBuffer);

    } catch (fileSystemError) {
        // Handle errors specifically related to file reading (e.g., /dev/stdin not available).
        console.error(`File System Error: Failed to read input from /dev/stdin: ${fileSystemError.message}`);
        console.log("Result: NO"); // Consistent error output for file read failures.
    }
}

// --- Program Entry Point ---
// Execute the function that orchestrates reading input and processing.
initiateProcessingFromFile();