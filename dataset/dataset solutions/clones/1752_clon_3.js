"use strict"; // Enforce stricter parsing and error handling for better code quality.

/**
 * @typedef {object} DataStreamHandler
 * @property {string[]} lineStorage - Internal array holding all input lines.
 * @property {number} currentPosition - Pointer to the next line to be read.
 * @property {number} totalLinesCount - Total number of lines available in the input.
 * @property {function(): boolean} hasMoreEntries - Checks if there are more lines to read.
 * @property {function(): string} retrieveNextLine - Fetches the next line from the input stream.
 */

/**
 * Initializes a data stream handler to read input from standard input.
 * This function simulates reading from a file path common in competitive programming environments.
 * @returns {DataStreamHandler} An object capable of sequential input reading.
 */
const buildInputProcessor = () => {
    // Read all input from /dev/stdin, decode as UTF-8, remove leading/trailing whitespace,
    // and split into an array of lines.
    const sourceDataLines = require("fs")
        .readFileSync("/dev/stdin", "utf8")
        .trim()
        .split("\n");

    const streamManager = {
        lineStorage: sourceDataLines,
        currentPosition: 0,
        totalLinesCount: sourceDataLines.length,

        /**
         * Determines if there are unread lines in the input stream.
         * @returns {boolean} True if more lines can be read, false otherwise.
         */
        hasMoreEntries: function() {
            return this.currentPosition < this.totalLinesCount;
        },

        /**
         * Retrieves the next line from the input stream and advances the pointer.
         * Throws an error if no more lines are available.
         * @returns {string} The next line of input.
         * @throws {Error} If attempting to read beyond the end of the input.
         */
        retrieveNextLine: function() {
            if (!this.hasMoreEntries()) {
                throw new Error("EndOfInputStreamException: No more data available to read.");
            }
            // Return the current line and then increment the position for the next read.
            return this.lineStorage[this.currentPosition++];
        }
    };
    return streamManager;
};

// Global instance of the input processor, accessible throughout the application.
const applicationInput = buildInputProcessor();

/**
 * Fetches the next raw line of input.
 * @returns {string} The next input line.
 */
const fetchNextRawLine = () => applicationInput.retrieveNextLine();

/**
 * Parses the next input line as an integer.
 * @returns {number} The integer value of the next input line.
 */
const retrieveInteger = () => parseInt(applicationInput.retrieveNextLine(), 10);

/**
 * Splits the next input line into an array of strings (words).
 * @returns {string[]} An array of strings from the next input line.
 */
const parseLineIntoWords = () => applicationInput.retrieveNextLine().split(" ");

/**
 * Splits the next input line into an array of integers.
 * @returns {number[]} An array of integers from the next input line.
 */
const extractNumericArray = () => applicationInput.retrieveNextLine().split(" ").map(val => parseInt(val, 10));

/**
 * Splits the next input line into an array of characters.
 * @returns {string[]} An array of characters from the next input line.
 */
const getCharacterSequence = () => applicationInput.retrieveNextLine().split("");

/**
 * Checks if there is more input available.
 * @returns {boolean} True if more input exists, false otherwise.
 */
const hasRemainingInput = () => applicationInput.hasMoreEntries();

/**
 * Prints values to the console, similar to `console.log`.
 * @param {...any} values - The values to be printed.
 */
const emitOutput = (...values) => console.log(...values);

/**
 * Main function containing the core logic of the problem solution.
 * This function processes a sequence of numbers, calculates their sum based on frequencies,
 * and then updates this sum based on a series of replacement operations.
 */
const executeProblemSolution = () => {
    // Read the initial count of numbers.
    const initialElementCount = retrieveInteger();
    // Read the initial array of numbers.
    const baseNumberCollection = extractNumericArray();

    // A frequency map (object) to store the count of each unique number.
    let elementFrequencies = {};

    // Populate the frequency map from the initial collection.
    // This loop iterates through each number in the base collection.
    for (const currentNumber of baseNumberCollection) {
        // If the number is not yet in the map, initialize its count to 0 before incrementing.
        elementFrequencies[currentNumber] = (elementFrequencies[currentNumber] || 0) + 1;
    }

    // Read the total number of update queries.
    const numberOfQueries = retrieveInteger();

    // Arrays to store the 'from' and 'to' values for each query.
    let oldValuesForQueries = [];
    let newValuesForQueries = [];

    // Read all query pairs (old value, new value).
    // The original code used a while loop with hasNext, but since Q is read,
    // a for loop is more explicit for reading exactly Q queries.
    for (let qIdx = 0; qIdx < numberOfQueries; qIdx++) {
        const [oldVal, newVal] = extractNumericArray();
        oldValuesForQueries.push(oldVal);
        newValuesForQueries.push(newVal);
    }

    // Calculate the initial total sum based on the frequencies and values.
    let cumulativeSum = 0;
    // Iterate over each unique number present in the frequency map.
    // Object.keys() returns an array of string keys, so we convert them to numbers.
    for (const keyString of Object.keys(elementFrequencies)) {
        const numericKey = parseInt(keyString, 10);
        const count = elementFrequencies[numericKey];
        cumulativeSum += (count * numericKey); // Add (count * value) to the total sum.
    }

    // Process each query to update the frequencies and the cumulative sum.
    for (let queryIteration = 0; queryIteration < numberOfQueries; queryIteration++) {
        const valueToReplace = oldValuesForQueries[queryIteration];
        const replacementValue = newValuesForQueries[queryIteration];

        // Determine how many times the 'valueToReplace' currently appears.
        // If it's not in the map, its count is effectively zero.
        const countOfReplacedValue = elementFrequencies[valueToReplace] || 0;

        // Only proceed with updates if the value to be replaced actually exists.
        if (countOfReplacedValue > 0) {
            // Update the cumulative sum:
            // 1. Subtract the contribution of the old value (count * old_value).
            // 2. Add the contribution of the new value (count * new_value).
            cumulativeSum -= (countOfReplacedValue * valueToReplace);
            cumulativeSum += (countOfReplacedValue * replacementValue);

            // Update the frequency map:
            // 1. Add the count of the replaced value to the replacement value's frequency.
            //    If the replacement value wasn't in the map, its count starts from zero.
            elementFrequencies[replacementValue] = (elementFrequencies[replacementValue] || 0) + countOfReplacedValue;

            // 2. Remove the replaced value from the map as its count is now zero.
            //    Using 'delete' keeps the map clean by removing entries with zero count.
            delete elementFrequencies[valueToReplace];
        }
        // Output the current cumulative sum after each query.
        emitOutput(cumulativeSum);
    }
};

// Execute the main solution logic.
executeProblemSolution();