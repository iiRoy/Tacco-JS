"use strict";

/**
 * Retrieves the raw input data from standard input.
 * This function handles the synchronous reading of the entire stream.
 * @returns {string} The complete input content as a UTF-8 string.
 */
function retrieveSystemInput() {
    // Utilizes Node.js 'fs' module to synchronously read from the standard input file descriptor.
    // '/dev/stdin' is a common path for standard input on Unix-like systems.
    return require('fs').readFileSync('/dev/stdin', 'UTF-8');
}

/**
 * Converts a string representation of a number into its integer equivalent.
 * Trims whitespace and explicitly uses base 10 for parsing.
 * @param {string} textualNumber - The string to be converted.
 * @returns {number} The parsed integer value. Returns NaN if the string cannot be parsed.
 */
function convertToInteger(textualNumber) {
    return Number.parseInt(textualNumber.trim(), 10);
}

/**
 * Determines if two numerical arrays have identical contents and order.
 * This comparison is performed by converting both arrays to JSON strings.
 * @param {Array<number>} firstArray - The first array for comparison.
 * @param {Array<number>} secondArray - The second array for comparison.
 * @returns {boolean} True if the arrays are equivalent, false otherwise.
 */
function areArraysStructurallyIdentical(firstArray, secondArray) {
    return JSON.stringify(firstArray) === JSON.stringify(secondArray);
}

// --- Main Program Execution ---

// Fetch the entire input payload as a single string.
const fullInputPayload = retrieveSystemInput();

// Divide the input string into an array of lines.
const separatedInputLines = fullInputPayload.split('\n');

// Basic validation: Ensure sufficient input lines are present.
if (separatedInputLines.length < 3) {
    console.error("Input Error: Expected at least three lines of input data.");
    process.exit(1); // Terminate with an error code.
}

// Parse the first line to get the expected length of the arrays.
const effectiveDataLength = convertToInteger(separatedInputLines[0]);

// Validate the parsed length to be a positive number.
if (isNaN(effectiveDataLength) || effectiveDataLength <= 0) {
    console.error("Data Error: The specified array length is invalid or non-positive.");
    process.exit(1);
}

// Process the second line to form the desired final array state.
const finalDesiredArray = separatedInputLines[1].split(' ').map(s => convertToInteger(s));

// Process the third line to form the initial array state.
const currentWorkingArray = separatedInputLines[2].split(' ').map(s => convertToInteger(s));

// Verify that the parsed arrays match the expected length.
if (finalDesiredArray.length !== effectiveDataLength || currentWorkingArray.length !== effectiveDataLength) {
    console.error(`Data Error: Array lengths do not match the declared length of ${effectiveDataLength}.`);
    process.exit(1);
}

let transformationCounter = 0; // Tracks the number of operations performed.

// Define a safeguard to prevent indefinite loops, useful for debugging or unexpected inputs.
const MAXIMUM_TRANSFORMATIONS_ALLOWED = 1000000;

// Continuously transform the array until it matches the target state.
while (!areArraysStructurallyIdentical(currentWorkingArray, finalDesiredArray)) {
    transformationCounter++; // Increment the counter for each modification cycle.

    // Enforce the maximum transformation limit.
    if (transformationCounter > MAXIMUM_TRANSFORMATIONS_ALLOWED) {
        console.error(`Runtime Error: Exceeded ${MAXIMUM_TRANSFORMATIONS_ALLOWED} transformations. Likely an infinite loop or unreachable state.`);
        process.exit(1);
    }

    let peakValue = -Infinity; // Initialize with the smallest possible number.
    let peakElementIndex = -1; // Initialize with an invalid index.

    // Iterate through the current array to find the element with the highest value and its position.
    // This custom loop avoids repeated array spreads for Math.max and indexOf.
    for (let currentPos = 0; currentPos < effectiveDataLength; currentPos++) {
        if (currentWorkingArray[currentPos] > peakValue) {
            peakValue = currentWorkingArray[currentPos];
            peakElementIndex = currentPos;
        }
    }

    // Determine the indices of the elements adjacent to the peak element,
    // accounting for circular array boundaries (wraps around).
    const precedingElementIndex = (peakElementIndex === 0) ? (effectiveDataLength - 1) : (peakElementIndex - 1);
    const succeedingElementIndex = (peakElementIndex === effectiveDataLength - 1) ? 0 : (peakElementIndex + 1);

    // Retrieve the actual values of the preceding and succeeding elements.
    const valueOfPreceding = currentWorkingArray[precedingElementIndex];
    const valueOfSucceeding = currentWorkingArray[succeedingElementIndex];

    // Apply the core transformation rule: subtract neighbors' values from the peak element.
    currentWorkingArray[peakElementIndex] -= (valueOfPreceding + valueOfSucceeding);
}

// Output the total count of transformations required.
console.log(transformationCounter);