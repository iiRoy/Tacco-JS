"use strict";

// This module handles input processing and the main program logic.

/**
 * Creates an input reader object to process lines from standard input.
 * @returns {object} An object with methods to read input lines.
 */
const makeInputReader = () => {
    // Read all input from stdin, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Construct the reader instance.
    const readerInstance = {
        "lineBuffer": rawData, // Stores the array of input lines.
        "currentPosition": 0,  // Tracks the current line index.
        "totalLines": rawData.length, // Total number of lines available.

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more lines are available, false otherwise.
         */
        "hasMoreLines": function() {
            return this.currentPosition < this.totalLines;
        },

        /**
         * Retrieves the next line from the input buffer.
         * Increments the internal line counter.
         * @returns {string} The next line of input.
         * @throws {string} "ArrayIndexOutOfBoundsException" if no more lines are available.
         */
        "retrieveNext": function() {
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException"; // Indicate end of input.
            } else {
                return this.lineBuffer[this.currentPosition++]; // Return current line and advance.
            }
        }
    };
    return readerInstance; // Return the configured reader.
};

// Initialize the global input data processor.
const dataProcessor = makeInputReader();

// Helper functions for convenient input retrieval.

/**
 * Fetches the next raw line of input.
 * @returns {string} The next line.
 */
const fetchNextLine = () => dataProcessor.retrieveNext();

/**
 * Fetches the next line and parses it as an integer.
 * @returns {number} The parsed integer.
 */
const fetchNextInteger = () => parseInt(dataProcessor.retrieveNext());

/**
 * Fetches the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
const fetchStringArray = () => dataProcessor.retrieveNext().split(" ");

/**
 * Fetches the next line, splits it by space, and parses each part as an integer.
 * @returns {number[]} An array of integers.
 */
const fetchIntegerArray = () => dataProcessor.retrieveNext().split(" ").map(item => parseInt(item));

/**
 * Fetches the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const fetchCharacterArray = () => dataProcessor.retrieveNext().split("");

/**
 * Checks if there are more lines available in the input.
 * @returns {boolean} True if more lines, false otherwise.
 */
const hasMoreLines = () => dataProcessor.hasMoreLines();

/**
 * Custom output function that logs arguments to the console.
 * @param {...any} outputArgs - Arguments to be logged.
 */
const printOutput = (...outputArgs) => console.log(...outputArgs);

/**
 * The main execution function of the program.
 * Reads two integers, performs a calculation, and prints the result.
 */
const executeProgram = () => {
    // Read two integers from the first line of input.
    const [firstVal, secondVal] = fetchIntegerArray();

    // Perform the specified calculation and print the result.
    // The formula is (1900 * secondVal + 100 * (firstVal - secondVal)) * 2^secondVal.
    console.log((1900 * secondVal + 100 * (firstVal - secondVal)) * Math.pow(2, secondVal));
};

// Invoke the main program function to start execution.
executeProgram();
