"use strict";

// This function initializes a custom input reader for standard input.
const makeInputReader = () => {
    // Read all data from standard input, decode as UTF-8, remove leading/trailing whitespace,
    // and split the content into an array of lines.
    const rawData = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create and return an object that manages reading lines sequentially.
    const readerInstance = {
        "dataLines": rawData, // Stores the array of input lines.
        "currentLineIdx": 0x0, // Tracks the index of the next line to be read.
        "totalLines": rawData.length, // Total number of lines available in the input.

        // Method to check if there are more lines remaining to be read.
        "hasMoreLines": function () {
            return this.currentLineIdx < this.totalLines;
        },

        // Method to retrieve the next line from the input.
        "retrieveNextLine": function () {
            // If no more lines are available, throw an error.
            if (!this.hasMoreLines()) {
                throw "ArrayIndexOutOfBoundsException";
            } else {
                // Return the current line and then increment the line index.
                return this.dataLines[this.currentLineIdx++];
            }
        }
    };
    return readerInstance;
};

// Instantiate the global input reader object.
const inputReader = makeInputReader();

// Helper functions to simplify fetching various types of input.
const fetchNextLine = () => inputReader.retrieveNextLine();
const fetchNextInteger = () => parseInt(inputReader.retrieveNextLine());
const fetchStringArray = () => inputReader.retrieveNextLine().split(" ");
const fetchIntegerArray = () => inputReader.retrieveNextLine().split(" ").map(element => parseInt(element));
const fetchCharacterArray = () => inputReader.retrieveNextLine().split("");
const checkMoreLines = () => inputReader.hasMoreLines();

// A custom output function that wraps console.log for consistent logging.
const printResult = (...outputArgs) => console.log(...outputArgs);

// The primary function containing the solution logic.
const executeSolution = () => {
    // Read the initial integer 'n' which represents the number of elements.
    let numElements = fetchNextInteger();

    // Initialize an array 'p' of size 'n' with zeros. (This array is not used in the original logic, but kept for structural equivalence.)
    let placeholderArray = new Array(numElements).fill(0x0);

    // Initialize two arrays to store pairs of integers from subsequent input lines.
    let firstValues = [];
    let secondValues = [];

    // Loop to read all remaining input lines until no more are available.
    while (checkMoreLines()) {
        let currentPair = fetchIntegerArray(); // Read a line as an array of integers.
        firstValues.push(currentPair[0]); // Add the first integer of the pair to 'firstValues'.
        secondValues.push(currentPair[1]); // Add the second integer of the pair to 'secondValues'.
    }

    // Initialize a counter for the total increment needed.
    let totalIncrement = 0x0;

    // Iterate backwards through the collected arrays 'firstValues' and 'secondValues'.
    for (let loopIndex = numElements - 1; loopIndex >= 0x0; loopIndex--) {
        // Calculate a temporary sum by adding the current 'firstValue' and the accumulated 'totalIncrement'.
        let currentSum = firstValues[loopIndex] + totalIncrement;

        // Check if the 'currentSum' is perfectly divisible by the corresponding 'secondValue'.
        if (currentSum % secondValues[loopIndex] === 0x0) {
            // If divisible, no increment is needed for this step; continue to the next iteration.
            continue;
        } else if (currentSum < secondValues[loopIndex]) {
            // If 'currentSum' is less than 'secondValue', calculate the amount needed to reach 'secondValue'
            // and add it to 'totalIncrement'.
            totalIncrement += secondValues[loopIndex] - currentSum;
        } else {
            // If 'currentSum' is greater than 'secondValue' but not perfectly divisible,
            // calculate the amount needed to make it divisible by 'secondValue' and add it to 'totalIncrement'.
            totalIncrement += secondValues[loopIndex] - (currentSum % secondValues[loopIndex]);
        }
    }

    // Output the final calculated total increment.
    printResult(totalIncrement);
};

// Invoke the main solution function to start the program execution.
executeSolution();
