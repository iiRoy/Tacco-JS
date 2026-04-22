'use strict';

/**
 * Orchestrates the processing of raw input data to derive a specific cumulative sum.
 * This function handles parsing, data aggregation, and final calculation.
 * @param {string} rawInputContent - The complete input string read from a source (e.g., stdin).
 */
function processInputData(rawInputContent) {
    // Sanitize and split the raw input string into an array of individual lines.
    // Trimming ensures no leading/trailing whitespace affects line splitting.
    const contentLines = rawInputContent.trim().split('\n');

    // Implement a basic validation check for the number of input lines.
    // We expect at least two lines: one for parameters, one for data.
    if (contentLines.length < 2) {
        console.error("Input processing failed: Not enough data lines provided. Expected at least 2.");
        return; // Abort execution if input is malformed.
    }

    // Parse the first line to extract configuration parameters (N and K).
    // It's split by one or more spaces, filtered to remove empty strings, and then converted to integers.
    const configurationSettings = contentLines[0].split(/\s+/).filter(s => s !== '').map(paramStr => parseInt(paramStr, 10));

    // Validate the parsed configuration parameters.
    // Ensure exactly two numeric parameters are present.
    if (configurationSettings.length !== 2 || isNaN(configurationSettings[0]) || isNaN(configurationSettings[1])) {
        console.error("Input processing failed: Invalid or missing numeric parameters in the first line.");
        return; // Abort if parameters are invalid.
    }

    // Assign descriptive names to the configuration values for clarity.
    const maximumElementValue = configurationSettings[0]; // Represents 'N' from the original problem.
    const summationStartIndex = configurationSettings[1];  // Represents 'K' from the original problem.

    // Initialize a frequency counter array.
    // Its size is `maximumElementValue + 1` to accommodate element values from 0 up to `maximumElementValue`.
    // Each position is initially set to zero.
    const elementFrequencyTracker = Array.from({ length: maximumElementValue + 1 }, () => 0);

    // Parse the second line, which contains the sequence of numbers to be processed.
    const numericSequence = contentLines[1].split(/\s+/).filter(s => s !== '').map(numStr => parseInt(numStr, 10));

    // Populate the frequency tracker array.
    // Iterate through each number in the sequence and increment its corresponding count.
    for (const currentNumericEntity of numericSequence) {
        // Add a guard clause to ensure the number is within the expected range
        // before attempting to increment its frequency count.
        if (currentNumericEntity >= 0 && currentNumericEntity <= maximumElementValue) {
            elementFrequencyTracker[currentNumericEntity]++;
        }
        // Optionally, one could log a warning for out-of-bounds numbers here.
    }

    // Calculate the final sum based on the accumulated frequencies.
    // The sum includes frequencies of elements from `summationStartIndex` up to `maximumElementValue`.
    let totalAccumulatedSum = 0; // Initialize the sum accumulator.

    // Use a traditional for loop for explicit control over the summation range.
    for (let index = summationStartIndex; index <= maximumElementValue; index++) {
        // Add the frequency count at the current index to the total sum.
        totalAccumulatedSum += elementFrequencyTracker[index];
    }

    // Output the computed result to the standard output.
    console.log(totalAccumulatedSum);
}

// The main entry point of the script.
// Reads all input from `/dev/stdin` (standard input) as a UTF-8 string
// and passes it to the `processInputData` function for execution.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));