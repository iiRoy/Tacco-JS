"use strict"; // Enable strict mode for better code quality and error checking.

// This utility function constructs and returns an object designed for sequential input processing.
const makeReader = () => {
    // Acquire input data from standard input, decode it as UTF-8,
    // remove any leading/trailing whitespace, and then segment it into an array of individual lines.
    const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // The core input processing object, encapsulating the buffer and navigation logic.
    const inputProcessor = {
        "lineBuffer": rawLines, // Stores the complete set of input lines.
        "currentPos": 0,        // Pointer to the next line awaiting retrieval.
        "totalLines": rawLines.length, // The total number of lines available for processing.

        // Verifies if there are additional lines available in the buffer to be read.
        "moreAvailable": function() {
            return this.currentPos < this.totalLines;
        },

        // Retrieves the subsequent line from the buffer and increments the line pointer.
        "fetchNext": function() {
            if (!this.moreAvailable()) {
                throw "EndOfInputException: No more data streams can be accessed."; // Custom exception message.
            }
            return this.lineBuffer[this.currentPos++];
        }
    };
    return inputProcessor;
};

// Initialize the primary input stream handler for the application.
const streamHandler = makeReader();

// Provides the next raw line of input as a string.
const getLine = () => streamHandler.fetchNext();

// Parses the next input line and returns it as an integer, using radix 10.
const getInteger = () => parseInt(streamHandler.fetchNext(), 10);

// Splits the next input line by spaces and returns an array of strings.
const getStringArray = () => streamHandler.fetchNext().split(" ");

// Splits the next input line by spaces and maps each segment to an integer, returning an array of numbers.
const getIntegerArray = () =>
  streamHandler.fetchNext().split(" ").map(item => parseInt(item, 10));

// Splits the next input line into an array of individual characters.
const getCharacterArray = () => streamHandler.fetchNext().split("");

// Checks if the input stream has further lines to process.
const hasMoreInput = () => streamHandler.moreAvailable();

// A generic function to log multiple arguments to the console.
const displayOutput = (...itemsToLog) => console.log(...itemsToLog);

// The primary function containing the application's core computational logic.
const solveProblem = () => {
    // Destructure two integer values from the input.
    const [operand1, operand2] = getIntegerArray();

    // Compute an initial result based on the absolute difference of absolute values.
    let computedValue = Math.abs(Math.abs(operand1) - Math.abs(operand2));

    // Apply conditional adjustments to the computed value based on operand properties.
    if (operand1 * operand2 < 0) { // If operands have opposing signs.
        computedValue += 1;
    } else if ((operand1 > 0 && operand2 === 0) || (operand1 === 0 && operand2 < 0)) {
        // Special conditions: positive first operand with zero second, or zero first operand with negative second.
        computedValue += 1;
    } else if (operand1 < operand2) { // If the first operand is strictly less than the second.
        computedValue += 2;
    }

    // Print the final calculated result to the standard output.
    console.log(computedValue);
};

// Initiate the execution of the problem-solving routine.
solveProblem();