/**
 * @file This script processes a multi-line string input to find the range
 *       (difference between maximum and minimum values) of a sequence of numbers
 *       located on the second line of the input.
 *       It handles potential malformed input gracefully.
 */

/**
 * Calculates the numerical range (max - min) from a sequence of numbers
 * found in a specific part of the input string.
 *
 * @param {string} inputPayload - The raw string content, expected to have numbers
 *                                on its second line, separated by spaces.
 * @returns {number} The difference between the largest and smallest number,
 *                   or NaN if input is invalid or insufficient numbers are found.
 */
function processNumericSequenceRange(inputPayload) {
    "use strict"; // Strict mode applied to this function.

    // Step 1: Validate the primary input source.
    if (typeof inputPayload !== 'string' || inputPayload.trim().length === 0) {
        console.error("Error: Input payload is empty or not a valid string.");
        return NaN; // Indicate an invalid operation result.
    }

    // Step 2: Decompose the input string into individual lines.
    const inputLines = inputPayload.split('\n');

    // Step 3: Identify the relevant line containing the numeric data.
    // The problem statement implies the numbers are on the second line (index 1).
    const targetLineContent = inputLines[1];

    // Step 4: Validate the existence of the target data line.
    if (!targetLineContent || targetLineContent.trim().length === 0) {
        console.error("Error: The second line of input, expected to contain numbers, is missing or empty.");
        return NaN;
    }

    // Step 5: Parse the string representation of numbers from the target line.
    //  - Split by space to get string fragments.
    //  - Map each fragment to a floating-point number.
    //  - Filter out any results that are Not-a-Number (NaN), ensuring only valid numbers proceed.
    const numericValuesArray = targetLineContent
        .trim() // Remove leading/trailing whitespace from the line.
        .split(' ') // Split by single space.
        .map(strValue => parseFloat(strValue)) // Convert string to number.
        .filter(num => !isNaN(num)); // Keep only valid numbers.

    // Step 6: Ensure we have enough valid numbers to determine a range.
    if (numericValuesArray.length < 2) {
        console.error(`Error: Found ${numericValuesArray.length} valid numbers. At least two are required to compute a range.`);
        return NaN;
    }

    // Step 7: Sort the array of numbers in ascending order.
    // This allows for easy identification of minimum and maximum values.
    const parsedAndSortedNumbers = numericValuesArray.sort((valA, valB) => valA - valB);

    // Step 8: Extract the minimum and maximum values from the sorted array.
    const minimumObservedValue = parsedAndSortedNumbers[0];
    const maximumObservedValue = parsedAndSortedNumbers[parsedAndSortedNumbers.length - 1];

    // Step 9: Calculate the difference, which represents the range.
    const calculatedRange = maximumObservedValue - minimumObservedValue;

    // Step 10: Return the computed result.
    return calculatedRange;
}

// --- Program Execution Entry Point ---

/**
 * An Immediately Invoked Function Expression (IIFE) to encapsulate
 * the main execution flow of the script, preventing global variable pollution.
 */
(function executeApplication() {
    "use strict"; // Strict mode for the execution block as well.

    let rawInputContent = null;
    try {
        // Attempt to read the entire content from standard input.
        // This is a common pattern for competitive programming or shell scripting.
        const fileSystemModule = require('fs');
        rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        console.error("Fatal Error: Could not read input from /dev/stdin.", ioError.message);
        process.exit(1); // Terminate the process with an error code.
    }

    // Process the collected input data.
    const finalCalculatedResult = processNumericSequenceRange(rawInputContent);

    // Output the result to standard output if it's a valid number.
    // If NaN, an error message would have been logged by the processing function.
    if (!isNaN(finalCalculatedResult)) {
        console.log(finalCalculatedResult);
    } else {
        // If the result is NaN, it implies a processing error.
        // The error message has already been printed by `processNumericSequenceRange`.
        process.exit(1); // Exit with an error status.
    }
})();