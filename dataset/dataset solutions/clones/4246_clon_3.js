"use strict";

// Core module for file system operations
const fileSystem = require("fs");

// Read the entire input from standard input, using UTF-8 encoding
let rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the raw input string into an array of tokens using spaces or newlines as delimiters
let tokenStream = rawInputData.split(/ |\n/);

// Pointer to keep track of the current position in the token stream
let streamPointer = 0;

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next number from the input stream.
 */
function retrieveNextNumber() {
    // Check if we've exhausted the input stream
    if (streamPointer >= tokenStream.length) {
        // Optionally, throw an error or return a default/sentinel value
        console.error("Attempted to read past end of input stream.");
        return NaN; // Or throw new Error("End of input stream reached.");
    }
    const currentVal = tokenStream[streamPointer++];
    return Number(currentVal); // Explicit conversion to number
}

/**
 * Retrieves the next token from the stream as a string.
 * This function is included for completeness but not used by the main logic.
 * @returns {string} The next string token from the input stream.
 */
function fetchStringToken() {
    if (streamPointer >= tokenStream.length) {
        console.error("Attempted to read past end of input stream for string.");
        return "";
    }
    return tokenStream[streamPointer++];
}

/**
 * Reads a specified number of tokens from the stream and converts them to an array of numbers.
 * @param {number} countOfElements - The number of elements to read.
 * @returns {number[]} An array of numbers.
 */
function retrieveNumArray(countOfElements) {
    // Basic validation for the requested size
    if (countOfElements <= 0) {
        return [];
    }
    const endIndex = streamPointer + countOfElements;
    // Ensure we don't try to slice beyond the available tokens
    if (endIndex > tokenStream.length) {
        console.warn(`Requested ${countOfElements} elements, but only ${tokenStream.length - streamPointer} remaining.`);
        // Adjust endIndex to prevent errors or read partial array
        // For this problem, assume valid input, but for robustness, this is useful
    }

    const segment = tokenStream.slice(streamPointer, endIndex);
    streamPointer = endIndex; // Advance the stream pointer

    // Convert all elements in the segment to numbers
    return segment.map(val => Number(val));
}

// Execute the main problem-solving function
const finalResult = processArraySolution();

// Output the result if it's a valid value
if (finalResult !== undefined && finalResult !== null) {
    console.log(String(finalResult));
}

/**
 * The primary function containing the solution logic.
 * It processes an array based on specific conditions to calculate a final sum.
 * @returns {number} The calculated sum of array elements after processing.
 */
function processArraySolution() {
    // Read the total number of elements that will follow
    let arraySize = retrieveNextNumber();

    // Guard clause for empty or invalid array size
    if (arraySize <= 0) {
        return 0; // No elements to process, sum is 0
    }

    // Initialize the data array. We prepend a 0 to make it 1-indexed,
    // aligning with common problem-solving patterns where 1-based indexing is convenient.
    let dataElements = [0]; // Placeholder at index 0

    // Retrieve the actual numbers and append them to the data array
    const initialNumbers = retrieveNumArray(arraySize);
    dataElements.push(...initialNumbers);

    // Outer loop: Iterate backwards from the last element down to the first (index 1)
    // This iteration order is critical for the problem's logic.
    for (let currentIdx = arraySize; currentIdx >= 1; currentIdx--) {
        // If the current element is non-negative, it doesn't trigger the special condition,
        // so we move to the next element.
        if (dataElements[currentIdx] >= 0) {
            continue;
        }

        // If the current element is negative, we need to calculate the sum of its multiples.
        let currentSumForMultiples = 0;
        // Inner loop: Sum all elements at indices that are multiples of currentIdx
        // (i.e., dataElements[currentIdx], dataElements[2*currentIdx], dataElements[3*currentIdx], ...)
        for (let multipleFactor = currentIdx; multipleFactor <= arraySize; multipleFactor += currentIdx) {
            currentSumForMultiples += dataElements[multipleFactor];
        }

        // If the calculated sum of these multiples is negative, a specific reset action is required.
        if (currentSumForMultiples < 0) {
            // Resetting all elements that were multiples of 'currentIdx' to zero.
            // This is a destructive operation on the array.
            let tempMultiple = currentIdx; // Use a helper variable for the inner loop
            while (tempMultiple <= arraySize) {
                dataElements[tempMultiple] = 0;
                tempMultiple += currentIdx;
            }

            // Crucially, if a reset occurs, the entire outer scan must restart from 'arraySize'.
            // Setting currentIdx to arraySize + 1 ensures that after the loop's
            // decrement (currentIdx--), it becomes 'arraySize' for the next iteration.
            currentIdx = arraySize + 1; // Forces a restart of the outer loop
        }
    }

    // After all processing, calculate the final sum of all elements in the modified array.
    // The initial value for reduce is 0, ensuring correct sum even for empty arrays (though not possible here).
    return dataElements.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
}