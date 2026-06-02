"use strict"; // Enforce strict parsing and error handling

/**
 * Creates an object for reading input lines from stdin.
 * This utility reads all lines at once and provides methods for sequential access.
 * @returns {object} An input reader utility instance.
 */
const makeInputReader = () => {
    // Read all input from standard input, decode as UTF-8, trim leading/trailing whitespace, and split into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Construct the reader utility object with its internal state and methods.
    const readerInstance = {
        "dataLines": rawData, // Stores the array of input lines.
        "currentLineIdx": 0,  // Tracks the index of the next line to be read.
        "totalLines": rawData.length, // Stores the total number of lines available.

        /**
         * Checks if there are more lines available to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        "hasMore": function() {
            return this.currentLineIdx < this.totalLines;
        },

        /**
         * Retrieves the next line from the input.
         * Throws an error if no more lines are available.
         * @returns {string} The next line of input.
         * @throws {string} "ArrayIndexOutOfBoundsException" if attempting to read past the end of input.
         */
        "fetchNext": function() {
            if (!this.hasMore()) {
                // If the current index is beyond the total number of lines, throw an error.
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the line at the current index and then increment the index for the next call.
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance; // Return the fully configured reader object.
};

// Initialize the global input reader instance by calling the factory function.
const inputReader = makeInputReader();

// Helper function to retrieve the next raw line of input.
const getNextLine = () => inputReader.fetchNext();

// Helper function to retrieve the next line and parse it as an integer.
const getNextInt = () => parseInt(inputReader.fetchNext());

// Helper function to retrieve the next line and split it into an array of strings by space.
const getNextStringArray = () => inputReader.fetchNext().split(" ");

// Helper function to retrieve the next line, split it by space, and map each part to an integer.
const getNextIntArray = () => inputReader.fetchNext().split(" ").map(element => parseInt(element));

// Helper function to retrieve the next line and split it into an array of individual characters.
const getNextCharArr = () => inputReader.fetchNext().split("");

// Helper function to check if there are any more lines remaining in the input.
const checkHasNext = () => inputReader.hasMore();

// Custom output function that logs arguments to the console.
const outputResult = (...outputArgs) => console.log(...outputArgs);

/**
 * Main execution function for the program.
 * This function reads two integers, performs a specific calculation, and prints the result.
 */
const ExecuteProgram = () => {
    // Read two integer values from the current line of input.
    const [valA, valB] = getNextIntArray();

    // Calculate the initial result: the absolute difference between the absolute values of valA and valB.
    let finalResult = Math.abs(Math.abs(valA) - Math.abs(valB));

    // Apply conditional adjustments to the finalResult based on the signs and relative values of valA and valB.
    if (valA * valB < 0) {
        // If valA and valB have opposite signs (one positive, one negative), increment by 1.
        finalResult += 1;
    } else if ((valA > 0 && valB === 0) || (valA === 0 && valB < 0)) {
        // If valA is positive and valB is zero, OR valA is zero and valB is negative, increment by 1.
        finalResult += 1;
    } else if (valA < valB) {
        // If valA is strictly less than valB, increment by 2.
        finalResult += 2;
    }

    // Output the final calculated result to the console.
    console.log(finalResult);
};

// Invoke the main program execution function to start the process.
ExecuteProgram();
