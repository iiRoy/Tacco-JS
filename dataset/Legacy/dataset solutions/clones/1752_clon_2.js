"use strict";

// This module provides utilities for reading input from stdin.
const makeReader = () => {
    // Read all input from standard input, decode as UTF-8, trim whitespace, and split into lines.
    const dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Create an object to manage input line access.
    const readerInstance = {
        "lineStorage": dataLines, // Stores all input lines.
        "currentPosition": 0,     // Current index for reading.
        "totalLines": dataLines.length, // Total number of lines available.

        // Method to check if there are more lines to read.
        "hasMore": function() {
            return this.currentPosition < this.totalLines;
        },

        // Method to retrieve the next line. Throws an error if no more lines.
        "retrieveNext": function() {
            if (!this.hasMore()) {
                throw "ArrayIndexOutOfBoundsException"; // Indicate out-of-bounds access.
            } else {
                // Return the current line and increment the position.
                return this.lineStorage[this.currentPosition++];
            }
        }
    };
    return readerInstance; // Return the configured reader object.
};

// Initialize the global input reader.
const inputReader = makeReader();

// Helper function to fetch the next line as a string.
const fetchNextLine = () => inputReader.retrieveNext();

// Helper function to fetch the next line and parse it as an integer.
const fetchNextInteger = () => parseInt(inputReader.retrieveNext());

// Helper function to fetch the next line and split it into an array of strings.
const fetchStringArray = () => inputReader.retrieveNext().split(" ");

// Helper function to fetch the next line, split it, and parse elements as integers.
const fetchIntegerArray = () => inputReader.retrieveNext().split(" ").map(el => parseInt(el));

// Helper function to fetch the next line and split it into an array of characters.
const fetchCharacterArray = () => inputReader.retrieveNext().split("");

// Helper function to check if there are more lines available.
const checkMoreLines = () => inputReader.hasMore();

// Main program logic encapsulated in a function.
const executeProgram = () => {
    // Read the first integer, representing N.
    const countN = fetchNextInteger();
    // Read the array of initial numbers.
    const initialNumbers = fetchIntegerArray();

    // Create a frequency map for the initial numbers.
    let frequencyMap = {};
    for (let currentElement of initialNumbers) {
        if (!frequencyMap[currentElement]) {
            frequencyMap[currentElement] = 1; // Initialize count if not present.
        } else {
            frequencyMap[currentElement]++;   // Increment count if already present.
        }
    }

    // Read the number of queries, Q.
    const queryCount = fetchNextInteger();
    // Arrays to store 'from' and 'to' values for queries.
    let fromValues = [];
    let toValues = [];

    // Read all query pairs (b, c) until no more input.
    while (checkMoreLines()) {
        let [sourceVal, targetVal] = fetchIntegerArray(); // Destructure the pair.
        fromValues.push(sourceVal);
        toValues.push(targetVal);
    }

    // Calculate the initial total sum based on the frequency map.
    let totalSum = 0;
    for (let mapEntryKey of Object.keys(frequencyMap)) {
        // Ensure key is treated as a number for multiplication.
        totalSum = totalSum + frequencyMap[mapEntryKey] * parseInt(mapEntryKey);
    }

    // Process each query.
    for (let loopIndex = 0; loopIndex < queryCount; loopIndex++) {
        let oldValue = fromValues[loopIndex]; // The number to be replaced.
        let newValue = toValues[loopIndex];   // The number it's replaced with.

        // Check if the 'oldValue' exists in the frequency map.
        if (frequencyMap[oldValue]) {
            // Case 1: Both oldValue and newValue exist in the map.
            if (frequencyMap[newValue]) {
                // Update sum: subtract old value's contribution, add new value's contribution.
                totalSum = totalSum - frequencyMap[oldValue] * oldValue + frequencyMap[oldValue] * newValue;
                // Transfer counts from oldValue to newValue.
                frequencyMap[newValue] = frequencyMap[newValue] + frequencyMap[oldValue];
                // Set oldValue's count to zero (effectively removing it).
                frequencyMap[oldValue] = 0;
            }
            // Case 2: oldValue exists, but newValue does not.
            else {
                // Update sum: subtract old value's contribution, add new value's contribution.
                totalSum = totalSum - frequencyMap[oldValue] * oldValue + frequencyMap[oldValue] * newValue;
                // Assign oldValue's count to newValue.
                frequencyMap[newValue] = frequencyMap[oldValue];
                // Set oldValue's count to zero.
                frequencyMap[oldValue] = 0;
            }
        }
        // Output the current total sum after each query.
        console.log(totalSum);
    }
};

// Execute the main program.
executeProgram();
