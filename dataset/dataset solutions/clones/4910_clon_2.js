'use strict';

/**
 * This function processes a given string input to perform a specific calculation.
 * It expects the input to contain two space-separated numbers on the first line.
 *
 * @param {string} rawInputContent - The complete string content read from a source, e.g., standard input.
 */
const processInputContent = (rawInputContent) => {
    // First, clean up the input string by trimming whitespace and splitting it into individual lines.
    const dataLines = rawInputContent.trim().split("\n");

    // Extract the first line, which contains the two numeric values.
    const firstLineParts = dataLines[0].split(' ');

    // The first number (let's call it 'countIterations') dictates how many times a loop will run.
    let countIterations = firstLineParts[0];
    // The second number (let's call it 'initialValue') serves as the base for our calculation.
    let initialValue = firstLineParts[1];

    // Initialize our running total with the 'initialValue'.
    let finalComputedResult = initialValue;

    // Begin a loop that iterates 'countIterations - 1' times.
    // The loop starts from 1 because the initial value is already set.
    for (let currentIteration = 1; currentIteration < countIterations; currentIteration++) {
        // In each iteration, update the 'finalComputedResult' by multiplying it with ('initialValue' - 1).
        finalComputedResult = finalComputedResult * (initialValue - 1);
    }

    // Display the final calculated result to the standard output.
    console.log(finalComputedResult);
};

// Execute the main processing function by reading data from standard input.
// The 'fs' module is used to synchronously read the file content from '/dev/stdin' as UTF-8.
processInputContent(require('fs').readFileSync('/dev/stdin', 'utf8'));
