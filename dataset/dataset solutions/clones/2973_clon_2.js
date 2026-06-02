"use strict";

// This function processes the given input data.
const processInput = (inputData) => {
    // First, clean up the input string by removing extra whitespace
    // and then splitting it into an array of lines.
    inputData = inputData.trim().split("\n");

    // Extract the first numerical value from the first line of the input.
    // The '~~' operator is used for a quick conversion to an integer.
    const firstVal = ~~inputData[0].split(" ")[0];

    // Extract the second numerical value from the same first line.
    const secondVal = ~~inputData[0].split(" ")[1];

    // Calculate the final result based on the extracted values
    // and print it to the standard output.
    console.log((firstVal - secondVal) + 1);
};

// Read the entire content of the standard input synchronously,
// decode it as UTF-8, and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
