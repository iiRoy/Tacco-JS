"use strict";

// This constant defines the standard input stream path for reading data.
// Using process.stdin.fd (file descriptor 0) is a common way to access stdin in Node.js.
const STANDARD_INPUT_SOURCE = process.stdin.fd;

// Utilize the 'node:fs' module for file system operations, specifically for reading input data.
const fileSystemModule = require('node:fs');

// Read the entire content from the standard input synchronously.
// The encoding is specified to handle text data correctly.
const rawContentFromSource = fileSystemModule.readFileSync(STANDARD_INPUT_SOURCE, { encoding: 'utf8' });

// The raw content is split into individual tokens.
// /\s+/ matches one or more whitespace characters (spaces, tabs, newlines).
// .filter(Boolean) removes any empty strings that might result from the split
// (e.g., if there are multiple spaces between numbers or leading/trailing whitespace).
const inputTokenBuffer = rawContentFromSource.split(/\s+/).filter(Boolean);

// A pointer to keep track of the current position within the inputTokenBuffer.
let currentTokenPointer = 0;

/**
 * Retrieves the next token from the input buffer and attempts to convert it to an integer.
 * Advances the token pointer.
 * @returns {number} The integer value of the next token.
 * @throws {Error} If there are no more tokens or if the token cannot be converted to a number.
 */
function retrieveNextInteger() {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input buffer exhausted. No more integer tokens available.");
    }
    const tokenString = inputTokenBuffer[currentTokenPointer++];
    const numericValue = Number(tokenString);
    if (isNaN(numericValue)) {
        throw new Error(`Cannot parse "${tokenString}" into an integer. Invalid token format.`);
    }
    return numericValue;
}

/**
 * Retrieves the next token from the input buffer as a string.
 * Advances the token pointer.
 * @returns {string} The string value of the next token.
 * @throws {Error} If there are no more tokens.
 */
function retrieveNextString() {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input buffer exhausted. No more string tokens available.");
    }
    return inputTokenBuffer[currentTokenPointer++];
}

/**
 * Retrieves the next token from the input buffer and attempts to convert it to a BigInt.
 * Advances the token pointer.
 * @returns {BigInt} The BigInt value of the next token.
 * @throws {Error} If there are no more tokens or if the token cannot be converted to a BigInt.
 */
function retrieveNextBigInteger() {
    if (currentTokenPointer >= inputTokenBuffer.length) {
        throw new Error("Input buffer exhausted. No more BigInt tokens available.");
    }
    const tokenString = inputTokenBuffer[currentTokenPointer++];
    try {
        return BigInt(tokenString);
    } catch (e) {
        throw new Error(`Failed to convert "${tokenString}" to BigInt: ${e.message}`);
    }
}

/**
 * Retrieves a specified number of elements from the token buffer, converting them to integers.
 * @param {number} numberOfElements The total count of elements to retrieve.
 * @returns {number[]} An array containing the retrieved integer elements.
 * @throws {Error} If not enough tokens are available in the buffer.
 */
function fetchIntegerSequence(numberOfElements) {
    if (currentTokenPointer + numberOfElements > inputTokenBuffer.length) {
        throw new Error(`Insufficient tokens for fetching a sequence of ${numberOfElements} integers.`);
    }
    const sequenceArray = [];
    for (let i = 0; i < numberOfElements; ++i) {
        sequenceArray.push(retrieveNextInteger());
    }
    return sequenceArray;
}

/**
 * Retrieves a 2D matrix of elements from the token buffer.
 * Elements can be retrieved as strings or numbers based on the 'returnAsStrings' flag.
 * @param {number} rowCount The number of rows for the matrix.
 * @param {number} colCount The number of columns for each row.
 * @param {boolean} [returnAsStrings=false] If true, elements are returned as strings; otherwise, as numbers.
 * @returns {Array<Array<string|number>>} The constructed 2D matrix.
 * @throws {Error} If not enough tokens are available for the specified matrix dimensions.
 */
function fetchMatrixElements(rowCount, colCount, returnAsStrings = false) {
    const matrixData = [];
    const totalRequiredTokens = rowCount * colCount;
    if (currentTokenPointer + totalRequiredTokens > inputTokenBuffer.length) {
        throw new Error(`Not enough tokens to construct a ${rowCount}x${colCount} matrix.`);
    }

    for (let rIdx = 0; rIdx < rowCount; ++rIdx) {
        const currentRow = [];
        for (let cIdx = 0; cIdx < colCount; ++cIdx) {
            currentRow.push(returnAsStrings ? retrieveNextString() : retrieveNextInteger());
        }
        matrixData.push(currentRow);
    }
    return matrixData;
}

// --- Core Algorithm Implementation ---

/**
 * Implements the main logic of the problem.
 * It processes an array of numbers based on divisibility rules and returns a final aggregated sum.
 * @returns {number} The final sum of the modified array elements.
 */
function executeDivisorAlgorithm() {
    // Read the dimension (N) for the array from the input.
    const arrayDimension = retrieveNextInteger();

    // Perform a basic validation on the array dimension.
    // If it's non-positive, it indicates invalid input for this algorithm's context.
    if (arrayDimension <= 0) {
        console.warn("Warning: Array dimension must be a positive integer. Algorithm cannot proceed with invalid input.");
        return 0; // Return a default sum for invalid input.
    }

    // Initialize the primary array for processing.
    // A leading zero is prepended to facilitate 1-based indexing, common in competitive programming.
    const numericDataArray = [0];
    // Populate the rest of the array with 'arrayDimension' numbers from the input.
    for (let elementCounter = 0; elementCounter < arrayDimension; ++elementCounter) {
        numericDataArray.push(retrieveNextInteger());
    }

    // The algorithm involves 'arrayDimension' passes over the data.
    // Each pass re-evaluates and potentially modifies the array based on accumulated sums.
    for (let globalPassIndex = 0; globalPassIndex < arrayDimension; ++globalPassIndex) {
        // In each pass, iterate downwards from 'arrayDimension' to 1.
        // Each 'divisorCandidate' represents a potential divisor for array indices.
        for (let divisorCandidate = arrayDimension; divisorCandidate >= 1; --divisorCandidate) {
            let currentDivisorSum = 0; // Accumulator for multiples of the current 'divisorCandidate'.
            let wereElementsModifiedInThisSubPass = false; // Flag to track modifications.

            // Sum up all elements whose indices are multiples of 'divisorCandidate'.
            for (let multipleIndex = divisorCandidate; multipleIndex <= arrayDimension; multipleIndex += divisorCandidate) {
                const valueAtIndex = numericDataArray[multipleIndex]; // Fetch value for clarity.
                currentDivisorSum += valueAtIndex;
            }

            // If the accumulated sum for the multiples is negative,
            // then all those elements in the array must be reset to zero.
            if (currentDivisorSum < 0) {
                // Iterate again through the multiples to perform the zeroing operation.
                for (let zeroingTargetIndex = divisorCandidate; zeroingTargetIndex <= arrayDimension; zeroingTargetIndex += divisorCandidate) {
                    // Only update if the value is not already zero to avoid redundant assignments
                    // and correctly track actual changes.
                    if (numericDataArray[zeroingTargetIndex] !== 0) {
                        numericDataArray[zeroingTargetIndex] = 0;
                        wereElementsModifiedInThisSubPass = true; // Mark that a change occurred.
                    }
                }
            }
        }
    }

    // After all passes and modifications, calculate the final sum of all elements in the array.
    // The 'reduce' method is used with an initial sum of 0 to handle potentially empty arrays safely
    // (though 'arrayDimension' ensures it's not truly empty beyond the prepended 0).
    const finalComputedSum = numericDataArray.reduce((totalAccumulatedSum, currentElementValue) => totalAccumulatedSum + currentElementValue, 0);
    return finalComputedSum;
}

// --- Program Execution Entry Point ---

// Invoke the main algorithm function and store its return value.
const algorithmFinalOutcome = executeDivisorAlgorithm();

// If the computed outcome is not null or undefined (meaning it's a valid result),
// convert it to a string and display it to the console.
// console.info is used, which is semantically similar to console.log for general output.
if (algorithmFinalOutcome != null) {
    console.info(algorithmFinalOutcome.toString());
}