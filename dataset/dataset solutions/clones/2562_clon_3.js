'use strict';

/**
 * Processes a stream of input lines to perform a series of operations
 * on a collection of numbers and returns their final sum.
 *
 * @param {string[]} inputSequence - An array of strings, where each string represents a line of input.
 *                                   Expected format:
 *                                   - inputSequence[0]: "N M" (N is unused, M is iteration count)
 *                                   - inputSequence[1]: "val1 val2 val3 ..." (space-separated numbers)
 * @returns {number} The sum of the modified numbers, or 0 if an error occurs.
 */
const transformAndSumData = (inputSequence) => {
    // --- Input Validation and Parsing ---
    if (!Array.isArray(inputSequence) || inputSequence.length < 2) {
        console.error("Error: Input array is malformed or contains insufficient lines.");
        return 0; // Indicate failure by returning a default sum
    }

    const initialParameters = inputSequence[0].split(' ');
    
    // The first number (N) from the original problem statement is not utilized,
    // so we will skip parsing it to demonstrate a deletion of non-essential logic.
    // const itemCount = Number(initialParameters[0]); // Original 'n' - now removed.

    const numberOfOperations = Number(initialParameters[1]);

    // Validate the number of operations.
    if (isNaN(numberOfOperations) || numberOfOperations < 0) {
        console.error("Error: The specified number of operations is invalid or negative.");
        return 0;
    }

    // Parse the second line into a mutable array of numeric values.
    const numericalElements = inputSequence[1].split(' ').map(token => Number(token));

    // Validate if all parsed elements are indeed numbers.
    if (!numericalElements.every(el => typeof el === 'number' && !isNaN(el))) {
        console.error("Error: The data collection contains non-numeric values.");
        return 0;
    }
    if (numericalElements.length === 0) {
        console.error("Warning: The data collection is empty. Sum will be zero.");
        // No need to return 0 immediately, the loop will be skipped and sum will be 0.
    }

    // --- Core Transformation Logic ---
    // Iterate for the specified number of operations.
    for (let operationCounter = 0; operationCounter < numberOfOperations; ++operationCounter) {
        let currentMaximumValue = -Infinity; // Initialize with a very small number
        let indexOfTheMaximum = -1;

        // Manually traverse the array to find the maximum value and its first index.
        // This is a rewrite from Math.max.apply() and indexOf().
        for (let idx = 0; idx < numericalElements.length; ++idx) {
            const currentElement = numericalElements[idx];
            if (currentElement > currentMaximumValue) {
                currentMaximumValue = currentElement;
                indexOfTheMaximum = idx;
            }
        }

        // If no maximum was found (e.g., empty array, though checked earlier),
        // gracefully exit the transformation loop.
        if (indexOfTheMaximum === -1) {
            break;
        }

        // Halve the value at the found index.
        // Using bitwise OR 0 for integer division (equivalent to Math.floor for positive numbers).
        numericalElements[indexOfTheMaximum] = (numericalElements[indexOfTheMaximum] / 2) | 0;
    }

    // --- Final Summation ---
    // Calculate the sum of all elements in the modified array.
    // This is a rewrite from the .reduce() method.
    let finalAggregateSum = 0;
    for (const valueItem of numericalElements) {
        finalAggregateSum += valueItem;
    }

    return finalAggregateSum;
};

// --- Main Execution Block ---
// This section handles file reading and error management.
try {
    const fileSystemModule = require("fs");
    const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    const processedLines = rawInputContent.split('\n');
    
    const calculatedResult = transformAndSumData(processedLines);
    console.log(calculatedResult);
} catch (fileReadError) {
    // Provide a more descriptive error message in case of file system issues.
    console.error("An error occurred while reading the input file from /dev/stdin:", fileReadError.message);
    // In competitive programming, it's common to print 0 or a specific error code for failed execution.
    console.log(0); 
}