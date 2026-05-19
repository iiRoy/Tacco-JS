"use strict";

// This function processes the raw input data to find a specific word within a grid.
const processInputData = (rawInput) => {
    // First, clean up the input string by trimming whitespace and splitting it into individual lines.
    let processedLines = rawInput.trim().split("\n");

    // The first line of input contains the grid dimensions (Height and Width).
    // We parse these values to determine the number of rows and columns.
    const dimensionParts = processedLines[0].split(" ");
    const rowCount = parseInt(dimensionParts[0], 10); // Total number of rows in the grid.
    const colCount = parseInt(dimensionParts[1], 10); // Total number of columns in the grid.

    // Next, we extract the actual grid content. This involves taking the lines
    // from the second line up to (and including) the line corresponding to the rowCount.
    // Each of these lines is then split into individual words to form the grid.
    const gridWords = processedLines.slice(1, rowCount + 1).map(currentLine => currentLine.split(" "));

    // We define an array of uppercase alphabet characters to be used for column labeling (A, B, C, ...).
    const alphabetChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    // Now, we iterate through each cell of the grid using nested loops.
    // The outer loop handles rows, and the inner loop handles columns.
    for (let rowIdx = 0; rowIdx < rowCount; rowIdx++) {
        for (let colIdx = 0; colIdx < colCount; colIdx++) {
            // Inside the loop, we check if the word in the current grid cell matches our target word, "snuke".
            if (gridWords[rowIdx][colIdx] === "snuke") {
                // If the word is found, we construct its coordinate string.
                // The column is represented by an alphabet character (e.g., A for 0, B for 1).
                // The row is represented by its 1-based index (e.g., 1 for row 0, 2 for row 1).
                console.log(alphabetChars[colIdx] + (parseInt(rowIdx, 10) + 1));
                return; // Once the first instance of "snuke" is found, we print its location and exit the function.
            }
        }
    }
};

// The program starts by reading the entire content of standard input.
// It uses Node.js's 'fs' module to synchronously read the file '/dev/stdin' as a UTF-8 string.
// This raw input string is then passed to our main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
