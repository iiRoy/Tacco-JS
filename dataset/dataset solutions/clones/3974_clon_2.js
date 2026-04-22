"use strict"; // Enforce strict mode for cleaner code and error prevention

/**
 * Executes a binary search on a sorted numerical collection to determine
 * the appropriate insertion point for a given target value. This effectively
 * finds the "lower bound" – the index of the first element that is not
 * less than the specified target.
 *
 * @param {Array<number>} sortedCollection A numerically sorted array in ascending order.
 * @param {number} targetValue The value for which to find the lower bound.
 * @returns {number} The calculated index representing the lower bound.
 */
function findInsertionPoint (
    sortedCollection,
    targetValue
) {
    let leftPtr = 0; // Initialize the left boundary pointer
    let rightPtr = sortedCollection.length - 1; // Initialize the right boundary pointer

    // Continue searching as long as the potential range is valid
    while (rightPtr - leftPtr >= 0) {
        // Calculate the middle index of the current search range
        const midIdx = Math.floor((leftPtr + rightPtr) / 2);

        // Compare the target value with the element at the middle index
        if (targetValue <= sortedCollection[midIdx]) {
            rightPtr = midIdx - 1; // Target is in the left half or at midIdx, so shrink right boundary
        } else {
            leftPtr = midIdx + 1; // Target is in the right half, so shrink left boundary
        }
    }
    // The left pointer now holds the index of the lower bound
    return leftPtr;
}

/**
 * The primary function that orchestrates the program's logic. It reads input,
 * performs calculations based on bitwise operations and binary searches,
 * and outputs a final result.
 *
 * @param {string} rawInputData The entire input content as a single string.
 */
function ExecuteProgram ( rawInputData ) {
    // Instantiate a utility for parsing various data types from the input string
    const inputReader = new DataStreamProcessor(rawInputData);

    // Read the number of elements (N) and two arrays (A and B) from the input
    const quantityElements = inputReader.retrieveInteger();
    const primaryValues = inputReader.retrieveIntegerArray(quantityElements);
    const secondaryValues = inputReader.retrieveIntegerArray(quantityElements);

    // Declare auxiliary arrays to store masked values during processing
    const maskedPrimary = new Array(quantityElements);
    const maskedSecondary = new Array(quantityElements);

    let cumulativeXORSum = 0; // Accumulator for the final XOR sum result

    // Iterate through each bit position (from 0 up to 29, representing 30 bits)
    for (let bitPosition = 0; bitPosition < 30; bitPosition++) {
        let parityCount = 0; // Counter for determining parity for the current bit
        // Create a bitmask for the current bit window: (1 << (k+1)) - 1
        // This mask isolates bits from 0 up to bitPosition
        const bitWindowMask = (1 << (bitPosition + 1)) - 1;

        // Apply the generated bitmask to all elements of both primary and secondary arrays
        for (let dataPointer = 0; dataPointer < quantityElements; dataPointer++) {
            maskedPrimary[dataPointer] = primaryValues[dataPointer] & bitWindowMask;
            maskedSecondary[dataPointer] = secondaryValues[dataPointer] & bitWindowMask;
        }

        // Sort the masked secondary array to enable efficient binary search operations
        maskedSecondary.sort((valA, valB) => valA - valB);

        // Determine the weight of the current bit (2^k)
        const bitWeight = 1 << bitPosition;

        // Iterate through each element of the masked primary array
        for (let arrayIndex = 0; arrayIndex < quantityElements; arrayIndex++) {
            // Calculate the lower and upper bounds for the first range: [T - a_i, 2T - a_i)
            const rangeStart1 = findInsertionPoint(maskedSecondary, (1 * bitWeight) - maskedPrimary[arrayIndex]);
            const rangeEnd1 = findInsertionPoint(maskedSecondary, (2 * bitWeight) - maskedPrimary[arrayIndex]);

            // Calculate the lower and upper bounds for the second range: [3T - a_i, 4T - a_i)
            const rangeStart2 = findInsertionPoint(maskedSecondary, (3 * bitWeight) - maskedPrimary[arrayIndex]);
            const rangeEnd2 = findInsertionPoint(maskedSecondary, (4 * bitWeight) - maskedPrimary[arrayIndex]);

            // Update the parity count based on the number of elements found in the first range
            parityCount += rangeEnd1 - rangeStart1;
            parityCount %= 2; // Ensure parityCount remains 0 or 1

            // Update the parity count based on the number of elements found in the second range
            parityCount += rangeEnd2 - rangeStart2;
            parityCount %= 2; // Ensure parityCount remains 0 or 1
        }

        // If the final parity count for this bit position is odd, set the corresponding bit in the result
        if (parityCount === 1) {
            cumulativeXORSum |= (1 << bitPosition);
        }
    }
    // Output the final accumulated XOR sum to the console
    console.log(cumulativeXORSum);
}

/**
 * A specialized utility class designed for sequential parsing of various
 * data types (integers, strings) from a single input text stream.
 */
class DataStreamProcessor {
    /**
     * Initializes a new instance of the DataStreamProcessor.
     * @param {string} streamContent The raw string data to be processed.
     * @throws {Error} If the initial stream content is not provided.
     */
    constructor (streamContent) {
        if (typeof streamContent === 'undefined') {
            throw new Error('Input content parameter cannot be omitted!');
        }
        this.readPosition = 0; // Tracks the current index of the token being read
        // Splits the input string into an array of tokens using newlines or spaces as delimiters
        this.parsedTokens = streamContent.split(/\n|\s/);
    }

    /**
     * Retrieves the next token from the stream and converts it into an integer.
     * @returns {number} The parsed integer value.
     */
    retrieveInteger () {
        // Reads the token at the current position, converts it to a number, and then advances the position
        return Number(this.parsedTokens[this.readPosition++]);
    }

    /**
     * Reads a specified number of integer tokens from the stream and returns them as an array.
     * @param {number} listSize The desired number of integers to retrieve.
     * @returns {Array<number>} An array populated with the parsed integer values.
     * @throws {Error} If the size parameter is invalid (undefined or less than 1).
     */
    retrieveIntegerArray (listSize) {
        if (typeof listSize === 'undefined' || listSize < 1) {
            throw new Error('Size parameter (must be 1 or greater) cannot be omitted!');
        }
        const numericList = new Array(listSize); // Pre-allocate an array of the specified size
        // Loop to fill the array by repeatedly calling retrieveInteger
        for (let elementIndex = 0; elementIndex < listSize; elementIndex++) {
            numericList[elementIndex] = this.retrieveInteger();
        }
        return numericList;
    }

    /**
     * Retrieves the next token from the stream as a string.
     * @returns {string} The raw string token.
     */
    extractString () {
        // Returns the token at the current position as a string and then advances the position
        return this.parsedTokens[this.readPosition++];
    }

    /**
     * Reads a specified number of string tokens from the stream and returns them as an array.
     * @param {number} listSize The desired number of strings to retrieve.
     * @returns {Array<string>} An array populated with the parsed string tokens.
     * @throws {Error} If the size parameter is invalid (undefined or less than 1).
     */
    extractStringArray (listSize) {
        if (typeof listSize === 'undefined' || listSize < 1) {
            throw new Error('Size parameter (must be 1 or greater) cannot be omitted!');
        }
        const textTokenList = new Array(listSize); // Pre-allocate an array of the specified size
        // Loop to fill the array by repeatedly calling extractString
        for (let elementIndex = 0; elementIndex < listSize; elementIndex++) {
            textTokenList[elementIndex] = this.extractString();
        }
        return textTokenList;
    }
}

// Check if the code is running in a Node.js-like environment (i.e., not in a browser)
if (typeof globalThis.window === "undefined") {
    // If in Node.js, read input from standard input (/dev/stdin)
    // and pass it to the main program execution function.
    ExecuteProgram(
        require("node:fs").readFileSync("/dev/stdin", { encoding: "utf-8" })
    );
}