"use strict";

/**
 * Main processing function for the problem.
 * @param {string} rawData - The input data as a string.
 */
function ProcessInput(rawData) {
    // Initialize a data parser to handle input tokens.
    let dataParser = new DataProcessor(rawData);

    // Read the number of elements and the array of element values.
    let countElements = dataParser.fetchInteger();
    let elementValues = dataParser.fetchIntegerArray(countElements);

    // Define the maximum bit length to consider for each number.
    const bitLength = 0x14; // Equivalent to 20

    // Create a 2D array to store prefix sums of bits.
    // bitPrefixSums[i][j] will store the count of the j-th bit being set
    // in the first 'i' numbers of elementValues.
    let bitPrefixSums = new Array(countElements + 0x1).fill(0x0).map(() => new Array(bitLength));

    // Initialize the first row (for 0 elements) with zeros.
    bitPrefixSums[0x0].fill(0x0);

    // Populate the bitPrefixSums array.
    // Iterate through each number in the input array.
    for (let idx = 0x1; idx <= countElements; idx++) {
        // Iterate through each bit position.
        for (let bitPos = 0x0, bitMask = 524288; bitPos < bitLength; bitPos++, bitMask >>= 0x1) {
            // Calculate the prefix sum for the current bit.
            // If the bit is set in the current number, add 1 to the previous prefix sum.
            bitPrefixSums[idx][bitPos] = bitPrefixSums[idx - 0x1][bitPos] + ((elementValues[idx - 0x1] & bitMask) ? 0x1 : 0x0);
        }
    }

    // Initialize the counter for valid segments.
    let resultCount = 0x0;

    // Iterate through all possible starting positions of a segment.
    for (let idx = 0x1; idx <= countElements; idx++) {
        let isValidSegment = !false; // Flag to track if the current segment is valid.

        // Iterate through all possible ending positions of a segment, starting from the current 'idx'.
        for (let endIdx = idx; endIdx <= countElements && isValidSegment; endIdx++) {
            // Check each bit position within the current segment.
            for (let currentBit = 0x0; currentBit < bitLength && isValidSegment; currentBit++) {
                // Calculate the count of the current bit within the segment [idx, endIdx].
                // If any bit appears more than once, the segment is invalid.
                if (bitPrefixSums[endIdx][currentBit] - bitPrefixSums[idx - 0x1][currentBit] > 0x1) {
                    isValidSegment = !true; // Mark as invalid.
                }
            }
            // If the segment is still valid after checking all bits, increment the result counter.
            if (isValidSegment) {
                resultCount++;
            } else {
                // If the segment became invalid, no further extensions of this segment can be valid.
                break;
            }
        }
    }

    // Output the final count of valid segments.
    console.log(resultCount);
}

/**
 * A utility class for parsing various data types from a string input.
 */
class DataProcessor {
    /**
     * Constructs a DataProcessor instance.
     * @param {string} sourceText - The raw string input to be parsed.
     */
    constructor(sourceText) {
        // Ensure that input is provided.
        if (typeof sourceText === 'undefined') {
            throw new Error('引数（stdin）を省略できません！');
        }
        this.currentPosition = 0x0; // Tracks the current position in the parsed tokens.
        // Split the input string by newlines or spaces to get individual tokens.
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    /**
     * Fetches and returns the next integer from the parsed tokens.
     * Increments the internal position counter.
     * @returns {number} The next integer.
     */
    fetchInteger() {
        return this.parsedTokens[this.currentPosition++] - 0x0; // Convert string to number.
    }

    /**
     * Fetches an array of integers of a specified length.
     * @param {number} length - The number of integers to fetch.
     * @returns {number[]} An array containing the fetched integers.
     */
    fetchIntegerArray(length) {
        // Ensure a valid length is provided.
        if (typeof length === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let outputArray = new Array(length);
        for (let loopIndex = 0x0; loopIndex < length; loopIndex++) {
            outputArray[loopIndex] = this.fetchInteger();
        }
        return outputArray;
    }

    /**
     * Fetches and returns the next string token.
     * Increments the internal position counter.
     * @returns {string} The next string token.
     */
    fetchString() {
        return this.parsedTokens[this.currentPosition++];
    }

    /**
     * Fetches an array of strings of a specified length.
     * @param {number} length - The number of strings to fetch.
     * @returns {string[]} An array containing the fetched strings.
     */
    fetchStringArray(length) {
        // Ensure a valid length is provided.
        if (typeof length === 'undefined') {
            throw new Error('引数（1以上）を省略できません！');
        }
        let outputArray = new Array(length);
        for (let loopIndex = 0x0; loopIndex < length; loopIndex++) {
            outputArray[loopIndex] = this.fetchString();
        }
        return outputArray;
    }
}

// Entry point for execution.
// If running in a Node.js environment (not in a browser window),
// read input from stdin and pass it to the main processing function.
if (typeof window === "undefined") {
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
