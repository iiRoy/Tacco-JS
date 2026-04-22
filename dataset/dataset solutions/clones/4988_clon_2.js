'use strict'; // This directive enforces stricter parsing and error handling on the code.

// A utility function designed to output a value to the standard console.
function outputResultToConsole(valueToDisplay) {
    console.log(valueToDisplay);
}

// A helper function to ascertain the maximum value from a collection of numbers.
function determineMaximum(...numericValues) {
    return Math.max(...numericValues);
}

// A helper function that rounds a floating-point number downwards to the nearest integer.
function roundDownToInteger(floatNumber) {
    return Math.floor(floatNumber);
}

// A helper function to compute the absolute difference between two given numerical values.
function calculateAbsoluteDifference(firstValue, secondValue) {
    return Math.abs(firstValue - secondValue);
}

// The primary function responsible for processing numerical input data.
function ProcessNumericalData(rawTextContent) {
    // Instantiate a new token stream reader with the provided textual content.
    let tokenReader = new InputTokenStream(rawTextContent);

    // Extract three integer values sequentially from the input stream.
    let firstNumber = tokenReader.retrieveNextInteger(),
        secondNumber = tokenReader.retrieveNextInteger(),
        thirdNumber = tokenReader.retrieveNextInteger();

    // Identify the greatest value among the three extracted numbers.
    let largestDimension = determineMaximum(firstNumber, secondNumber, thirdNumber);

    // Initialize an array to store dimensions that are not the largest.
    let remainingDimensions = [];

    // Compute two distinct portions based on the largest dimension.
    let bottomPortion = roundDownToInteger(largestDimension / 2),
        topPortion = largestDimension - bottomPortion;

    // Check if any of the initial numbers are even.
    if (firstNumber % 2 === 0 || secondNumber % 2 === 0 || thirdNumber % 2 === 0) {
        outputResultToConsole(0); // If an even number is found, output zero.
        return; // Terminate function execution immediately.
    }

    // Iterate through the initial numbers to find those strictly smaller than the largest dimension.
    [firstNumber, secondNumber, thirdNumber].forEach(currentNumericItem => {
        if (currentNumericItem < largestDimension) {
            remainingDimensions.push(currentNumericItem); // Add smaller items to the collection.
        }
    });

    // Ensure the 'remainingDimensions' array contains at least two elements.
    while (remainingDimensions.length < 2) {
        remainingDimensions.push(largestDimension); // Pad with the largest dimension if fewer than two elements exist.
    }

    // Calculate and display the final result using the absolute difference and the collected dimensions.
    outputResultToConsole(calculateAbsoluteDifference(topPortion, bottomPortion) * remainingDimensions[0] * remainingDimensions[1]);
}

// A specialized class for parsing and extracting tokens from an input string.
class InputTokenStream {
    // The constructor initializes the internal state of the token stream.
    constructor(sourceContent) {
        this.tokenArray = []; // An internal array to hold all parsed tokens.

        // If the input is a string, process it by trimming whitespace and splitting by spaces.
        if (typeof sourceContent === 'string') {
            this.tokenArray = sourceContent.trim().split(/\s+/);
        }
        this.currentTokenIndex = 0; // Keeps track of the current position in the token array.
    }

    // Determines if there are additional elements available to be read from the stream.
    hasMoreElements() {
        return this.currentTokenIndex < this.tokenArray.length;
    }

    // Retrieves the next element from the stream as a string.
    retrieveNextElement() {
        return this.hasMoreElements() ? this.tokenArray[this.currentTokenIndex++] : null;
    }

    // Retrieves the next element from the stream, attempting to parse it as an integer.
    retrieveNextInteger() {
        return this.hasMoreElements() ? parseInt(this.tokenArray[this.currentTokenIndex++], 10) : null;
    }
}

// A dedicated function to load content from the standard input file system path.
function loadStandardInputContent() {
    return require('fs').readFileSync('/dev/stdin', 'utf8');
}

// Initiate the main data processing routine by providing content from standard input.
ProcessNumericalData(loadStandardInputContent());