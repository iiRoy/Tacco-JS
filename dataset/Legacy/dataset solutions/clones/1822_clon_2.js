"use strict"; // Enforce strict mode for cleaner code.

/**
 * Processes the raw input data to calculate a specific range sum.
 * @param {string} rawData - The raw string input from stdin.
 */
function processInput(rawData) {
    // Trim leading/trailing whitespace and split the input into an array of lines.
    const parsedLines = rawData.trim().split("\n");

    // The first line contains the total number of elements.
    const countElements = Number(parsedLines.shift());

    // Map the remaining lines to extract the first number from each line.
    const firstValues = parsedLines.map(itemStr => Number(itemStr.split(" ")[0]));

    // Map the remaining lines to extract the second number from each line.
    const secondValues = parsedLines.map(itemStr => Number(itemStr.split(" ")[1]));

    let lowerBound, upperBound, resultRange; // Declare variables for calculation.

    // Check if the total number of elements is odd or even.
    if (countElements % 2) {
        // Case for an odd number of elements.
        // Calculate the middle index.
        const idxOne = parseInt((countElements + 1) / 2) - 1;

        // Get the corresponding values from the arrays.
        lowerBound = firstValues[idxOne];
        upperBound = secondValues[idxOne];

        // Calculate the range sum for odd N.
        resultRange = upperBound - lowerBound + 1;
    } else {
        // Case for an even number of elements.
        // Calculate the two middle indices.
        const idxOne = parseInt(countElements / 2) - 1;
        const idxTwo = parseInt(countElements / 2 + 1) - 1;

        // Calculate the average of the two middle values for A and B.
        lowerBound = (firstValues[idxOne] + firstValues[idxTwo]) / 2;
        upperBound = (secondValues[idxOne] + secondValues[idxTwo]) / 2;

        // Calculate the range sum for even N.
        resultRange = (upperBound - lowerBound) * 2 + 1;
    }

    // Output the final calculated range.
    console.log(resultRange);
}

// Read input from standard input and pass it to the processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
