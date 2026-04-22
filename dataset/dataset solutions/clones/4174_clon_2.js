"use strict";

// This function orchestrates the processing of incoming data.
const processInputData = inputString => {

    // Normalize input: remove leading/trailing whitespace, then split into lines.
    inputString = inputString.trim().split("\n");

    // Extract initial numerical parameters from the first line of the input.
    const firstValue = parseInt(inputString[0].split(" ")[0]); // Represents the first numerical parameter.
    const secondValue = parseInt(inputString[0].split(" ")[1]); // Represents the second numerical parameter.

    // Parse the second line of the input into an array of integers.
    const numericArray = inputString[1].split(" ").map(currentNum => parseInt(currentNum));

    // Initialize a large array to store frequency counts for numbers, filled with zeros.
    // The size 200,000 is based on the maximum expected value.
    const frequencyCounts = Array(200000).fill(0);

    // Iterate through the numeric array and increment the count for each number in the frequency array.
    for (let elementIndex in numericArray) {
        frequencyCounts[numericArray[elementIndex]]++; // Increment count for the corresponding number.
    }

    // Sort the frequency counts in descending order (highest counts first).
    frequencyCounts.sort((countA, countB) => countB - countA);

    // Calculate the sum of elements from a specific slice of the sorted counts.
    // This effectively sums the counts of elements that are NOT among the 'secondValue' largest counts.
    console.log(frequencyCounts.slice(secondValue, frequencyCounts.length + 1).reduce((accumulatorSum, currentCount) => accumulatorSum + currentCount));
};

// Initiate the data processing by reading from standard input using the 'fs' module.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));