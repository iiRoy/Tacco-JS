"use strict";

// Utility class for parsing input data from a string source.
class StreamReader {
    // Constructor initializes the parser with the input text.
    constructor(textContent) {
        // Ensure input content is provided to prevent errors.
        if (typeof textContent === 'undefined' || textContent === null) {
            throw new Error('Input text content cannot be omitted or null!');
        }
        // Split the input into individual tokens based on whitespace or newlines.
        this.tokenCache = textContent.split(/[\n\s]+/);
        // Initialize a pointer to keep track of the current token being read.
        this.readIndex = 0;
    }

    // Retrieves the next integer token from the input stream.
    fetchNextInteger() {
        // Basic validation: ensure there are tokens left to read.
        if (this.readIndex >= this.tokenCache.length) {
            throw new Error('Attempted to read past end of input stream.');
        }
        // Parse the token as an integer with base 10 and advance the pointer.
        return parseInt(this.tokenCache[this.readIndex++], 10);
    }

    // Retrieves an array of 'count' integers from the input stream.
    fetchIntegerArray(count) {
        // Validate the requested array size.
        if (typeof count === 'undefined' || count <= 0) {
            throw new Error('Array count must be a positive integer!');
        }
        const parsedValues = new Array(count);
        // Populate the array by fetching 'count' individual integers.
        for (let i = 0; i < count; i++) {
            parsedValues[i] = this.fetchNextInteger();
        }
        return parsedValues;
    }

    // Retrieves the next string token from the input stream.
    fetchNextString() {
        if (this.readIndex >= this.tokenCache.length) {
            throw new Error('Attempted to read past end of input stream.');
        }
        return this.tokenCache[this.readIndex++];
    }

    // Retrieves an array of 'count' string tokens from the input stream.
    fetchStringArray(count) {
        if (typeof count === 'undefined' || count <= 0) {
            throw new Error('Array count must be a positive integer!');
        }
        const parsedStrings = new Array(count);
        for (let i = 0; i < count; i++) {
            parsedStrings[i] = this.fetchNextString();
        }
        return parsedStrings;
    }
}

// Helper object for bit manipulation utilities.
const BitUtils = {
    // Defines the fixed width for binary representations.
    BIT_LENGTH_CONSTANT: 20,

    /**
     * Converts a given number to its binary string representation,
     * zero-padded to a fixed length.
     * @param {number} decimalValue The number to convert.
     * @returns {string} The zero-padded binary string.
     */
    convertToPaddedBinary: (decimalValue) => {
        // For this problem context, numbers are typically non-negative.
        // Handle negative values by treating them as 0 for binary conversion.
        if (decimalValue < 0) {
            return '0'.repeat(BitUtils.BIT_LENGTH_CONSTANT);
        }
        const binaryString = decimalValue.toString(2);
        // Use padStart for a more modern and readable approach than substr.
        return binaryString.padStart(BitUtils.BIT_LENGTH_CONSTANT, '0');
    }
};

// Main program execution function.
function ExecuteProgram(rawData) {
    // Initialize a data reader for processing the input.
    const inputParser = new StreamReader(rawData);

    // Read the total number of elements (N) and the array of N integers.
    const elementCount = inputParser.fetchNextInteger();
    // Validate elementCount to prevent issues with empty or invalid arrays.
    if (elementCount < 1) {
        console.log(0); // If no elements, no valid subarrays.
        return;
    }
    const inputValues = inputParser.fetchIntegerArray(elementCount);

    // Define the maximum bit width to consider for each number.
    const maxBitWidth = BitUtils.BIT_LENGTH_CONSTANT;

    // Initialize a 2D array to store prefix sums of bit counts.
    // cumulativeBitCounts[i][j] will store the count of the j-th bit
    // being set in the first 'i' numbers of 'inputValues'.
    // Using elementCount + 1 for 1-based indexing convenience for prefix sums.
    const cumulativeBitCounts = Array.from({ length: elementCount + 1 }, () => new Array(maxBitWidth).fill(0));

    // Populate the cumulative bit counts array.
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        // Get the binary representation of the current number.
        const currentBinaryString = BitUtils.convertToPaddedBinary(inputValues[currentIdx]);

        // For each bit position, update the prefix sum.
        for (let bitPosition = 0; bitPosition < maxBitWidth; bitPosition++) {
            // Inherit the count from the previous element's prefix sum.
            cumulativeBitCounts[currentIdx + 1][bitPosition] = cumulativeBitCounts[currentIdx][bitPosition];
            // Add 1 if the current bit is set (i.e., '1').
            if (currentBinaryString[bitPosition] === '1') {
                cumulativeBitCounts[currentIdx + 1][bitPosition]++;
            }
        }
    }

    // Variable to store the final count of valid subarrays.
    let uniqueBitsSubarrayCount = 0;

    // Iterate through all possible subarrays [startIdx, currentEndIdx].
    // startIdx is 0-based, representing the beginning of the subarray.
    for (let startIdx = 0; startIdx < elementCount; startIdx++) {
        // Flag to track if the current subarray (from startIdx to currentEndIdx)
        // still maintains the unique bits property.
        let hasUniqueBits = true;

        // currentEndIdx is 0-based, representing the end of the subarray.
        // The loop continues as long as 'hasUniqueBits' is true,
        // allowing for early termination if a non-unique bit pattern is found.
        for (let currentEndIdx = startIdx; currentEndIdx < elementCount && hasUniqueBits; currentEndIdx++) {
            // Iterate through each bit position to check its count within the subarray.
            for (let bitCheckPosition = 0; bitCheckPosition < maxBitWidth; bitCheckPosition++) {
                // Calculate the count of the current bit in the subarray [startIdx, currentEndIdx].
                // Using prefix sums: count = cumulativeBitCounts[end+1][bit] - cumulativeBitCounts[start][bit]
                const bitOccurrenceCount = cumulativeBitCounts[currentEndIdx + 1][bitCheckPosition] - cumulativeBitCounts[startIdx][bitCheckPosition];

                // If any bit appears more than once, the subarray is invalid.
                if (bitOccurrenceCount > 1) {
                    hasUniqueBits = false;
                    // No need to check further bits for this specific subarray length.
                    break;
                }
            }

            // If after checking all bits, the subarray is still valid, increment the total count.
            if (hasUniqueBits) {
                uniqueBitsSubarrayCount++;
            } else {
                // If the current subarray [startIdx, currentEndIdx] is invalid (has duplicate bits),
                // then any longer subarray starting at startIdx (i.e., [startIdx, currentEndIdx+1], etc.)
                // will also be invalid because it will contain the same duplicate bits.
                // Therefore, we can safely break out of this inner loop and move to the next 'startIdx'.
            }
        }
    }

    // Output the final result.
    console.log(uniqueBitsSubarrayCount);
}

// Standard boilerplate for running the program in a Node.js environment.
// Reads input from standard input if not in a browser environment.
if (typeof window === "undefined") {
    // Use 'fs' module to read synchronous file content.
    const fileSystem = require("fs");
    // Read the entire content of stdin as UTF-8.
    const stdInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    // Execute the main program with the read content.
    ExecuteProgram(stdInputContent);
}