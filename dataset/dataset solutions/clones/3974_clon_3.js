"use strict"; // Enforce strict mode for cleaner code and improved error handling

/**
 * Performs a binary search on a sorted array to find the insertion point for a target value.
 * This function returns the index where the target value would be inserted to maintain
 * the array's sorted order, such that all elements at or after this index are
 * greater than or equal to the target. This behavior is analogous to C++'s std::lower_bound.
 *
 * @param {number[]} sortedArr - The array of numbers, which must be sorted in ascending order.
 * @param {number} targetVal - The specific value for which to find the insertion point.
 * @returns {number} The zero-based index indicating the position where 'targetVal' could be inserted.
 *                   If 'targetVal' is greater than all elements, it returns 'sortedArr.length'.
 */
function findInsertionPoint(sortedArr, targetVal) {
    // Defensive programming: Validate input array to ensure it's an array of numbers.
    if (!Array.isArray(sortedArr) || sortedArr.some(element => typeof element !== 'number' || isNaN(element))) {
        console.error("Runtime Error: 'sortedArr' must be a valid array containing only numbers.");
        // In a real application, you might throw an Error instead of logging and returning 0.
        return 0;
    }

    let lowIdx = 0; // Represents the lower boundary of the current search segment.
    let highIdx = sortedArr.length - 1; // Represents the upper boundary of the current search segment.
    let resultIdx = sortedArr.length; // Stores the smallest index found so far that satisfies the condition.

    // Continue searching as long as the lower bound does not exceed the upper bound.
    while (lowIdx <= highIdx) {
        // Calculate the middle index. Using this formula prevents potential integer overflow
        // for very large arrays, compared to (lowIdx + highIdx) / 2.
        const midIdx = lowIdx + Math.floor((highIdx - lowIdx) / 2);

        // If the element at the middle index is greater than or equal to the target value,
        // it means the target could potentially be at this position or an earlier one.
        // We record this position and narrow our search to the left half.
        if (sortedArr[midIdx] >= targetVal) {
            resultIdx = midIdx; // Update the potential insertion point.
            highIdx = midIdx - 1; // Move the upper boundary to search the left segment.
        } else {
            // If the element at midIdx is less than the target, the target must be in the right half.
            lowIdx = midIdx + 1; // Move the lower boundary to search the right segment.
        }
    }
    // After the loop, 'resultIdx' holds the correct insertion point.
    return resultIdx;
}

/**
 * A utility class designed to parse various data types from a raw string input,
 * typically received from standard input. It processes tokens separated by
 * newlines or spaces.
 */
class StandardInputParser {
    /**
     * Initializes the parser with the provided input string data.
     * @param {string} inputStringData - The complete raw string content to be parsed.
     * @throws {Error} If the provided input data is not a string or is undefined.
     */
    constructor(inputStringData) {
        // Essential validation: ensure input data is provided and is of the correct type.
        if (typeof inputStringData === 'undefined' || typeof inputStringData !== 'string') {
            throw new Error('Parser Initialization Error: Input data must be a valid string, not undefined or null.');
        }
        // Split the input string into individual tokens using common delimiters.
        this.parsedTokens = inputStringData.split(/[\n\s]+/).filter(token => token.length > 0);
        this.currentIndex = 0; // Pointer to the next token to be consumed.
    }

    /**
     * Retrieves and parses the next available token as an integer.
     * @returns {number} The parsed integer value.
     * @throws {Error} If no more tokens are available or if the token cannot be parsed as an integer.
     */
    readInteger() {
        const currentToken = this._fetchNextToken(); // Delegate token retrieval to a private helper.
        const numericValue = parseInt(currentToken, 10); // Parse with explicit radix 10.
        // Validate if parsing was successful.
        if (isNaN(numericValue)) {
            throw new Error(`Parsing Error: Cannot convert token '${currentToken}' to an integer.`);
        }
        return numericValue;
    }

    /**
     * Reads a specified number of tokens and parses them into an array of integers.
     * @param {number} countToRead - The exact number of integers to read from the input.
     * @returns {number[]} An array containing the parsed integer values.
     * @throws {Error} If 'countToRead' is not a positive integer or if any token fails to parse.
     */
    readIntegerArray(countToRead) {
        // Validate the requested count for array reading.
        if (countToRead <= 0 || !Number.isInteger(countToRead)) {
            throw new Error('Array Reading Error: Count for integer array must be a positive integer.');
        }
        // Utilize Array.from with a mapping function for concise array creation and population.
        const integerCollection = Array.from({ length: countToRead }, () => this.readInteger());
        return integerCollection;
    }

    /**
     * Retrieves the next available token as a raw string.
     * @returns {string} The next string token.
     * @throws {Error} If no more tokens are available.
     */
    readStringToken() {
        return this._fetchNextToken();
    }

    /**
     * Reads a specified number of tokens and returns them as an array of strings.
     * @param {number} countToRead - The exact number of string tokens to read.
     * @returns {string[]} An array containing the string tokens.
     * @throws {Error} If 'countToRead' is not a positive integer or if no more tokens are available.
     */
    readStringArray(countToRead) {
        // Validate the requested count.
        if (countToRead <= 0 || !Number.isInteger(countToRead)) {
            throw new Error('Array Reading Error: Count for string array must be a positive integer.');
        }
        const stringCollection = Array.from({ length: countToRead }, () => this.readStringToken());
        return stringCollection;
    }

    /**
     * Private helper method to safely retrieve the next token from the parsedTokens array
     * and advance the internal index.
     * @returns {string} The next available token.
     * @private
     * @throws {Error} If the end of the input tokens has been reached.
     */
    _fetchNextToken() {
        if (this.currentIndex >= this.parsedTokens.length) {
            throw new Error('Input Exhausted Error: No more tokens available for reading.');
        }
        return this.parsedTokens[this.currentIndex++];
    }
}

/**
 * The primary function responsible for executing the main algorithm.
 * It processes input data to calculate a specific XOR sum based on bitwise operations
 * and binary search. This algorithm appears to solve a problem involving counting pairs
 * (a_i, b_j) such that their sum falls into certain ranges modulo 2^k.
 *
 * @param {string} rawDataString - The entire raw input content as a single string.
 */
function processInputData(rawDataString) {
    // Define a constant for the number of bits to iterate. This usually corresponds to the
    // maximum number of bits in the integers being processed (e.g., 30 for signed 32-bit integers).
    const MAX_BIT_ITERATIONS = 30;

    // Initialize the input parser to handle data extraction.
    const dataReader = new StandardInputParser(rawDataString);

    // Read the problem's parameters: array size N and two arrays A and B.
    const arraySize = dataReader.readInteger();
    const sourceArrayX = dataReader.readIntegerArray(arraySize);
    const sourceArrayY = dataReader.readIntegerArray(arraySize);

    // Guard clause: Handle trivial cases where the array size is non-positive.
    if (arraySize <= 0) {
        console.log(0); // If N is zero or negative, the result is trivially zero.
        return;
    }

    let finalResultAccumulator = 0; // This variable will store the final XOR sum.

    // Main algorithmic loop: Iterate through each relevant bit position.
    for (let bitPosition = 0; bitPosition < MAX_BIT_ITERATIONS; ++bitPosition) {
        let currentBitParityCounter = 0; // Tracks the parity (odd/even count) for the current bit.

        // Compute a bitmask that includes all bits from 0 up to (bitPosition).
        // This mask is used to truncate numbers to their relevant lower bits.
        // Example: bitPosition=0 -> mask = (1<<1)-1 = 1 (binary 01)
        //          bitPosition=1 -> mask = (1<<2)-1 = 3 (binary 11)
        const currentMaskValue = (1 << (bitPosition + 1)) - 1;

        // Type III change: Instead of re-using pre-allocated arrays,
        // create new masked arrays for X and Y in each iteration.
        // This makes the arrays effectively "immutable" within the loop scope.
        const temporaryArrayX = sourceArrayX.map(originalVal => originalVal & currentMaskValue);
        const temporaryArrayY = sourceArrayY.map(originalVal => originalVal & currentMaskValue);

        // Sort the temporary Y array. This is a prerequisite for using binary search.
        temporaryArrayY.sort((valA, valB) => valA - valB);

        // Calculate the current power of two (2^k) which represents the value of the current bit.
        const currentPowerOfTwo = 1 << bitPosition;

        // Inner loop: Iterate through each element of the masked X array.
        for (let elementIndex = 0; elementIndex < arraySize; ++elementIndex) {
            const xElementValue = temporaryArrayX[elementIndex];

            // Define the lower and upper bounds for the first target range.
            // This range is [T - xElementValue, 2T - 1 - xElementValue] (inclusive).
            // `findInsertionPoint` gives the index of the first element >= target.
            // So, count of elements in [L, R] is `findInsertionPoint(R+1) - findInsertionPoint(L)`.
            // The original logic implicitly uses `lowerBound(b, 2T - a[i])` which counts elements < 2T - a[i].
            // And `lowerBound(b, 1T - a[i])` which counts elements < 1T - a[i].
            // So `t1 - f1` counts elements in range `[1T - a[i], 2T - a[i] - 1]`.
            const range1LowerThreshold = (1 * currentPowerOfTwo) - xElementValue;
            const range1UpperThreshold = (2 * currentPowerOfTwo) - xElementValue; // Exclusive upper bound for `findInsertionPoint`

            const countStart1 = findInsertionPoint(temporaryArrayY, range1LowerThreshold);
            const countEnd1 = findInsertionPoint(temporaryArrayY, range1UpperThreshold);

            // Define the lower and upper bounds for the second target range.
            // This range is [3T - xElementValue, 4T - 1 - xElementValue] (inclusive).
            const range2LowerThreshold = (3 * currentPowerOfTwo) - xElementValue;
            const range2UpperThreshold = (4 * currentPowerOfTwo) - xElementValue; // Exclusive upper bound for `findInsertionPoint`

            const countStart2 = findInsertionPoint(temporaryArrayY, range2LowerThreshold);
            const countEnd2 = findInsertionPoint(temporaryArrayY, range2UpperThreshold);

            // Accumulate the counts for both ranges and update the parity counter.
            // Type III change: Using XOR assignment (`^=`) with bitwise AND (`& 1`) for parity.
            currentBitParityCounter ^= (countEnd1 - countStart1) & 1;
            currentBitParityCounter ^= (countEnd2 - countStart2) & 1;
        }

        // If the parity for the current bit position is 1 (odd count),
        // then this bit contributes to the final XOR sum.
        if (currentBitParityCounter !== 0) { // Type III change: `!== 0` instead of `== 1`.
            finalResultAccumulator |= (1 << bitPosition); // Set the corresponding bit in the result.
        }
    }

    // Output the final computed result to the console.
    console.log(finalResultAccumulator);
}

// Global execution block: Determines how the script acquires input based on the environment.
// This handles the common pattern of reading from stdin in Node.js environments.
if (typeof window === "undefined") {
    // If 'window' is undefined, we are likely in a Node.js environment.
    // Use the built-in 'fs' module to read from standard input.
    const fileSystemModule = require("fs"); // Import the file system module.
    const standardInputPath = "/dev/stdin"; // Define the standard input file path.
    const inputEncoding = "utf8"; // Specify the character encoding for the input.

    try {
        // Read the entire content of stdin synchronously.
        const rawInputContent = fileSystemModule.readFileSync(standardInputPath, inputEncoding);
        // Pass the raw content to the main processing function.
        processInputData(rawInputContent);
    } catch (error) {
        // Handle any errors that occur during file reading or data processing.
        console.error("Critical Error during input processing:", error.message);
        // Exit the process with an error code to indicate failure.
        process.exit(1);
    }
}