"use strict";

// This function serves as the primary entry point for processing the input data.
const processInput = (inputString) => {
    // First, clean up the input string by removing leading/trailing whitespace,
    // then split it into an array of lines based on newline characters.
    let processedLines = inputString.trim().split("\n");

    // The first line contains the number of elements, parsed as an integer.
    const countElements = parseInt(processedLines[0], 10); // Explicitly specify radix 10

    // The second line contains space-separated numbers, which are then
    // split into an array of strings and mapped to integers.
    const dataArray = processedLines[1].split(" ").map(valStr => parseInt(valStr, 10));

    // Initialize an empty array to store calculated differences.
    let diffsList = [];

    // Iterate over the indices of the dataArray.
    // For each element, calculate a specific difference and add it to the diffsList.
    for (let idx in dataArray) {
        // Calculate the difference: current array element minus (its index + 1).
        // The index is converted to an integer for arithmetic operation.
        let currentDiff = dataArray[idx] - (parseInt(idx, 10) + 1);

        // Add the computed difference to our list.
        diffsList.push(currentDiff);
    }

    // Create a Set from the list of differences to automatically remove duplicate values.
    let uniqueDiffs = new Set(diffsList);

    // Convert the Set back to an array, then perform a series of operations:
    // 1. Map each unique difference to its absolute value.
    // 2. Reduce the array of absolute values to a single sum.
    // Finally, print the resulting sum to the console.
    console.log(
        [...uniqueDiffs]
            .map(val => Math.abs(val)) // Transform each unique difference to its positive magnitude.
            .reduce((accumulator, currentValue) => accumulator + currentValue) // Sum all absolute values.
    );
};

// Execute the main processing function by reading input from standard input.
// The 'fs' module is used to read the file synchronously, and 'utf8' specifies the encoding.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
