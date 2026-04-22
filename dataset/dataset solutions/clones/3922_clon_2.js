"use strict"; // Enforces strict parsing and error handling rules for cleaner code.

/**
 * Primary program entry point.
 * This function processes the provided data source to solve a series of queries.
 * @param {string} dataSource - The raw input data as a string.
 */
function PrimaryHandler(dataSource) {
    // Initialize a data parser to handle input tokenization.
    const dataParser = new InputProcessor(dataSource);

    // Read the total number of queries to be processed.
    let queryCount = dataParser.retrieveInteger();

    // Loop through each query.
    for (let iterationIndex = 0;
         iterationIndex < queryCount;
         iterationIndex++) {
        // Retrieve the two numerical inputs for the current query.
        let firstValue = dataParser.retrieveInteger();
        let secondValue = dataParser.retrieveInteger();

        // --- Logic for determining the output based on firstValue and secondValue ---
        // Case 1: If both values are identical.
        if (firstValue === secondValue) {
            console.log(2 * firstValue - 2);
        }
        // Case 2: If the values are consecutive (differ by exactly 1).
        else if (firstValue + 1 === secondValue || secondValue + 1 === firstValue) {
            console.log(2 * Math.min(firstValue, secondValue) - 2);
        }
        // Case 3: General case for distinct, non-consecutive values.
        else {
            // Calculate the product of the two values.
            const productResult = firstValue * secondValue;
            // Find the floor of the square root of the product.
            let divisorCandidate = Math.floor(Math.sqrt(productResult));

            // Adjust the candidate if it's a perfect square root.
            if (divisorCandidate * divisorCandidate === productResult) {
                divisorCandidate--;
            }

            // Determine the final output based on the adjusted candidate.
            if (divisorCandidate * (divisorCandidate + 1) >= productResult) {
                console.log(2 * divisorCandidate - 2);
            } else {
                console.log(2 * divisorCandidate - 1);
            }
        }
    }
}

/**
 * A utility class for parsing various data types from a raw string input.
 */
class InputProcessor {
    /**
     * Initializes the InputProcessor with raw data.
     * @param {string} rawData - The raw string data to be processed.
     * @throws {Error} If rawData is undefined.
     */
    constructor(rawData) {
        if (typeof rawData === 'undefined') {
            throw new Error('Parameter (input data source) cannot be omitted!');
        }
        // Initialize the index for token traversal.
        this.tokenIndex = 0;
        // Split the raw data into tokens using newlines or spaces as delimiters.
        this.parsedTokens = rawData.split(/\n|\s/);
    }

    /**
     * Retrieves the next token from the parsed list and converts it to an integer.
     * @returns {number} The next integer token.
     */
    retrieveInteger() {
        // Use parseInt for explicit integer conversion, base 10.
        return parseInt(this.parsedTokens[this.tokenIndex++], 10);
    }

    /**
     * Retrieves an array of integers of a specified length.
     * @param {number} count - The desired number of integers to retrieve.
     * @returns {number[]} An array containing the retrieved integers.
     * @throws {Error} If count is undefined.
     */
    retrieveIntegerArray(count) {
        if (typeof count === 'undefined') {
            throw new Error('Parameter (required array size) cannot be omitted!');
        }
        const resultArray = new Array(count);
        for (let elementIndex = 0; elementIndex < count; elementIndex++) {
            resultArray[elementIndex] = this.retrieveInteger();
        }
        return resultArray;
    }

    /**
     * Retrieves the next token from the parsed list as a string.
     * @returns {string} The next string token.
     */
    retrieveString() {
        return this.parsedTokens[this.tokenIndex++];
    }

    /**
     * Retrieves an array of strings of a specified length.
     * @param {number} arraySize - The desired number of strings to retrieve.
     * @returns {string[]} An array containing the retrieved strings.
     * @throws {Error} If arraySize is undefined.
     */
    retrieveStringArray(arraySize) {
        if (typeof arraySize === 'undefined') {
            throw new Error('Parameter (string array dimension) cannot be omitted!');
        }
        const stringStorage = new Array(arraySize);
        for (let stringIdx = 0; stringIdx < arraySize; stringIdx++) {
            stringStorage[stringIdx] = this.retrieveString();
        }
        return stringStorage;
    }
}

// Entry point for execution:
// This block determines if the script is running in a Node.js environment
// (i.e., not in a web browser) and then calls the primary handler with stdin.
if (typeof globalThis.window === "undefined") {
    // Dynamically load the 'fs' module for file system operations.
    const fileSystem = require("node:fs");
    // Define the path to standard input.
    const standardInputPath = "/dev/stdin";
    // Specify the encoding for reading the file.
    const encodingType = "utf8";
    // Read the content of standard input and pass it to the primary handler.
    PrimaryHandler(fileSystem.readFileSync(standardInputPath, encodingType));
}