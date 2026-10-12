'use strict';

// This class is designed to parse input data, typically from standard input, line by line.
function InputParser(inputString) {
    // Split the entire input string into an array of individual lines.
    let lineArray = inputString.split('\n');

    // If the last line is empty (common with `\n` at EOF), remove it.
    if (lineArray[lineArray.length - 1] === '') {
        lineArray.pop();
    }

    // Store the processed lines and initialize an index to keep track of the current line being read.
    this.lineArray = lineArray;
    this.currentLineIndex = 0;
}

// Add methods to the InputParser's prototype for various input reading operations.

// Reads the current line, splits it by spaces, and converts each part to an integer.
InputParser.prototype.readInts = function() {
    // Access the current line, then increment the index for the next read.
    return this.lineArray[this.currentLineIndex++].split(' ').map(valStr => +valStr);
};

// Reads all remaining lines from the current position to the end, converting each to an integer.
InputParser.prototype.readAllInts = function() {
    const initialIndex = this.currentLineIndex;
    // Set the current index to the end of the array, marking all lines as read.
    this.currentLineIndex = this.lineArray.length;
    // Extract the remaining lines and convert them to numbers.
    return this.lineArray.slice(initialIndex).map(valStr => +valStr);
};

// Reads all remaining lines as strings from the current position to the end.
InputParser.prototype.readAllStrings = function() {
    const initialIndex = this.currentLineIndex;
    // Set the current index to the end of the array.
    this.currentLineIndex = this.lineArray.length;
    // Return the slice containing the remaining lines.
    return this.lineArray.slice(initialIndex);
};

// Reads a specified number of lines as strings, starting from the current position.
InputParser.prototype.readNStrings = function(count) {
    const initialIndex = this.currentLineIndex;
    // Advance the current line index by the specified count.
    this.currentLineIndex += count;
    // Return a slice of the lines read.
    return this.lineArray.slice(initialIndex, initialIndex + count);
};

// Create an instance of the InputParser, reading data from standard input.
const inputReader = new InputParser(require("fs").readFileSync("/dev/stdin", "utf8"));

// Use an Immediately Invoked Function Expression (IIFE) to encapsulate the main program logic.
(() => {

    // Read the first line which contains two integers: arraySize (N) and targetCount (K).
    const numAndK = inputReader.readInts();
    const arraySize = numAndK[0]; // N
    const targetCount = numAndK[1]; // K

    // Read the second line which contains the array 'a' of integers.
    const dataArray = inputReader.readInts();

    // This array will store all possible subarray sums.
    const sumResults = [];

    // Iterate through all possible starting points for subarrays.
    for (let outerIdx = 0; outerIdx < arraySize; outerIdx++) {
        let currentSum = 0; // Initialize sum for the subarray starting at 'outerIdx'.
        // Iterate through all possible ending points for subarrays, starting from 'outerIdx'.
        for (let innerIdx = outerIdx; innerIdx < arraySize; innerIdx++) {
            currentSum += dataArray[innerIdx]; // Add the current element to the running sum.
            sumResults.push(currentSum); // Store this subarray sum.
        }
    }

    // Sort the calculated sums in descending order.
    sumResults.sort((valA, valB) => valB - valA);

    let finalResult = 0; // Initialize the variable to store the maximum possible XOR sum.

    // Iterate from the 41st bit down to the 0th bit (most significant to least significant).
    // This greedy approach tries to set higher bits first to maximize the result.
    for (let bitPosition = 41; bitPosition >= 0; bitPosition--) {
        // Calculate the decimal value of the current bit (e.g., 2^41, 2^40, ..., 2^0).
        let bitValue = Math.pow(2, bitPosition);

        // Determine how many of the subarray sums 'elementValue' satisfy a specific bitwise condition.
        // The condition `(elementValue & (finalResult + bitValue)) === (finalResult + bitValue)`
        // checks if all bits that are set in `(finalResult + bitValue)` are also set in `elementValue`.
        // This effectively means `elementValue` must be "compatible" with `finalResult` having `bitValue` set.
        let matchingCount = sumResults.filter(elementValue => (elementValue & (finalResult + bitValue)) === (finalResult + bitValue)).length;

        // If there are at least 'targetCount' subarray sums that satisfy this condition,
        // it means we can potentially include this 'bitValue' in our 'finalResult'.
        if (matchingCount >= targetCount) {
            finalResult += bitValue; // Add the current bit's value to the final result.
        }
    }

    // Print the final calculated maximum XOR sum to standard output.
    console.log(finalResult);

})(); // End of the main program IIFE.
