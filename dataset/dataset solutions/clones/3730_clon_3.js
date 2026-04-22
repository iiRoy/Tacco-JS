"use strict";

// This self-executing asynchronous function serves as the primary entry point for the application.
// It orchestrates reading input, processing data, and generating the required output sequence.
(async function applicationEntryPoint() {

    // Helper function: Transforms a text line into an array of integers.
    // It includes robust parsing and validation to handle various input scenarios.
    const extractNumericElements = (inputDataLine) => {
        // Perform initial validation: ensure the input is a non-empty string.
        // If the input is invalid or empty after trimming, return an empty array to prevent errors.
        if (typeof inputDataLine !== 'string' || !inputDataLine.trim()) {
            return [];
        }

        // Split the cleaned input string by one or more whitespace characters.
        const stringSegments = inputDataLine.trim().split(/\s+/);

        // Map each string segment to an integer, filtering out any non-numeric conversions.
        const numericResults = stringSegments.map(segment => {
            const convertedValue = parseInt(segment, 10);
            // Check if the conversion resulted in a valid number.
            return isNaN(convertedValue) ? null : convertedValue;
        }).filter(item => item !== null); // Remove any nulls (failed conversions).

        return numericResults;
    };

    // Generator function: Produces a sequence of numbers from a specified start to an end value (exclusive).
    // This is a memory-efficient way to iterate over a potentially large range.
    function* generateSequentialNumbers(initialPoint, finalPoint) {
        // Validate the input parameters to ensure they are numbers and form a valid range.
        if (typeof initialPoint !== 'number' || typeof finalPoint !== 'number' || initialPoint > finalPoint) {
            // Throw an error if the arguments are invalid, indicating a programming mistake.
            throw new Error("Invalid parameters for number sequence generation: start must be a number less than or equal to end.");
        }
        
        // Iterate and yield each number in the defined range.
        for (let currentNumber = initialPoint; currentNumber < finalPoint; currentNumber++) {
            yield currentNumber;
        }
    }

    // --- Main application logic block ---
    try {
        // Acquire the Node.js File System module for reading input.
        const fileSystem = require("fs");
        
        // Read the entire content of the standard input file (`/dev/stdin`) as a UTF-8 string.
        const rawProgramInput = fileSystem.readFileSync("/dev/stdin", "utf8");

        // Divide the raw input string into an array of individual lines.
        const inputLines = rawProgramInput.split("\n");

        // Process the first line of input to extract numerical values.
        // We expect the first number to be our iteration count.
        const extractedValues = extractNumericElements(inputLines[0]);

        // Implement a guard clause: If no valid number was extracted, log an error and terminate.
        if (extractedValues.length === 0 || extractedValues[0] === undefined) {
            console.error("Critical Error: Unable to determine the iteration count from the input. Exiting.");
            process.exit(1); // Indicate an error state upon exit.
        }
        
        // Determine the total number of iterations required.
        // Apply robust sanitization: ensure the count is at least 1 and within a practical upper bound.
        const totalOutputCount = Math.max(1, Math.min(1000000, extractedValues[0]));

        let activeDigit = 1; // This variable holds the current leading digit (1-9).
        let zeroPadding = "";  // This string accumulates trailing zeros (e.g., "", "0", "00").

        // Define a constant for the maximum single digit before reset.
        const DIGIT_RESET_THRESHOLD = 9;

        // Iterate through the sequence for the specified number of times.
        // The `generateSequentialNumbers` provides a clean way to loop `totalOutputCount` times.
        for (const currentIterationIndex of generateSequentialNumbers(0, totalOutputCount)) {
            // Concatenate the active digit and the current zero padding to form the output string.
            const constructedOutput = activeDigit.toString() + zeroPadding;
            console.log(constructedOutput);

            // Increment the active digit for the next iteration.
            activeDigit++;

            // Logic to handle digit reset and zero padding increment:
            // If the active digit exceeds the threshold (9), reset it to 1 and add another '0' to the padding.
            if (activeDigit > DIGIT_RESET_THRESHOLD) {
                activeDigit = 1; // Reset to the first digit.
                zeroPadding += "0"; // Append a zero to the padding.
            }
        }

    } catch (executionIssue) {
        // Catch and report any unhandled exceptions that occur during the program's execution.
        console.error("An unrecoverable error occurred:", executionIssue.message);
        // For debugging, the full stack trace can be useful:
        // console.error(executionIssue.stack);
        process.exit(1); // Exit with a non-zero status code to indicate failure.
    }
})();