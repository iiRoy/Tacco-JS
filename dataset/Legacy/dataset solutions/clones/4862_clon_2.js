"use strict"; // Enforce strict parsing and error handling for better code quality

/**
 * Analyzes a given input string representing a grid of words
 * to locate a specific target word and report its grid coordinates.
 *
 * @param {string} rawInputData - The complete input string, typically read from standard input.
 */
const processGridData = (rawInputData) => {
  // Clean up the input: remove leading/trailing whitespace and split into an array of lines.
  const inputLineArray = rawInputData.trim().split("\n");

  // The first line contains the grid's dimensions (height and width).
  // Split this line by space to get the individual dimension values.
  const dimensionStrings = inputLineArray[0].split(" ");
  const gridRows = parseInt(dimensionStrings[0], 10); // Convert the string height to an integer.
  const gridColumns = parseInt(dimensionStrings[1], 10); // Convert the string width to an integer.

  // Extract the actual grid content.
  // Skip the first line (dimensions) and take 'gridRows' subsequent lines.
  // Each line is then split into an array of individual words.
  const wordGrid = inputLineArray
    .slice(1, gridRows + 1)
    .map((currentLine) => currentLine.split(" "));

  // Define an array of characters to represent column labels (A, B, C, ...).
  const columnDesignators = "ABCDEFGHIJ".split("");

  // Iterate through each row of the word grid.
  for (let rowIndex = 0; rowIndex < gridRows; rowIndex++) {
    // For each row, iterate through every column.
    for (let colIndex = 0; colIndex < gridColumns; colIndex++) {
      // Check if the word at the current grid position matches our target.
      if (wordGrid[rowIndex][colIndex] === "snuke") {
        // If the target word is found, print its coordinates.
        // The column is represented by a letter (from 'columnDesignators'),
        // and the row is 1-indexed (so we add 1 to the 0-indexed 'rowIndex').
        console.log(columnDesignators[colIndex] + (rowIndex + 1));
        // The problem implies finding all occurrences or just the first one.
        // The original code continues searching, so we maintain that behavior.
      }
    }
  }
};

// Execute the main processing function by reading input from standard input.
// 'require("fs").readFileSync' is used to synchronously read the file content.
// '/dev/stdin' is the standard path for input on many Unix-like systems.
// 'utf8' specifies the character encoding for the input.
processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
