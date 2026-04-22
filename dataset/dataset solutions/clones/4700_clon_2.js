"use strict";

/* This script processes input from standard input, performs calculations, and prints the result. */

/**
 * Initializes and returns an object to access input lines sequentially.
 * @returns {object} An input data accessor object.
 */
const initiateInputReader = ( ) => {

    // Read all input from stdin, decode as UTF-8, trim whitespace, and split into an array of lines.
    const rawInputLines = require("fs") . readFileSync( "/dev/stdin" ,  "utf8" ) . trim() . split( "\n" ) ;

    // Create an accessor object with methods to navigate the input.
    const dataAccessor = {
        "lineCollection"    : rawInputLines,           // Stores the array of input lines.
        "currentLineIndex"  : 0,                       // Current position in the lineCollection.
        "totalLineCount"    : rawInputLines.length,    // Total number of lines available.

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more lines are available, false otherwise.
         */
        "hasMoreLines" : function (  ) {
            return this.currentLineIndex < this.totalLineCount;
        },

        /**
         * Retrieves the next available line.
         * Throws an error if no more lines are available.
         * @returns {string} The next line from input.
         */
        "fetchNextLine" : function ( ) {
            if ( ! this.hasMoreLines() ) {
                throw "EndOfInputReachedException"; // Custom error message for out-of-bounds access.
            } else {
                return this.lineCollection[ this.currentLineIndex++ ]; // Return current line and increment index.
            }
        }
    };
    return dataAccessor; // Provide the fully configured accessor.
};

// Global instance of our input reader.
const globalReader = initiateInputReader();

/**
 * Retrieves the next complete line as a string.
 * @returns {string} The next input line.
 */
const retrieveNextLine = () => globalReader.fetchNextLine();

/**
 * Parses the next input line as an integer.
 * @returns {number} The integer value of the next line.
 */
const parseNextInteger = () => parseInt(globalReader.fetchNextLine(), 10); // Base 10 explicitly.

/**
 * Reads the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
const readStringArray = () => globalReader.fetchNextLine().split(" ");

/**
 * Reads the next line, splits it by space, and maps each part to an integer.
 * @returns {number[]} An array of integers.
 */
const readIntegerArray = () => globalReader.fetchNextLine().split(" ").map(elementValue => parseInt(elementValue, 10));

/**
 * Reads the next line and splits it into an array of characters.
 * @returns {string[]} An array of characters.
 */
const readCharacterArray = () => globalReader.fetchNextLine().split("");

/**
 * Checks if there are additional lines available in the input stream.
 * @returns {boolean} True if more input lines exist, false otherwise.
 */
const checkMoreLines = () => globalReader.hasMoreLines();

/**
 * A utility function to output arguments to the console.
 * @param {...any} outputArguments - Arguments to be logged.
 */
const outputToConsole = (...outputArguments) => console.log(...outputArguments);


/**
 * The primary execution function for the application logic.
 */
const executePrimaryLogic = () => {
    // Read two integer parameters from the first line of input.
    const [firstParam, secondParam] = readIntegerArray();

    let solutionResult;

    // Calculate the solution based on the given condition.
    // This logic determines the maximum possible value based on firstParam and secondParam.
    if (secondParam <= 2 * firstParam) {
        solutionResult = Math.floor(secondParam / 2);
    } else {
        solutionResult = Math.floor((2 * firstParam + secondParam) / 4);
    }

    // Display the calculated result to standard output.
    outputToConsole(solutionResult);
};

// Invoke the main application logic to start execution.
executePrimaryLogic();