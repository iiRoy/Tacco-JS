'use strict';

// This module orchestrates the processing of a numeric dataset
// received via standard input, applying a specific transformation iteratively.

/**
 * Processes raw string input, extracts numeric data and an operation count,
 * then applies a transformation to the dataset multiple times before
 * computing and logging the final sum.
 * @param {string} rawTextContent - The complete string content read from the input source.
 */
function initiateNumericDatasetProcessing(rawTextContent) {
    // Validate the primary input content.
    if (typeof rawTextContent !== 'string' || rawTextContent.trim().length === 0) {
        console.error("Error: Input content is invalid or empty. Expected a non-empty string.");
        return; // Terminate execution gracefully for invalid input.
    }

    // Split the input into individual lines, trimming whitespace from the start/end.
    const inputLines = rawTextContent.trim().split('\n');

    // Ensure there are at least two lines for numbers and the iteration count.
    const minimumRequiredLines = 2;
    if (inputLines.length < minimumRequiredLines) {
        console.error(`Error: Insufficient input lines. Expected at least ${minimumRequiredLines}, but received ${inputLines.length}.`);
        return;
    }

    // Extract the string containing space-separated numbers from the first line.
    const stringOfNumbers = inputLines[0];

    // Extract the string representing the iteration count from the second line.
    const iterationCountString = inputLines[1];

    // Convert the iteration count string to a number.
    // Using unary plus operator for type conversion.
    let numberOfOperations = +iterationCountString;

    // Validate the parsed iteration count.
    if (isNaN(numberOfOperations) || numberOfOperations < 0) {
        console.error(`Error: Invalid operation count '${iterationCountString}'. It must be a non-negative numeric value.`);
        return;
    }
    // Ensure the operation count is an integer.
    numberOfOperations = Math.floor(numberOfOperations);

    // Parse the initial array of numbers.
    // We'll filter out any non-numeric results from the parsing.
    let currentNumericSet = stringOfNumbers.split(' ').map(numStr => {
        const parsedValue = Number(numStr); // Using Number() constructor for explicit conversion.
        if (isNaN(parsedValue)) {
            console.warn(`Warning: Encountered non-numeric value '${numStr}' during parsing. This value will be skipped.`);
            return null; // Mark invalid numbers for filtering.
        }
        return parsedValue;
    }).filter(val => val !== null); // Remove all nulls (invalid numbers).

    // If after parsing, no valid numbers remain, output 0 and exit.
    if (currentNumericSet.length === 0) {
        console.log(0);
        return;
    }

    // Apply the transformation repeatedly based on the operation count.
    let operationCounter = 0;
    while (operationCounter < numberOfOperations) {
        currentNumericSet = transformDatasetByDoublingMax(currentNumericSet);
        operationCounter++; // Increment the counter for the next iteration.
    }

    // Calculate the final sum of all elements in the transformed dataset.
    // Implementing sum manually instead of using `reduce` for Type III change.
    let finalAggregateSum = 0;
    for (let idx = 0; idx < currentNumericSet.length; idx++) {
        finalAggregateSum += currentNumericSet[idx];
    }

    // Output the computed final sum.
    console.log(finalAggregateSum);
}

/**
 * Creates a new array where the first occurrence of the maximum value
 * from the input array has been doubled.
 * @param {number[]} initialNumbers - The array of numbers to be transformed.
 * @returns {number[]} A new array with the maximum element doubled.
 */
function transformDatasetByDoublingMax(initialNumbers) {
    // Guard clause: if the array is empty or null, return an empty array.
    if (!initialNumbers || initialNumbers.length === 0) {
        // A specific logging message could be added here if desired.
        return [];
    }

    // Create a shallow copy of the input array to ensure immutability
    // of the original array, using slice() instead of the spread operator.
    const transformedNumbers = initialNumbers.slice();

    // Step 1: Find the maximum value within the dataset.
    // Implementing custom max finding logic for Type III change.
    let highestValueFound = -Infinity; // Initialize with the smallest possible number.
    if (transformedNumbers.length > 0) {
        highestValueFound = transformedNumbers[0]; // Assume first element is max initially.
        for (let k = 1; k < transformedNumbers.length; k++) {
            const currentElement = transformedNumbers[k];
            if (currentElement > highestValueFound) {
                highestValueFound = currentElement;
            }
        }
    }

    // Step 2: Locate the index of the first occurrence of the maximum value.
    // Implementing custom index finding logic for Type III change.
    let indexOfHighestValue = -1;
    for (let m = 0; m < transformedNumbers.length; m++) {
        if (transformedNumbers[m] === highestValueFound) {
            indexOfHighestValue = m;
            break; // Exit loop after finding the first occurrence.
        }
    }

    // Step 3: Double the value at the identified index.
    // This condition should always be true if the input array was not empty.
    if (indexOfHighestValue !== -1) {
        const originalValueAtMaxIndex = transformedNumbers[indexOfHighestValue];
        const doubledValue = originalValueAtMaxIndex * 2;
        transformedNumbers[indexOfHighestValue] = doubledValue;
    } else {
        // This case indicates an unexpected scenario where max was found but its index wasn't.
        console.error("Internal Error: Max value found but its index could not be located.");
    }

    return transformedNumbers;
}

// Self-executing anonymous function (IIFE) to handle the program's entry point.
(function applicationBootstrap() {
    const fileSystemAccessor = require('fs'); // Standard Node.js file system module.
    const standardInputFilePath = '/dev/stdin'; // Path for standard input on Unix-like systems.
    const textEncodingFormat = 'utf8'; // Encoding for reading text data.

    try {
        // Read the entire content from standard input synchronously.
        const acquiredInputContent = fileSystemAccessor.readFileSync(standardInputFilePath, textEncodingFormat);

        // Pass the acquired content to the main processing function.
        initiateNumericDatasetProcessing(acquiredInputContent);
    } catch (ioError) {
        // Catch and log any errors that occur during file reading.
        console.error(`Fatal Error: Unable to read from standard input. Details: ${ioError.message}`);
        // Terminate the process with an error code.
        process.exit(1);
    }
})();