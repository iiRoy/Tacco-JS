'use strict'

/*
 * This module is designed to process incoming textual data,
 * extracting numerical parameters and performing a specific
 * analysis on a matrix of scores.
 */
function processData(rawData) {
    // Split the entire input string into an array of individual lines.
    const lineSegments = rawData.split('\n');

    // Parse the first line to get the initial duration value.
    const durationVal = Number.parseInt(lineSegments[0], 10);

    // The second line contains space-separated cost strings.
    let costStrings = lineSegments[1].split(' ');

    // Convert these cost strings into an array of numerical cost values.
    const costValues = costStrings.map(numStr => Number.parseInt(numStr, 10));

    // Initialize a two-dimensional array to store performance scores.
    let scoreMatrix = [];
    /*
     * Iterate through the remaining lines of input, starting from the third line.
     * Each line represents a row in our score matrix.
     */
    for (let rowIdx = 2; rowIdx < lineSegments.length; rowIdx++) {
        // Add a new empty row to the score matrix.
        scoreMatrix.push([]);
        // Split the current line into its constituent string parts.
        const currentLineParts = lineSegments[rowIdx].split(' ');
        // Iterate through each part of the current line.
        for (let colIdx = 0; colIdx < currentLineParts.length; colIdx++) {
            // Parse the string part as an integer and add it to the correct row in the score matrix.
            scoreMatrix[rowIdx - 2].push(Number.parseInt(currentLineParts[colIdx], 10));
        }
    }

    // Initialize an array to store the final computed indices.
    let resultIndices = [];

    // Loop through each row of the score matrix.
    for (let rowIdx = 0; rowIdx < scoreMatrix.length; rowIdx++) {
        // Assume the first element in the current row is the maximum initially.
        let currentMaximum = scoreMatrix[rowIdx][0];
        // Initialize the index of the maximum value found so far.
        let maxIndexFound = 0;

        // Iterate through the elements of the current row, starting from the second element.
        for (let colIdx = 1; colIdx < scoreMatrix[rowIdx].length; colIdx++) {
            // Check if the current element is greater than the current maximum.
            if (scoreMatrix[rowIdx][colIdx] > currentMaximum) {
                // If so, update the index of the maximum.
                maxIndexFound = colIdx;
                // And update the maximum value itself.
                currentMaximum = scoreMatrix[rowIdx][colIdx];
            }
        }
        // Store the 1-based index (original problem context often uses 1-based indexing) of the maximum score.
        resultIndices.push(maxIndexFound + 1);
    }

    // Output the final array of calculated indices to the console.
    console.log(resultIndices);
}

// Read the input from standard input (e.g., a file or piped data) and then process it.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));

// This second call might be for specific testing environments where 'rawData' is globally available.
// If 'rawData' is not defined globally, this call would result in an error.
processData(rawData);