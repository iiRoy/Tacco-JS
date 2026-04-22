"use strict"; // Enable strict mode for better error handling and cleaner code.

/**
 * Initializes a data source for reading input.
 * @returns {object} An object providing methods to navigate through input data.
 */
const buildSource = () => {
  // Read all lines from standard input, trim whitespace, and split by newline.
  const dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

  const dataStream = {
    segmentList: dataLines, // The array of input lines.
    currentPosition: 0, // Current index in the segmentList.
    totalSegments: dataLines.length, // Total number of available segments.

    /**
     * Checks if there are more segments to read.
     * @returns {boolean} True if more segments exist, false otherwise.
     */
    hasRemaining: function() {
      return this.currentPosition < this.totalSegments;
    },

    /**
     * Retrieves the next segment from the input stream.
     * @returns {string} The next segment.
     * @throws {string} "EndOfStreamReachedError" if no more segments are available.
     */
    retrieveNext: function() {
      if (!this.hasRemaining()) {
        throw "EndOfStreamReachedError";
      } else {
        return this.segmentList[this.currentPosition++];
      }
    }
  };
  return dataStream;
};

// Create a singleton instance of the input source.
const sourceInstance = buildSource();

/**
 * Fetches the next raw string segment.
 * @returns {string} The next string.
 */
const fetchSegment = () => sourceInstance.retrieveNext();

/**
 * Fetches the next segment and parses it as an integer.
 * @returns {number} The next integer.
 */
const fetchInteger = () => parseInt(sourceInstance.retrieveNext());

/**
 * Fetches the next segment and splits it into a string array by space.
 * @returns {string[]} An array of strings.
 */
const fetchStringArray = () => sourceInstance.retrieveNext().split(" ");

/**
 * Fetches the next segment, splits it by space, and maps elements to integers.
 * @returns {number[]} An array of integers.
 */
const fetchIntegerArray = () => sourceInstance.retrieveNext().split(" ").map(itemElement => parseInt(itemElement));

/**
 * Fetches the next segment and splits it into a character array.
 * @returns {string[]} An array of characters.
 */
const fetchCharacterArray = () => sourceInstance.retrieveNext().split("");

/**
 * Checks if there are more segments available in the source instance.
 * @returns {boolean} True if more segments exist, false otherwise.
 */
const checkRemaining = () => sourceInstance.hasRemaining();

/**
 * Prints values to the console.
 * @param {...any} outputValues - Values to be printed.
 */
const displayOutput = (...outputValues) => console.log(...outputValues);

/**
 * Main program execution logic.
 */
const executeProgram = () => {
    // Read two integers from the input.
    const [firstVal, secondVal] = fetchIntegerArray();

    // Calculate initial absolute difference between absolute values.
    let finalResult = Math.abs(Math.abs(firstVal) - Math.abs(secondVal));

    // Apply conditional adjustments based on the values.
    if (firstVal * secondVal < 0) {
        finalResult += 1;
    }
    else if ((firstVal > 0 && secondVal === 0) || (firstVal === 0 && secondVal < 0)) {
        finalResult += 1;
    }
    else if (firstVal > secondVal) {
        finalResult += 2;
    }

    // Display the computed final result.
    console.log(finalResult);
};

// Initiate the program.
executeProgram();