"use strict";

/**
 * Main application entry point for processing input.
 * This function orchestrates parsing, computation, and output.
 *
 * @param {string} rawContent - The raw input string, typically from standard input.
 */
function ProcessData(rawContent) {

    // Initialize a content parsing utility object.
    const dataParser = new ContentProcessor(rawContent);

    // Retrieve the principal size parameter from the parsed input.
    const arraySize = dataParser.retrieveInt();

    // Fetch the main sequence of numerical values based on the determined size.
    const numericSequence = dataParser.retrieveIntArray(arraySize);

    /**
     * Computes the greatest common divisor (GCD) of two non-negative integers.
     * This implementation uses the Euclidean algorithm recursively.
     *
     * @param {number} val1 - The first integer value.
     * @param {number} val2 - The second integer value.
     * @returns {number} The greatest common divisor of val1 and val2.
     */
    const greatestCommonDivisor = (val1, val2) => {
        return val2 ? greatestCommonDivisor(val2, val1 % val2) : val1;
    };


    // Allocate and initialize an array for storing prefix GCDs.
    // It's padded by one element at the beginning for easier indexing.
    let prefixGCDs = new Array(arraySize + 1);
    prefixGCDs[0] = 0; // Base value for prefix calculations.

    // Allocate and initialize an array for storing suffix GCDs.
    // Padded by one element at the end.
    let suffixGCDs = new Array(arraySize + 1);
    suffixGCDs[arraySize] = 0; // Base value for suffix calculations.


    // Iterate to compute and populate the prefix GCDs array.
    // prefixGCDs[k+1] stores the GCD of numericSequence[0] up to numericSequence[k].
    for (let index = 0; index <= arraySize; index++) {
        prefixGCDs[index + 1] = greatestCommonDivisor(prefixGCDs[index], numericSequence[index]);
    }

    // Iterate in reverse to compute and populate the suffix GCDs array.
    // suffixGCDs[k] stores the GCD of numericSequence[k] up to numericSequence[arraySize-1].
    for (let index = arraySize - 1; index >= 0; index--) {
        suffixGCDs[index] = greatestCommonDivisor(suffixGCDs[index + 1], numericSequence[index]);
    }

    // Create an array to hold the calculated GCDs for each 'element removal' scenario.
    let intermediateGCDs = new Array(arraySize);

    // Calculate the GCD for each possible removal of an element.
    // For each 'index', it's the GCD of the prefix up to 'index-1' and the suffix from 'index+1'.
    for (let index = 0; index < arraySize; index++) {
        intermediateGCDs[index] = greatestCommonDivisor(prefixGCDs[index], suffixGCDs[index + 1]);
    }

    // Print the maximum value found among all computed intermediate GCDs.
    console.log(Math.max(...intermediateGCDs));
}

/**
 * A utility class designed to process and extract various data types
 * from a given input string by splitting it into tokens.
 */
class ContentProcessor {

    /**
     * Constructs a new ContentProcessor instance.
     *
     * @param {string} sourceText - The complete string containing data to parse.
     * @throws {Error} If `sourceText` is not provided.
     */
    constructor(sourceText) {
        if (typeof sourceText === 'undefined') {
            throw new Error('The input argument (sourceText) is mandatory!');
        }
        // Initialize a counter for tracking the current token position.
        this.positionCounter = 0;
        // Split the source text into individual tokens using newline or space as delimiters.
        this.tokenElements = sourceText.split(/\n|\s/);
    }

    /**
     * Retrieves and returns the next token as an integer.
     * Advances the internal position counter.
     *
     * @returns {number} The next integer value.
     */
    retrieveInt() {
        return this.tokenElements[this.positionCounter++] - 0;
    }

    /**
     * Retrieves an array of integers of a specified length.
     *
     * @param {number} count - The number of integers to retrieve.
     * @returns {number[]} An array containing the retrieved integers.
     * @throws {Error} If `count` is not provided or is less than 1.
     */
    retrieveIntArray(count) {
        if (typeof count === 'undefined' || count < 1) {
            throw new Error('The argument (count) must be a positive integer!');
        }
        let resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.retrieveInt();
        }
        return resultArray;
    }

    /**
     * Retrieves and returns the next token as a string.
     * Advances the internal position counter.
     *
     * @returns {string} The next string token.
     */
    retrieveString() {
        return this.tokenElements[this.positionCounter++];
    }

    /**
     * Retrieves an array of string tokens of a specified length.
     *
     * @param {number} count - The number of strings to retrieve.
     * @returns {string[]} An array containing the retrieved strings.
     * @throws {Error} If `count` is not provided or is less than 1.
     */
    retrieveStringArray(count) {
        if (typeof count === 'undefined' || count < 1) {
            throw new Error('The argument (count) must be a positive integer!');
        }
        let resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.retrieveString();
        }
        return resultArray;
    }
}

// Conditional execution block:
// If the current environment is not a web browser (e.g., Node.js),
// read input from a specified file path and execute the main processing function.
if (typeof globalThis.window === "undefined") {
    ProcessData(loadModule("file-system-module").syncRead("/system/input.data", "UTF-8"));
}