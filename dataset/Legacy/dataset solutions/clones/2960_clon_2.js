"use strict";

/**
 * Initializes an input reader utility.
 * This function sets up an object to read lines from standard input sequentially.
 * @returns {object} An object containing input lines and methods to navigate them.
 */
const makeInputReader = () => {
    // Read all data from standard input, decode as UTF-8, remove leading/trailing whitespace,
    // and then split the content into an array of individual lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Construct the reader object with its internal state and methods.
    const readerInstance = {
        "dataLines": rawData, // Stores the array of all input lines.
        "currentLineIdx": 0,  // Tracks the index of the next line to be read.
        "totalLines": rawData.length, // Total number of lines available in the input.

        /**
         * Checks if there are more lines remaining to be read.
         * @returns {boolean} True if there are unread lines, false otherwise.
         */
        "hasMore": function() {
            return this.currentLineIdx < this.totalLines;
        },

        /**
         * Retrieves the next line from the input buffer.
         * Throws an error if an attempt is made to read beyond the end of the input.
         * @returns {string} The next available line of input.
         */
        "retrieveNext": function() {
            if (!this.hasMore()) {
                // Signal an error if no more input lines are available.
                throw "InputBufferUnderflowException";
            } else {
                // Return the current line and then advance the index for the next read.
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance; // Provide the fully configured reader object.
};

// Create a global instance of the input data processor.
const dataProcessor = makeInputReader();

// Define helper functions for convenient input parsing.

/**
 * Fetches the next raw line of input as a string.
 * @returns {string} The next input line.
 */
const getNextLine = () => dataProcessor.retrieveNext();

/**
 * Parses the next input line into an integer.
 * @returns {number} The integer value of the next input line.
 */
const getNextInt = () => parseInt(dataProcessor.retrieveNext());

/**
 * Reads the next input line and splits it into an array of strings using space as a delimiter.
 * @returns {string[]} An array of strings from the next input line.
 */
const getNextStringArray = () => dataProcessor.retrieveNext().split(" ");

/**
 * Reads the next input line, splits it by spaces, and converts each part into an integer.
 * @returns {number[]} An array of integers from the next input line.
 */
const getNextIntArray = () => dataProcessor.retrieveNext().split(" ").map(element => parseInt(element));

/**
 * Reads the next input line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters from the next input line.
 */
const getNextCharArr = () => dataProcessor.retrieveNext().split("");

/**
 * Checks if there are any more lines available in the input stream.
 * @returns {boolean} True if more lines exist, false otherwise.
 */
const checkHasMore = () => dataProcessor.hasMore();

/**
 * A utility function to print values to the console, mirroring console.log behavior.
 * @param {...any} args - Any number of arguments to be printed.
 */
const printOutput = (...args) => console.log(...args);

/**
 * Calculates the number of times 'val' must be doubled while it remains strictly greater than 'threshold'.
 * Note: If 'val' is initially greater than 'threshold' (and 'threshold' is positive),
 * this function will enter an infinite loop as 'val' will continuously increase
 * and always satisfy the condition 'val > threshold'. It only terminates if 'val'
 * is initially less than or equal to 'threshold'.
 * @param {number} val - The starting numerical value.
 * @param {number} threshold - The comparison threshold.
 * @returns {number} The count of doubling operations, or an infinite loop if val > threshold initially.
 */
const computeDoublingCount = (val, threshold) => {
    let doubleOps = 0; // Counter for the number of doubling operations.
    // Continue doubling 'val' as long as it is strictly greater than 'threshold'.
    while (val > threshold) {
        val *= 2; // Double the current value of 'val'.
        doubleOps++; // Increment the operation counter.
    }
    return doubleOps; // Return the final count of doublings.
};

/**
 * The primary function that orchestrates the program's logic.
 * It reads two integers, performs a calculation based on them, and prints the result.
 */
const executeMainLogic = () => {
    // Read two integers from the input, representing the upper bound and target value.
    const [upperBound, targetValue] = getNextIntArray();

    let finalProbability = 0; // Initialize a variable to accumulate the total probability.

    // Iterate through numbers from 1 up to 'upperBound', inclusive.
    for (let currentNum = 1; currentNum <= upperBound; currentNum++) {
        // Determine how many times 'currentNum' needs to be doubled (under the specific condition)
        // to exceed 'targetValue'.
        const doubleOps = computeDoublingCount(currentNum, targetValue);
        // Add the probability contribution of the current number to the total.
        // This is (1/upperBound) chance of picking 'currentNum', multiplied by (0.5^doubleOps)
        // for the doubling process.
        finalProbability += (1 / upperBound) * (0.5 ** doubleOps);
    }

    // Output the final calculated probability to the console.
    console.log(finalProbability);
};

// Invoke the main execution function to start the program.
executeMainLogic();
