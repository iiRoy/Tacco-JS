"use strict"; // Enforce strict mode for cleaner code

/**
 * Initializes an input reader utility.
 * This function sets up a mechanism to read lines from standard input,
 * providing methods to access them sequentially.
 * @returns {object} An object containing input lines and navigation methods.
 */
const initializeInputReader = () => {
    // Read all data from standard input, decode as UTF-8, trim whitespace, and split into lines.
    const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create the reader instance with internal state and utility methods.
    const readerInstance = {
        "lineBuffer": rawLines, // Stores all input lines.
        "currentPosition": 0, // Tracks the current line index.
        "totalLines": rawLines.length, // Total number of lines available.

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more lines are available, false otherwise.
         */
        "hasMoreData": function () {
            return this.currentPosition < this.totalLines;
        },

        /**
         * Retrieves the next line from the input buffer.
         * Throws an error if no more lines are available.
         * @returns {string} The next line of input.
         */
        "fetchNextLine": function () {
            if (!this.hasMoreData()) {
                throw "ArrayIndexOutOfBoundsException"; // Indicate no more elements.
            } else {
                return this.lineBuffer[this.currentPosition++]; // Return current line and advance position.
            }
        }
    };
    return readerInstance; // Return the fully configured reader.
};

// Instantiate the input reader globally.
const inputHandler = initializeInputReader();

// Helper functions to simplify input parsing.

/**
 * Retrieves the next raw line from the input.
 * @returns {string} The next line.
 */
const retrieveNext = () => inputHandler.fetchNextLine();

/**
 * Retrieves the next line and parses it as an integer.
 * @returns {number} The next line parsed as an integer.
 */
const retrieveNextInteger = () => parseInt(inputHandler.fetchNextLine());

/**
 * Retrieves the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
const retrieveNextStringArray = () => inputHandler.fetchNextLine().split(" ");

/**
 * Retrieves the next line, splits it by space, and parses each part as an integer.
 * @returns {number[]} An array of integers.
 */
const retrieveNextIntegerArray = () => inputHandler.fetchNextLine().split(" ").map(element => parseInt(element));

/**
 * Retrieves the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const retrieveNextCharacterArray = () => inputHandler.fetchNextLine().split("");

/**
 * Checks if there is more data available in the input stream.
 * @returns {boolean} True if more data exists, false otherwise.
 */
const checkMoreData = () => inputHandler.hasMoreData();

/**
 * A utility function for logging output to the console.
 * Behaves identically to console.log.
 * @param {...any} args - Arguments to be logged.
 */
const outputResult = (...args) => console.log(...args);

/**
 * The main processing logic of the application.
 * This function encapsulates the core algorithm.
 */
const ProcessData = () => {
    // Read the initial count of items.
    let itemCount = retrieveNextInteger();

    // Initialize an array 'paddingValues' of size 'itemCount' with zeros.
    // Note: In this specific algorithm, 'paddingValues' remains all zeros and doesn't affect the final 'totalAdjustment'.
    let paddingValues = new Array(itemCount).fill(0);

    // Initialize two arrays to store pairs of values.
    let firstValues = [];
    let secondValues = [];

    // Read pairs of integers until no more input lines are available.
    while (checkMoreData()) {
        let currentPair = retrieveNextIntegerArray(); // Get the current pair [val1, val2].
        firstValues.push(currentPair[0]); // Add the first value to 'firstValues'.
        secondValues.push(currentPair[1]); // Add the second value to 'secondValues'.
    }

    // Initialize a counter for total adjustments.
    let totalAdjustment = 0;

    // Iterate through the items in reverse order.
    for (let loopIndex = itemCount - 1; loopIndex >= 0; loopIndex--) {
        // Calculate a temporary sum by adding the current 'firstValue' and 'totalAdjustment'.
        let currentSum = firstValues[loopIndex] + totalAdjustment;

        // Check if the current sum is perfectly divisible by the corresponding 'secondValue'.
        if (currentSum % secondValues[loopIndex] === 0) {
            // If divisible, no adjustment is needed for this item; continue to the next.
            continue;
        } else if (currentSum < secondValues[loopIndex]) {
            // If the current sum is less than 'secondValue',
            // add the difference needed to reach 'secondValue' to 'totalAdjustment'.
            totalAdjustment += secondValues[loopIndex] - currentSum;
        } else {
            // If the current sum is greater than 'secondValue' but not perfectly divisible,
            // add the difference needed to reach the next multiple of 'secondValue' to 'totalAdjustment'.
            totalAdjustment += secondValues[loopIndex] - (currentSum % secondValues[loopIndex]);
        }

        // This line adds 'paddingValues[loopIndex]' (which is always 0) to 'currentSum'.
        // 'currentSum' is a local variable and this operation does not affect 'totalAdjustment' or 'finalResult'.
        currentSum += paddingValues[loopIndex];
    }

    // Calculate the sum of all elements in 'paddingValues'.
    // Since 'paddingValues' is initialized with zeros and never modified, 'finalResult' will always be 0.
    let finalResult = paddingValues.reduce((accumulator, currentValue) => accumulator + currentValue);

    // Output the final calculated result.
    console.log(finalResult);
};

// Execute the main processing function.
ProcessData();
