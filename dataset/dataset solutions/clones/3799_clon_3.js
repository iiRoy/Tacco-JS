"use strict";

// Helper class to parse input data efficiently.
class DataStreamReader {
    /**
     * Initializes the reader with the raw input string.
     * @param {string} inputString The raw string containing numbers/tokens.
     */
    constructor(inputString) {
        // Validate input presence and type.
        if (typeof inputString !== 'string' || inputString.trim().length === 0) {
            throw new Error('Input data string cannot be empty or undefined. Please provide valid source data.');
        }
        /** @private {number} Current index for tokenized input, tracking position in the buffer. */
        this.readPointer = 0;
        /** @private {string[]} Array of tokens split by newline or space, with empty strings removed. */
        this.tokenBuffer = inputString.split(/\s+/).filter(Boolean);
    }

    /**
     * Reads the next token from the stream and converts it to an integer.
     * @returns {number} The parsed integer value.
     * @throws {Error} If attempting to read beyond the available input tokens.
     */
    readInteger() {
        if (this.readPointer >= this.tokenBuffer.length) {
            throw new Error('Input stream exhausted: No more integer tokens available to read.');
        }
        // Using unary plus (+) operator for efficient string-to-number conversion.
        return +this.tokenBuffer[this.readPointer++];
    }

    /**
     * Reads a specified number of consecutive tokens as integers into an array.
     * @param {number} count The number of integers to read. Must be positive.
     * @returns {number[]} An array containing the parsed integer values.
     * @throws {Error} If the count is not a positive number.
     */
    readIntegerArray(count) {
        // Basic validation for the requested array size.
        if (count <= 0 || !Number.isInteger(count)) {
            throw new Error('Invalid count for reading integer array: Must be a positive integer.');
        }
        const numericData = new Array(count);
        for (let i = 0; i < count; i++) {
            numericData[i] = this.readInteger();
        }
        return numericData;
    }

    /**
     * Reads the next token from the stream as a string.
     * @returns {string} The next string token.
     * @throws {Error} If attempting to read beyond the available input tokens.
     */
    readString() {
        if (this.readPointer >= this.tokenBuffer.length) {
            throw new Error('Input stream exhausted: No more string tokens available to read.');
        }
        return this.tokenBuffer[this.readPointer++];
    }

    /**
     * Reads a specified number of consecutive tokens as strings into an array.
     * @param {number} count The number of strings to read. Must be positive.
     * @returns {string[]} An array containing the string tokens.
     * @throws {Error} If the count is not a positive number.
     */
    readStringArray(count) {
        // Basic validation for the requested array size.
        if (count <= 0 || !Number.isInteger(count)) {
            throw new Error('Invalid count for reading string array: Must be a positive integer.');
        }
        const stringData = new Array(count);
        for (let i = 0; i < count; i++) {
            stringData[i] = this.readString();
        }
        return stringData;
    }

    /**
     * Checks if there are more tokens remaining in the input stream to be read.
     * @returns {boolean} True if more tokens are available, false otherwise.
     */
    hasMoreTokens() {
        return this.readPointer < this.tokenBuffer.length;
    }
}

// Constant defining the maximum bit position to consider (0-indexed).
// This implies numbers up to 2^BIT_DEPTH - 1 can be fully analyzed.
const BIT_DEPTH = 20;

/**
 * Helper function to determine if a specific bit is set (i.e., is 1) in a given number.
 * @param {number} value The integer number to examine.
 * @param {number} bitPosition The 0-indexed position of the bit (e.g., 0 for the least significant bit).
 * @returns {boolean} True if the bit at `bitPosition` is set in `value`, false otherwise.
 */
function isBitSet(value, bitPosition) {
    // A simple guard for unusually large bit positions, though BIT_DEPTH is small here.
    if (bitPosition < 0 || bitPosition >= 31) { // JavaScript bitwise operations typically work on 32-bit signed integers.
        return false; // Beyond typical integer bit range or invalid position.
    }
    // Perform a bitwise AND operation with a mask where only the target bit is set.
    return (value & (1 << bitPosition)) !== 0;
}

/**
 * Main function to process the input data and calculate the number of "valid" subarrays.
 * A subarray is considered valid if, for every possible bit position (from 0 to BIT_DEPTH-1),
 * that specific bit appears at most once (0 or 1 times) within the numbers of the subarray.
 * @param {string} rawInputData The raw string input, typically from standard input.
 */
function analyzeNumericSequence(rawInputData) {
    // Instantiate a parser to handle input tokenization.
    const inputParser = new DataStreamReader(rawInputData);

    // Read the total number of elements in the sequence.
    const sequenceLength = inputParser.readInteger();

    // Early exit for edge cases where the sequence is empty or invalid.
    if (sequenceLength <= 0) {
        console.log(0); // An empty sequence has no valid non-empty subarrays.
        return;
    }

    // Read the array of numbers from the input.
    const numericSequence = inputParser.readIntegerArray(sequenceLength);

    // Create a 2D array to store prefix sums of bit counts.
    // `bitCountsCumulative[i][j]` will store the total count of the j-th bit being set
    // in the elements `numericSequence[0]` through `numericSequence[i-1]`.
    // The array has `sequenceLength + 1` rows (for 0-indexed prefix sum convenience) and `BIT_DEPTH` columns.
    const bitCountsCumulative = Array.from({ length: sequenceLength + 1 }, () => new Array(BIT_DEPTH).fill(0));

    // Populate the prefix sum array.
    // The outer loop iterates through each element of the input sequence.
    // `currentEndIndex` is 1-indexed, corresponding to the length of the prefix.
    for (let currentEndIndex = 1; currentEndIndex <= sequenceLength; currentEndIndex++) {
        // Get the current number from the input sequence (0-indexed).
        const currentNumber = numericSequence[currentEndIndex - 1];

        // The inner loop iterates through each relevant bit position (0 to BIT_DEPTH-1).
        for (let bitPosition = 0; bitPosition < BIT_DEPTH; bitPosition++) {
            // Retrieve the count of this bit from the previous prefix sum.
            const countFromPreviousPrefix = bitCountsCumulative[currentEndIndex - 1][bitPosition];

            // Determine if the current bit is set in the `currentNumber` using the helper function.
            const bitIsActiveInCurrentNumber = isBitSet(currentNumber, bitPosition);

            // Update the cumulative count for the current bit position.
            // If the bit is active, add 1 to the previous count; otherwise, add 0.
            bitCountsCumulative[currentEndIndex][bitPosition] = countFromPreviousPrefix + (bitIsActiveInCurrentNumber ? 1 : 0);
        }
    }

    let totalValidSubarrays = 0; // This variable will accumulate the final count.

    // Iterate through all possible subarrays [startIndex, endIndex] of the original sequence.
    // `startIndex` and `endIndex` are 1-indexed, aligning with `bitCountsCumulative`.
    for (let startIndex = 1; startIndex <= sequenceLength; startIndex++) {
        // Flag to optimize the search: if a subarray starting at `startIndex` becomes invalid,
        // all longer subarrays starting at `startIndex` will also be invalid.
        let currentSubarrayIsValid = true;

        // The `endIndex` iterates from the current `startIndex` up to the end of the sequence.
        for (let endIndex = startIndex; endIndex <= sequenceLength; endIndex++) {
            // Optimization: If the subarray up to `endIndex - 1` was already found invalid,
            // no need to check further for this `startIndex`.
            if (!currentSubarrayIsValid) {
                break;
            }

            // Iterate through each bit position to check the validity of the subarray
            // defined by `numericSequence[startIndex-1 ... endIndex-1]`.
            for (let bitCheckPos = 0; bitCheckPos < BIT_DEPTH; bitCheckPos++) {
                // Calculate the frequency of the current bit (`bitCheckPos`) within the subarray window.
                // This is achieved by subtracting the cumulative count before the subarray starts
                // from the cumulative count up to the end of the subarray.
                const bitFrequencyInWindow = bitCountsCumulative[endIndex][bitCheckPos] - bitCountsCumulative[startIndex - 1][bitCheckPos];

                // If any bit appears more than once in the current subarray, it's invalid.
                if (bitFrequencyInWindow > 1) {
                    currentSubarrayIsValid = false; // Mark the subarray as invalid.
                    break; // No need to check other bits for this specific subarray.
                }
            }

            // If, after checking all bits, the subarray remains valid, increment the total count.
            if (currentSubarrayIsValid) {
                totalValidSubarrays++;
            } else {
                // If the current subarray was found invalid, any further extension of it
                // (i.e., increasing `endIndex` for the same `startIndex`) will also be invalid.
                // Thus, we can break out of the inner `endIndex` loop.
                break;
            }
        }
    }

    // Output the final computed count of valid subarrays.
    console.log(totalValidSubarrays);
}

// This block ensures the code runs correctly in a Node.js environment
// by reading input from standard input (/dev/stdin).
if (typeof window === "undefined") {
    const fileSystem = require("fs"); // Dynamically import the 'fs' module.
    try {
        const standardInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
        analyzeNumericSequence(standardInputData);
    } catch (error) {
        // Log any errors that occur during file reading or data processing.
        console.error("An error occurred while processing input:", error.message);
        // In a production environment, you might want to exit with a non-zero status code.
        // process.exit(1);
    }
}