"use strict";

// Core utility for reading input data from standard input
var rawDataBuffer = require('node:fs').readFileSync(0, 'utf-8');
var inputTokenStream = rawDataBuffer.split(/ |\n|\r\n/); // Handle Windows line endings too
var currentTokenIndex = 0;

/**
 * Retrieves the next token from the input stream and converts it to a number.
 * @returns {number} The numeric value of the next token.
 */
function extractNumericToken() {
    return Number(inputTokenStream[currentTokenIndex++]);
}

/**
 * Retrieves the next token from the input stream as a string.
 * @returns {string} The string value of the next token.
 */
function extractStringToken() {
    return inputTokenStream[currentTokenIndex++];
}

/**
 * Retrieves the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The BigInt value of the next token.
 */
function extractBigIntToken() {
    return BigInt(inputTokenStream[currentTokenIndex++]);
}

/**
 * Reads a specified number of numeric tokens from the input stream into an array.
 * @param {number} count - The number of tokens to read.
 * @returns {number[]} An array of numeric tokens.
 */
function readNumericSequence(count) {
    const sequence = [];
    for (let i = 0; i < count; i++) {
        sequence.push(extractNumericToken());
    }
    return sequence;
}

/**
 * Reads a matrix of numeric tokens from the input stream.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} columns - The number of columns in each row.
 * @returns {number[][]} A 2D array representing the matrix.
 */
function readNumericMatrix(rows, columns) {
    const matrix = [];
    for (let r = 0; r < rows; r++) {
        const rowData = [];
        for (let c = 0; c < columns; c++) {
            rowData.push(extractNumericToken());
        }
        matrix.push(rowData);
    }
    return matrix;
}

// Helper for BigInt operations
function bigIntFromNumber(num) {
    return BigInt(num);
}

// A safety mechanism to prevent extremely long loops in case of unexpected input
const MAX_OPERATION_CYCLES = 200000; // Original problem constraints imply much fewer

/**
 * Main function to solve the challenge.
 * This function processes a sequence of BigInts and attempts to balance two initial BigInts
 * using XOR operations to achieve a specific state.
 * @returns {BigInt|number} The accumulated delta or -1 if an impossible state is reached.
 */
function solveProblem() {
    // Read the total count of elements
    const elementCount = extractNumericToken();

    // Early exit for trivial or invalid cases
    if (elementCount < 2) {
        return bigIntFromNumber(-1);
    }

    // Read the two primary operands
    let firstPrimaryValue = extractBigIntToken();
    let secondPrimaryValue = extractBigIntToken();

    // Calculate the cumulative XOR sum of the remaining elements
    let cumulativeXORSumOfRest = bigIntFromNumber(0);
    for (let k = 2; k < elementCount; k++) {
        cumulativeXORSumOfRest = cumulativeXORSumOfRest ^ extractBigIntToken();
    }

    // Initialize the result accumulator
    let totalAdjustmentDelta = bigIntFromNumber(0);
    // Calculate the initial XOR state
    let currentOverallXORState = firstPrimaryValue ^ secondPrimaryValue ^ cumulativeXORSumOfRest;

    // Loop until the overall XOR state is zero (balanced)
    let cycleCounter = 0;
    while (currentOverallXORState !== bigIntFromNumber(0)) {
        cycleCounter++;

        // Guard against excessive iterations, indicating an issue or impossible state
        if (cycleCounter > MAX_OPERATION_CYCLES || firstPrimaryValue === bigIntFromNumber(1)) {
            return -1; // Indicate failure or timeout
        }

        // Iterate through bit positions from highest to lowest (e.g., 60 down to 0 for BigInts)
        // Original problem used 40, let's expand the range for BigInt
        for (let bitPos = 60; bitPos >= 0; bitPos--) {
            const currentBitPowerOfTwo = bigIntFromNumber(1) << bigIntFromNumber(bitPos);
            const maskForLowerBits = currentBitPowerOfTwo - bigIntFromNumber(1);

            // If the current bit in the overall XOR state is not set, skip to the next bit
            if ((currentOverallXORState & currentBitPowerOfTwo) === bigIntFromNumber(0)) {
                continue;
            }

            // Calculate potential transfer amount 'deltaCandidate'
            let deltaCandidate = (firstPrimaryValue & maskForLowerBits) + bigIntFromNumber(1);

            // Determine the minimum valid transfer amount
            const secondOperandContribution = currentBitPowerOfTwo - (secondPrimaryValue & maskForLowerBits);
            deltaCandidate = (deltaCandidate > secondOperandContribution) ? secondOperandContribution : deltaCandidate;

            // Check if the transfer is feasible with respect to firstPrimaryValue
            if (deltaCandidate < firstPrimaryValue) {
                // Apply the transfer
                totalAdjustmentDelta = totalAdjustmentDelta + deltaCandidate;
                firstPrimaryValue = firstPrimaryValue - deltaCandidate;
                secondPrimaryValue = secondPrimaryValue + deltaCandidate;

                // Break from the inner bit-loop as a successful transfer was made
                break;
            } else {
                // If transfer not feasible, this branch indicates an impossible state
                return -1;
            }
        }
        // Re-calculate the overall XOR state after adjustment
        currentOverallXORState = firstPrimaryValue ^ secondPrimaryValue ^ cumulativeXORSumOfRest;
    }

    return totalAdjustmentDelta; // Return the accumulated adjustments
}

// Execute the main problem-solving function
var finalOutput = solveProblem();

// Output the result to standard output
if (finalOutput !== undefined) {
    console.log(String(finalOutput));
}