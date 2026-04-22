const fileSystemModule = require('fs');

// Define a constant for the maximum permissible value in the input set.
const UPPER_BOUND_VALUE = 100;
// Define a constant for the radix in integer parsing, ensuring base 10.
const DECIMAL_RADIX = 10;

/**
 * Helper function to safely parse a string into an integer.
 * This function is an added utility to enhance code clarity and robustness (Type III change).
 * @param {string} strValue - The string to parse.
 * @param {number} radix - The base for parsing (e.g., 10 for decimal).
 * @returns {number} The parsed integer, or NaN if parsing fails.
 */
const parseIntegerSafely = (strValue, radix) => {
    // Trim whitespace from the string before parsing.
    const trimmedValue = strValue.trim();
    const parsed = parseInt(trimmedValue, radix);

    // Return NaN if parsing results in an invalid number.
    if (isNaN(parsed)) {
        return NaN;
    }
    return parsed;
};

// --- Main Program Execution ---

// Read all raw input data from standard input.
// Wrapped in a try-catch block for robust file reading (Type III addition).
let rawInputContent = '';
try {
    rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
} catch (errorReadingFile) {
    // Log an error and exit if input cannot be read.
    console.error("Error encountered while attempting to read input from /dev/stdin:", errorReadingFile.message);
    process.exit(1); // Terminate the process with an error code.
}

// Process the raw input: trim leading/trailing whitespace and split into individual lines.
// This creates a mutable buffer of input lines (Type II renaming and Type III structural change).
let inputLineBuffer = rawInputContent.trim().split('\n');

// Main processing loop: continues as long as there are lines in the buffer
// and the specific termination condition (0 0) for a test case is not met.
while (inputLineBuffer.length > 0) {
    // Extract the current line containing the two primary parameters (numItemsToRead and sumComparisonThreshold).
    const parameterLine = inputLineBuffer.shift();

    // Guard clause: If the line is unexpectedly empty or undefined, it indicates
    // either malformed input or end of input. Break the loop (Type III addition).
    if (!parameterLine || parameterLine.trim().length === 0) {
        break;
    }

    // Parse the two numeric settings from the current parameter line.
    // Uses the custom parseIntegerSafely helper (Type III addition).
    const currentSettings = parameterLine.split(' ').map(valStr => parseIntegerSafely(valStr, DECIMAL_RADIX));

    // Validate that exactly two numbers were successfully parsed.
    // If not, log a warning and skip to the next input set (Type III addition).
    if (currentSettings.length < 2 || currentSettings.some(Number.isNaN)) {
        console.error("Warning: An invalid parameter line was detected. Skipping this test case.");
        continue;
    }

    const numItemsToRead = currentSettings[0];
    const sumComparisonThreshold = currentSettings[1];

    // Termination condition check for the entire program: if both parameters are zero.
    if (numItemsToRead === 0 && sumComparisonThreshold === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize an array to store the frequency of each number encountered.
    // The size is UPPER_BOUND_VALUE + 1 to accommodate values from 0 up to UPPER_BOUND_VALUE.
    // Uses a modern array initialization method (Type III update).
    const numberOccurrences = new Array(UPPER_BOUND_VALUE + 1).fill(0);

    // Read 'numItemsToRead' individual numeric values from subsequent lines
    // and update their respective frequencies in the 'numberOccurrences' array.
    for (let currentItemIndex = 0; currentItemIndex < numItemsToRead; currentItemIndex++) {
        const itemValueLine = inputLineBuffer.shift();

        // Guard against premature end of input while reading item values (Type III addition).
        if (!itemValueLine || itemValueLine.trim().length === 0) {
            console.error("Warning: Expected additional item values but the input buffer was exhausted. Terminating item reading for this test case.");
            break; // Break the inner loop for reading items.
        }

        const itemNumericValue = parseIntegerSafely(itemValueLine, DECIMAL_RADIX);

        // Validate the parsed value: ensure it's a number and within the expected range.
        // If valid, increment its frequency count (Type III addition).
        if (!Number.isNaN(itemNumericValue) && itemNumericValue >= 0 && itemNumericValue <= UPPER_BOUND_VALUE) {
            numberOccurrences[itemNumericValue]++;
        } else {
            console.error(`Warning: An invalid item value '${itemValueLine}' was found. This item will be skipped.`);
        }
    }

    // Initialize a counter for pairs that satisfy the sum condition.
    let validPairCount = 0;

    // Core logic: Iterate through all possible distinct pairs of values (valueA, valueB)
    // that could be formed from the input data.
    // The outer loop iterates through 'valueA' from 0 up to the maximum possible value.
    for (let valueA_index = 0; valueA_index <= UPPER_BOUND_VALUE; valueA_index++) {
        // The inner loop iterates through 'valueB', starting from 'valueA_index + 1'.
        // This ensures that each pair (valueA, valueB) is considered only once and that valueA != valueB.
        for (let valueB_index = valueA_index + 1; valueB_index <= UPPER_BOUND_VALUE; valueB_index++) {
            // Retrieve the frequencies of valueA and valueB.
            const freqA = numberOccurrences[valueA_index];
            const freqB = numberOccurrences[valueB_index];

            // Only proceed if both values have appeared at least once in the input.
            if (freqA > 0 && freqB > 0) {
                // Check if the sum of the two distinct values exceeds the defined threshold.
                if (valueA_index + valueB_index > sumComparisonThreshold) {
                    // If the condition is met, add the minimum of their frequencies to the total count.
                    // This logic accounts for the maximum number of (valueA, valueB) pairs that can be formed
                    // given the available instances of each value.
                    validPairCount += Math.min(freqA, freqB);
                }
            }
        }
    }

    // Output the final calculated count for the current test case.
    console.log(validPairCount);
}