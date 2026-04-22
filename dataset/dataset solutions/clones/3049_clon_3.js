"use strict";

// This module is designed to process a sequence of numerical data
// provided via standard input to identify and count "peak" values.
// A peak value is defined as any number that is greater than or equal to
// all previously encountered numbers in the sequence.

/**
 * Executes the primary logic for processing input data and calculating
 * the number of times a new highest value is observed in a sequence.
 *
 * @param {string} rawInputString The complete raw string data read from standard input,
 *                                  typically containing multiple lines.
 */
function analyzeNumericSequenceForPeaks(rawInputString) {
    // --- Phase 1: Input Parsing and Initial Validation ---

    // Split the entire input string into individual lines.
    // Using a regex for split handles both Unix-style (\n) and Windows-style (\r\n) line endings.
    const processedLines = rawInputString.split(/\r?\n/);

    // Ensure there's at least two lines of input: one for count, one for values.
    if (processedLines.length < 2) {
        console.error("Input Error: Not enough data lines provided. Expected at least two lines.");
        return; // Terminate execution gracefully.
    }

    // Extract the first line, which should contain the expected count of elements.
    const firstLineValue = processedLines.shift();
    const expectedElementCount = Number(firstLineValue); // Convert to number.

    // Validate the extracted count. It must be a positive integer.
    if (isNaN(expectedElementCount) || !Number.isInteger(expectedElementCount) || expectedElementCount <= 0) {
        console.error(`Input Error: Invalid or non-positive element count detected: '${firstLineValue}'.`);
        return; // Terminate execution.
    }

    // Extract the second line, which contains the space-separated numerical sequence.
    const secondLineValue = processedLines.shift();
    const stringifiedNumbers = secondLineValue.split(' ');

    // Convert the array of string numbers into an array of actual numbers.
    // Each string element is explicitly converted using the unary plus operator for brevity.
    const numericDataPoints = stringifiedNumbers.map(strValue => {
        const numValue = +strValue; // Convert string to number.
        if (isNaN(numValue)) {
            // If any value is not a number, it indicates malformed input.
            throw new Error(`Data Conversion Error: Non-numeric value '${strValue}' found in sequence.`);
        }
        return numValue;
    });

    // --- Phase 2: Data Integrity Check (Type III: Added Validation) ---

    // Verify if the actual number of parsed data points matches the expected count.
    if (numericDataPoints.length !== expectedElementCount) {
        console.warn(`Data Warning: Expected ${expectedElementCount} elements but found ${numericDataPoints.length}. ` +
                     `Proceeding with the actual number of elements parsed.`);
        // For robustness, we'll use the actual length of the parsed array for the loop.
    }

    // --- Phase 3: Core Logic for Peak Calculation (Type II & III: Renaming, Refactoring) ---

    /**
     * Helper function to compute the number of times a new maximum is observed.
     * This embodies the primary computational logic.
     *
     * @param {number[]} sequence An array of numbers to process.
     * @returns {number} The total count of peak occurrences.
     */
    const determinePeakOccurrences = (sequence) => {
        let currentPeakCounter = 0; // Renamed 'result'
        let highestObservedValue = 0; // Renamed 'max', initialized to 0 per original logic's behavior.
                                     // (If negative numbers were to be considered for initial peaks,
                                     // this would be initialized to Number.MIN_SAFE_INTEGER or the first element).

        // Iterate through each data point in the sequence.
        // Using a traditional for loop for direct index access, consistent with original.
        for (let dataPointIndex = 0; dataPointIndex < sequence.length; ++dataPointIndex) {
            const currentDataPoint = sequence[dataPointIndex]; // Renamed 'tmp'

            // Compare the current data point with the highest value seen so far.
            // If the current point is greater than or equal, it's a new peak.
            if (currentDataPoint >= highestObservedValue) {
                highestObservedValue = currentDataPoint; // Update the highest value.
                currentPeakCounter++; // Increment the counter for new peaks.
            }
            // No 'else' branch needed as we only care about new peaks.
        }
        return currentPeakCounter;
    };

    // Execute the peak determination logic.
    const finalPeakCount = determinePeakOccurrences(numericDataPoints);

    // --- Phase 4: Output Result ---

    // Display the final computed number of peaks to standard output.
    console.log(finalPeakCount);
}

// --- Main Execution Block ---
// This block handles reading the input file and invoking the main processing function.
try {
    // Attempt to read the entire content of the standard input file synchronously.
    // This is typical for competitive programming environments.
    const stdInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

    // Call the main function to process the input and produce the output.
    analyzeNumericSequenceForPeaks(stdInputContent);

} catch (errorDuringExecution) {
    // Catch and report any errors that occur during file reading or within the processing function.
    console.error("An unhandled exception occurred during program execution:");
    console.error(errorDuringExecution.message); // Log the error message.
    // Depending on requirements, could also log the stack trace: console.error(errorDuringExecution.stack);
}