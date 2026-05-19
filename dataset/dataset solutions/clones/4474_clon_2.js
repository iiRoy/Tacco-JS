'use strict';

// This function serves as the primary entry point for processing the input data.
const processInput = (rawData) => {
    // The raw input string is split into an array of lines based on newline characters.
    let lines = rawData.split('\n');

    // From the first line, extract the total number of elements (N) and the count of elements to sum (K).
    // N is parsed from the first part of the first line.
    const numElements = parseInt(lines[0].split(' ')[0]);
    // K is parsed from the second part of the first line.
    const numToTake = parseInt(lines[0].split(' ')[1]);

    // Process the second line of input:
    // 1. Split the string by spaces to get an array of string representations of numbers.
    // 2. Use `map` to convert each string representation into an actual integer.
    // 3. Sort the resulting array of numbers in descending order (largest to smallest).
    const sortedLengths = lines[1].split(' ').map(val => parseInt(val)).sort((first, second) => second - first);

    // Initialize a variable to store the cumulative sum of the largest K elements.
    let totalValue = 0;

    // Iterate through the first 'numToTake' elements of the 'sortedLengths' array.
    for (let idx = 0; idx < numToTake; idx++) {
        // Add the current element to the running total.
        totalValue += sortedLengths[idx];
    }

    // Print the final calculated sum to the console.
    console.log(totalValue);
};

// Read the entire content of standard input as a UTF-8 string and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
