"use strict";

// Main processing function for the input data
function ProcessInput(rawData) {
    // Initialize a data parser utility
    let dataParser = new DataProcessor(rawData);

    // Read the number of elements and the modulo value
    let countElements = dataParser.retrieveInteger();
    let moduloValue = dataParser.retrieveInteger();

    // Read the array of integer values
    let elementValues = dataParser.retrieveIntegerArray(countElements);

    // Create a map to store counts of prefix sum remainders
    let remainderCounts = {};

    // Initialize an array to store prefix sums modulo M
    // The size is N + 1 to include the initial zero sum
    let prefixSumsModM = new Array(countElements + 1);
    prefixSumsModM[0] = 0; // The sum before any elements is 0

    // Calculate prefix sums modulo M
    for (let idx = 0; idx < countElements; idx++) {
        prefixSumsModM[idx + 1] = (prefixSumsModM[idx] + elementValues[idx]) % moduloValue;
    }

    // Initialize the total count of pairs
    let resultCount = 0;

    // Iterate through the prefix sums to find pairs
    for (let currentIdx = 0; currentIdx < prefixSumsModM.length; currentIdx++) {
        // Get the current count of this remainder from the map, default to 0 if not present
        let currentCount = remainderCounts[prefixSumsModM[currentIdx]] || 0;
        
        // Add this count to the total result
        resultCount += currentCount;
        
        // Increment the count for the current remainder in the map
        remainderCounts[prefixSumsModM[currentIdx]] = currentCount + 1;
    }

    // Output the final calculated result
    console.log(resultCount);
}

// Utility class for parsing input data
class DataProcessor {
    // Constructor takes the raw input string
    constructor (sourceData) {
        this.currentIndex = 0; // Tracks the current position in the parsed tokens
        // Split the input string by newlines or spaces into an array of tokens
        this.parsedTokens = sourceData.split(/\n|\s/);
    }

    // Retrieves the next token as an integer
    retrieveInteger() {
        // Convert the token to a number using unary plus operator
        return this.parsedTokens[this.currentIndex++] - 0;
    }

    // Retrieves an array of N integers
    retrieveIntegerArray(arraySize) {
        let integerCollection = new Array(arraySize);
        for (let arrIndex = 0; arrIndex < arraySize; arrIndex++) {
            integerCollection[arrIndex] = this.retrieveInteger();
        }
        return integerCollection;
    }

    // Retrieves the next token as a string
    fetchString() {
        return this.parsedTokens[this.currentIndex++];
    }

    // Retrieves an array of N strings
    fetchStringArray(size) {
        let stringCollection = new Array(size);
        for (let strIndex = 0; strIndex < size; strIndex++) {
            stringCollection[strIndex] = this.fetchString();
        }
        return stringCollection;
    }
}

// Entry point for execution, checks if running in a Node.js-like environment
if (typeof window == "undefined") {
    // Read input from standard input and pass it to the main processing function
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
