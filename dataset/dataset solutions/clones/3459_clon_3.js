"use strict";

// Helper class for parsing input strings
class InputParser {
  constructor(sourceString, valueParser = Number) {
    this._sourceLines = sourceString.split("\n");
    this._currentColumnIndex = 0;
    this._currentLineIndex = 0;
    this._valueParser = valueParser;
  }

  // Internal helper to get the current line content safely
  _getCurrentLineContent() {
    return this._sourceLines[this._currentLineIndex];
  }

  // Reads the next value from the input stream, advancing column and line pointers
  readNextValue() {
    const currentLine = this._getCurrentLineContent();
    if (!currentLine) {
      // If no more lines or current line is empty, return undefined
      return undefined;
    }

    const tokens = currentLine.trim().split(" ");
    const valueToken = tokens[this._currentColumnIndex];
    this._currentColumnIndex++;

    // If all tokens on the current line have been read, move to the next line
    if (tokens.length === this._currentColumnIndex) {
      this._currentColumnIndex = 0;
      this._currentLineIndex++;
    }
    return this._valueParser(valueToken);
  }

  // Reads an entire line and parses all its space-separated values as numbers
  readLineAsNumbers() {
    const currentLine = this._getCurrentLineContent();
    if (!currentLine) {
      // If no more lines or current line is empty, return undefined
      return undefined;
    }

    this._currentColumnIndex = 0; // Reset column index as we're consuming the whole line
    this._currentLineIndex++; // Move to the next line after reading this one
    return currentLine.split(" ").map(this._valueParser);
  }
}

// Function to create a multi-dimensional array initialized with a specific value
function createMultiDimensionalArray(dimensions, initialFillValue = 0) {
  let currentDimensionArray = initialFillValue; // This variable holds the array being built at each dimension level

  // Iterate from the innermost dimension outwards
  for (let i = dimensions.length - 1; i >= 0; i--) {
    const currentDimSize = dimensions[i];
    // Create an array of 'currentDimSize' elements.
    // Each element is a deep clone of 'currentDimensionArray' (which could be a primitive or another array/object).
    currentDimensionArray = Array(currentDimSize).fill(null).map(() => {
      // Deep cloning ensures that nested arrays/objects are independent
      return JSON.parse(JSON.stringify(currentDimensionArray));
    });
  }
  return currentDimensionArray;
}

// Constant for modulo operation
const MODULO_VALUE = 1000000007;

// Main function to solve the problem
function solveProblem(inputString) {
  const inputReader = new InputParser(inputString);

  const gridHeight = inputReader.readNextValue();
  const gridWidth = inputReader.readNextValue();
  const targetFinalColumn = inputReader.readNextValue(); // k in problem statement

  // This array stores precomputed counts related to connecting columns.
  // It appears to be a sequence of Fibonacci numbers (F(1)=1, F(2)=1, F(3)=2, ...).
  // fibonacciConnectionCounts[x] corresponds to F(x+1).
  // Max index needed is width-1, so if width=10, max index is 9.
  const fibonacciConnectionCounts = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];

  // Initialize the dynamic programming table (gridHeight x gridWidth) with zeros
  const dynamicProgrammingGrid = createMultiDimensionalArray([gridHeight, gridWidth], 0);

  // Base case: Initialize the first row (layer 0)
  // These values represent the initial configurations for the first layer.
  // The specific logic depends on the problem's interpretation of 'fibonacciConnectionCounts'.
  dynamicProgrammingGrid[0][0] = fibonacciConnectionCounts[gridWidth - 1];
  // Only set dp[0][1] if gridWidth allows (i.e., gridWidth > 1)
  // The original code implicitly handles this as wc[w-2] would be undefined if w=1,
  // but dp[0][1] would not be accessed in the main loop if w=1.
  if (gridWidth > 1) {
    dynamicProgrammingGrid[0][1] = fibonacciConnectionCounts[gridWidth - 2];
  }


  // Iterate through each row (layer) starting from the second row (index 1)
  for (let currentRow = 1; currentRow < gridHeight; currentRow++) {
    // Iterate through each column in the current row
    for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
      let totalWaysForCurrentCell = 0;

      // Contribution from staying in the same column (currentCol) from the previous row
      // This involves connecting 'currentCol' columns to the left and
      // (gridWidth - currentCol - 1) columns to the right.
      const waysToStayInColumn = fibonacciConnectionCounts[gridWidth - currentCol - 1] * fibonacciConnectionCounts[currentCol];
      totalWaysForCurrentCell = (totalWaysForCurrentCell + dynamicProgrammingGrid[currentRow - 1][currentCol] * waysToStayInColumn) % MODULO_VALUE;

      // Contribution from moving from the left column (currentCol - 1) to currentCol
      if (currentCol - 1 >= 0) {
        // This involves connecting (currentCol - 1) columns to the left of the previous cell
        // and (gridWidth - currentCol - 1) columns to the right of the current cell.
        const waysToMoveFromLeft = fibonacciConnectionCounts[gridWidth - currentCol - 1] * fibonacciConnectionCounts[currentCol - 1];
        totalWaysForCurrentCell = (totalWaysForCurrentCell + dynamicProgrammingGrid[currentRow - 1][currentCol - 1] * waysToMoveFromLeft) % MODULO_VALUE;
      }

      // Contribution from moving from the right column (currentCol + 1) to currentCol
      if (currentCol + 1 < gridWidth) {
        // This involves connecting 'currentCol' columns to the left of the current cell
        // and (gridWidth - (currentCol + 1) - 1) columns to the right of the previous cell (currentCol + 1).
        const waysToMoveFromRight = fibonacciConnectionCounts[gridWidth - (currentCol + 1) - 1] * fibonacciConnectionCounts[currentCol];
        totalWaysForCurrentCell = (totalWaysForCurrentCell + dynamicProgrammingGrid[currentRow - 1][currentCol + 1] * waysToMoveFromRight) % MODULO_VALUE;
      }

      // Store the calculated total ways for the current cell, ensuring it stays within the modulo
      dynamicProgrammingGrid[currentRow][currentCol] = totalWaysForCurrentCell;
    }
  }

  // The final answer is the value in the last row (gridHeight - 1) and the target column (targetFinalColumn - 1)
  console.log(dynamicProgrammingGrid[gridHeight - 1][targetFinalColumn - 1]);
}

// Read input from stdin and pass it to the solver function
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
