"use strict";

// This function initializes an object responsible for reading input lines.
const makeInputReader = () => {
    // Reads the entire standard input, decodes it as UTF-8, removes leading/trailing whitespace,
    // and then splits the content into an array of strings, one for each line.
    const rawLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // The reader object maintains the state of input consumption.
    const readerInstance = {
        "lineData": rawLines,       // Stores all the input lines.
        "currentIdx": 0,            // Tracks the index of the next line to be read.
        "maxIdx": rawLines.length,  // Stores the total number of input lines.

        // Method to check if there are more lines available to read.
        "hasMore": function () {
            return this.currentIdx < this.maxIdx;
        },

        // Method to retrieve the next line from the input.
        "getNext": function () {
            // If no more lines are available, an error is thrown.
            if (!this.hasMore()) {
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Returns the current line and increments the index for the next read.
                return this.lineData[this.currentIdx++];
            }
        }
    };
    return readerInstance;
};

// Global instance of the input reader, created once at the start.
const inputReader = makeInputReader();

// Utility functions to simplify reading different data types from the input.
const readNextLine = () => inputReader.getNext();
const readNextInt = () => parseInt(inputReader.getNext());
const readStrArray = () => inputReader.getNext().split(" ");
const readIntArray = () => inputReader.getNext().split(" ").map(itemStr => parseInt(itemStr));
const readCharArray = () => inputReader.getNext().split("");
const hasMoreLines = () => inputReader.hasMore();

// A standardized function for printing output to the console.
const printResult = (...outputVals) => console.log(...outputVals);

// The core logic of the program.
const executeSolution = () => {
    // Reads two integer values from the current input line.
    const [valA, valB] = readIntArray();

    // Initializes the answer with the absolute difference of the absolute values of valA and valB.
    let finalAnswer = Math.abs(Math.abs(valA) - Math.abs(valB));

    // Applies conditional adjustments to the final answer based on the relationship between valA and valB.
    if (valA * valB < 0) {
        // If valA and valB have opposite signs.
        finalAnswer += 1;
    } else if ((valA > 0 && valB === 0) || (valA === 0 && valB < 0)) {
        // Specific edge cases involving zero and one positive/negative value.
        finalAnswer += 1;
    } else if (valA > valB) {
        // If valA is strictly greater than valB.
        finalAnswer += 2;
    }

    // Prints the computed final answer to the console.
    printResult(finalAnswer);
};

// Invokes the main solution function to start program execution.
executeSolution();
