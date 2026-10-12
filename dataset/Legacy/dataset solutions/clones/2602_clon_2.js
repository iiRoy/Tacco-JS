"use strict";

// Function to set up a custom input reader from standard input
const makeInputReader = () => {
    // Read all data from /dev/stdin, decode as UTF-8, trim whitespace, and split into lines
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create an object to manage reading lines sequentially
    const readerInstance = {
        "dataLines": rawData, // Array of input lines
        "currentLineIdx": 0,  // Current index for reading
        "totalLines": rawData.length, // Total number of lines available

        // Method to check if there are more lines to read
        "hasMore": function() {
            return this.currentLineIdx < this.totalLines;
        },

        // Method to retrieve the next line
        "retrieveNext": function() {
            if (!this.hasMore()) {
                // If no more lines, throw an error
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the current line and increment the index
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance;
};

// Initialize the input handler
const inputHandler = makeInputReader();

// Helper function to get the next raw line
const getNextLine = () => inputHandler.retrieveNext();

// Helper function to get the next line as an integer
const getNextInt = () => parseInt(inputHandler.retrieveNext());

// Helper function to get the next line as an array of strings (space-separated)
const getNextStringArray = () => inputHandler.retrieveNext().split(" ");

// Helper function to get the next line as an array of integers (space-separated)
const getNextIntArray = () => inputHandler.retrieveNext().split(" ").map(elementStr => parseInt(elementStr));

// Helper function to get the next line as an array of characters
const getNextCharArr = () => inputHandler.retrieveNext().split("");

// Helper function to check if there are more lines available
const checkHasMore = () => inputHandler.hasMore();

// Helper function for printing output to console
const printOutput = (...outputArgs) => console.log(...outputArgs);

// Main program logic
const executeProgram = () => {
    // Read an integer from input
    let inputNumber = getNextInt();
    let resultSum = 0; // Initialize sum variable

    // Loop from 1 up to (but not including) the input number
    for (let counterVar = 1; counterVar < inputNumber; counterVar++) {
        resultSum += counterVar; // Add current counter value to sum
    }

    // Print the final calculated sum
    console.log(resultSum);
};

// Execute the main program
executeProgram();
