"use strict";

// Helper function to parse the numerical key from the raw input string content.
const extractKeyFromInput = (inputStringContent) => {
    // Remove leading/trailing whitespace and split into lines.
    const processedLines = inputStringContent.trim().split("\n");
    // Get the first line and split it by spaces.
    const firstLineParts = processedLines[0].split(" ");
    // Parse the first segment of the first line as an integer, using radix 10 for clarity.
    const numericalKey = parseInt(firstLineParts[0], 10);
    return numericalKey;
};

// Main function to process the input data and produce the required output.
const processInputData = (rawData) => {
    // Obtain the target key by calling the helper function.
    const targetKey = extractKeyFromInput(rawData);

    // Define the sequence of values. This array serves as a lookup table.
    const valueSequence = [
        1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5,
        1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15,
        2, 2, 5, 4, 1, 4, 1, 51
    ];

    // Calculate the zero-based index for accessing the valueSequence array.
    // The problem implies K is 1-based, so we subtract 1.
    const lookupIndex = targetKey - 1;

    // Retrieve the value at the calculated index and print it to the console.
    console.log(valueSequence[lookupIndex]);
};

// Read the entire content of standard input synchronously.
const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the content read from stdin.
processInputData(standardInputContent);
