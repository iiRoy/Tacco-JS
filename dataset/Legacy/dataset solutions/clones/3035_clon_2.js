"use strict";

// This function processes the main input data
function ProcessInput(rawData) {
    // Initialize a data parsing utility
    let parserInstance = new DataParser(rawData);

    // Extract numerical count, the main string, and a key index
    let countElements = parserInstance.retrieveInteger();
    let inputString = parserInstance.retrieveString();
    let targetIndex = parserInstance.retrieveInteger();

    // Prepare an array for the final output and determine the character for comparison
    let resultArray = [];
    let comparisonChar = inputString.charAt(targetIndex - 1); // Adjust for 0-based indexing

    // Iterate through the input string based on the provided count
    for (let idx = 0; idx < countElements; idx++) {
        // Compare each character of the string with the comparison character
        // If they match, add the character itself; otherwise, add an asterisk
        resultArray.push(comparisonChar === inputString.charAt(idx) ? comparisonChar : "*");
    }

    // Output the joined characters of the result array to the console
    console.log(resultArray.join(''));
}

// Utility class for parsing various data types from a string
class DataParser {
    // Constructor initializes the parser with raw text
    constructor(sourceText) {
        this.currentIndex = 0; // Tracks the current position in the parsed tokens
        // Splits the input text by newlines or spaces to get individual tokens
        this.parsedTokens = sourceText.split(/\n|\s/);
    }

    // Retrieves and converts the next token to an integer
    retrieveInteger() {
        return this.parsedTokens[this.currentIndex++] - 0; // The '-0' ensures numeric conversion
    }

    // Retrieves an array of integers of a specified length
    retrieveIntegerArray(length) {
        let outputCollection = new Array(length);
        for (let loopCounter = 0; loopCounter < length; loopCounter++) {
            outputCollection[loopCounter] = this.retrieveInteger();
        }
        return outputCollection;
    }

    // Retrieves the next token as a string
    retrieveString() {
        return this.parsedTokens[this.currentIndex++];
    }

    // Retrieves an array of strings of a specified length
    retrieveStringArray(length) {
        let outputCollection = new Array(length);
        for (let loopCounter = 0; loopCounter < length; loopCounter++) {
            outputCollection[loopCounter] = this.retrieveString();
        }
        return outputCollection;
    }
}

// Entry point for execution, handles environment differences (browser vs. Node.js)
if (typeof window === "undefined") {
    // In a Node.js environment, read from standard input
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
