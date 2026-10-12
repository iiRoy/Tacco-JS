"use strict";

// This module provides utilities for processing input and solving a grid-based dynamic programming problem.

/**
 * InputProcessor class for reading tokens and lines from a string input.
 * @param {string} rawInputString - The complete input string, typically from stdin.
 * @param {function} parseFunction - An optional function to parse each token (defaults to Number).
 */
function InputProcessor(rawInputString, parseFunction) {
  this.lines = rawInputString.split("\n"); // Stores each line of the input.
  this.currentColumnIndex = 0; // Tracks the current token within a line.
  this.currentLineIndex = 0; // Tracks the current line being processed.
  this.tokenParser = parseFunction || Number; // Function to convert tokens (e.g., to Number).
}

/**
 * Retrieves the next token from the input.
 * Advances the internal pointers to the next token or line.
 * @returns {*} The parsed next token.
 */
InputProcessor.prototype.getNextToken = function() {
  let activeLine = this.lines[this.currentLineIndex];
  if (!activeLine) return; // No more lines to process.

  let lineTokens = activeLine.trim().split(" ");
  let nextTokenValue = lineTokens[this.currentColumnIndex];
  this.currentColumnIndex++;

  // If all tokens on the current line have been read, move to the next line.
  if (lineTokens.length === this.currentColumnIndex) {
    this.currentColumnIndex = 0;
    this.currentLineIndex++;
  }
  return this.tokenParser(nextTokenValue);
};

/**
 * Retrieves all tokens from the next line as an array.
 * Advances the internal pointers to the next line.
 * @returns {Array<*>} An array of parsed tokens from the next line.
 */
InputProcessor.prototype.getNextLineTokens = function() {
  let activeLine = this.lines[this.currentLineIndex];
  if (!activeLine) return; // No more lines.

  this.currentColumnIndex = 0; // Reset column index for the new line.
  this.currentLineIndex++; // Move to the next line.
  return activeLine.split(" ").map(this.tokenParser);
};

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function handles deep copying for nested structures.
 * @param {number[]} dimensionsArray - An array specifying the size of each dimension.
 * @param {*} initialFillValue - The value to initialize array elements with (defaults to 0).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(dimensionsArray, initialFillValue) {
  let currentStructure = initialFillValue || 0; // The value or structure to be replicated.

  // Iterate through dimensions in reverse order to build the array from innermost to outermost.
  for (let dimIndex = dimensionsArray.length; dimIndex > 0; dimIndex--) {
    const dimensionSize = dimensionsArray[dimIndex - 1];
    // Create an array of the current dimension size, filling it with deep copies of the current structure.
    currentStructure = Array(dimensionSize).fill().map(() => JSON.parse(JSON.stringify(currentStructure)));
  }
  return currentStructure;
}

// A large prime number used for modulo operations to prevent integer overflow.
const MODULUS_VALUE = 1000000007;

/**
 * Main function to solve the problem.
 * Reads input, performs dynamic programming calculations, and prints the result.
 * @param {string} problemInput - The raw input string for the problem.
 */
function solveProblem(problemInput) {
  let inputHandler = new InputProcessor(problemInput);

  // Read grid dimensions and target column from input.
  let gridHeight = inputHandler.getNextToken();
  let gridWidth = inputHandler.getNextToken();
  let targetColumn = inputHandler.getNextToken();

  // Predefined sequence of weights, resembling Fibonacci numbers.
  // These are likely used for calculating combinations or path weights.
  const combinationWeights = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

  // Initialize a 2D array for dynamic programming.
  // The table will store the number of ways to reach a cell.
  let dynamicProgrammingTable = createMultiDimArray([gridHeight, gridWidth], 0);

  // Set initial conditions for the first row (row 0).
  // These values represent the ways to reach cells in the first row.
  dynamicProgrammingTable[0][0] = combinationWeights[gridWidth - 1];
  dynamicProgrammingTable[0][1] = combinationWeights[gridWidth - 2];

  // Iterate through the grid rows starting from the second row (index 1).
  for (let currentRow = 1; currentRow < gridHeight; currentRow++) {
    // Iterate through each column in the current row.
    for (let currentColumn = 0; currentColumn < gridWidth; currentColumn++) {

      // Calculate paths from the cell directly above (same column).
      // The weight is a product of two combination weights based on remaining width and current column.
      dynamicProgrammingTable[currentRow][currentColumn] += dynamicProgrammingTable[currentRow - 1][currentColumn] * (combinationWeights[gridWidth - currentColumn - 1] * combinationWeights[currentColumn]);

      // If a cell to the left exists in the previous row, add paths from it.
      if (currentColumn - 1 >= 0) {
        dynamicProgrammingTable[currentRow][currentColumn] += dynamicProgrammingTable[currentRow - 1][currentColumn - 1] * (combinationWeights[gridWidth - currentColumn - 1] * combinationWeights[currentColumn - 1]);
      }

      // If a cell to the right exists in the previous row, add paths from it.
      if (currentColumn + 1 <= gridWidth - 1) {
        dynamicProgrammingTable[currentRow][currentColumn] += dynamicProgrammingTable[currentRow - 1][currentColumn + 1] * (combinationWeights[gridWidth - currentColumn - 2] * combinationWeights[currentColumn]);
      }

      // Apply modulo operation to keep the result within bounds.
      dynamicProgrammingTable[currentRow][currentColumn] %= MODULUS_VALUE;
    }
  }

  // The final answer is the value in the last row and the target column (adjusted for 0-indexing).
  console.log(dynamicProgrammingTable[gridHeight - 1][targetColumn - 1]);
}

// Read input from standard input and pass it to the main solver function.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
