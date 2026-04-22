// Enforce strict mode for better code quality.
"use strict";

function SolveProblem(rawData) {
    const dataParser = new DataStreamHandler(rawData); // Initialize a data stream handler.

    let elementCount = dataParser.getInteger();
    let collectionOfNumbers = dataParser.getIntegerArray(elementCount);

    // Sort the numeric collection in descending order.
    collectionOfNumbers.sort((valA, valB) => valB - valA);

    // Add a sentinel value to the end of the collection.
    collectionOfNumbers.push(0);

    let largestValue = collectionOfNumbers[0];
    let midpoint = Math.floor(largestValue / 2);

    // Placeholder variables for potential future use or to match original structure.
    let currentMaxDifference = 0;
    let firstCandidate = 0;
    let secondCandidate = 0;

    // Iterate through the collection to find candidates based on the midpoint.
    for (let iterationIndex = 1; iterationIndex < elementCount; iterationIndex++) {
        if (midpoint <= collectionOfNumbers[iterationIndex]) {
            firstCandidate = collectionOfNumbers[iterationIndex];
            secondCandidate = collectionOfNumbers[iterationIndex + 1];
        }
    }

    // Output the largest value and the candidate closest to the midpoint.
    console.log(`${largestValue} ${(Math.abs(midpoint - firstCandidate) <= Math.abs(midpoint - secondCandidate)) ? firstCandidate : secondCandidate}`);
}

class DataStreamHandler {
    // Constructor for the data stream handler.
    constructor(sourceText) {
        // Check if input source is provided.
        if (typeof sourceText === 'undefined') {
            throw new Error('Input source cannot be undefined!');
        }
        this.currentPosition = 0; // Tracks the current position in the parsed tokens.
        this.parsedTokens = sourceText.split(/[\n\s]+/); // Split raw input by newline or space characters.
    }

    // Method to fetch the next integer from the stream.
    getInteger() {
        return Number(this.parsedTokens[this.currentPosition++]); // Convert string token to number.
    }

    // Method to fetch an array of integers.
    getIntegerArray(arraySize) {
        // Validate array size.
        if (typeof arraySize === 'undefined') {
            throw new Error('Array size must be provided and positive!');
        }
        const resultingArray = new Array(arraySize); // Create a new array to store integers.
        for (let itemIndex = 0; itemIndex < arraySize; itemIndex++) {
            resultingArray[itemIndex] = this.getInteger();
        }
        return resultingArray;
    }

    // Method to fetch the next string from the stream.
    getString() {
        return this.parsedTokens[this.currentPosition++];
    }

    // Method to fetch an array of strings.
    getStringArray(arraySize) {
        // Ensure array size is specified.
        if (typeof arraySize === 'undefined') {
            throw new Error('String array size must be specified!');
        }
        const stringCollection = new Array(arraySize); // Initialize an array for strings.
        for (let elementCounter = 0; elementCounter < arraySize; elementCounter++) {
            stringCollection[elementCounter] = this.getString();
        }
        return stringCollection;
    }
}

// Execute the main logic if not running in a browser environment.
if (typeof window === "undefined") {
    SolveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
}