// This module provides utilities for parsing input data from a string source.
var DATA_PARSER = (function() {
  /**
   * Factory function to create an InputProcessor instance.
   * It takes a raw string and prepares it for sequential reading.
   * @param {string} inputString - The complete raw input string.
   * @returns {InputProcessor} A new instance of InputProcessor.
   */
  function createParser(inputString) {
    return new InputProcessor(inputString);
  }

  /**
   * InputProcessor class for handling structured input data.
   * It manages the state of reading lines and values.
   * @class
   * @param {string} rawString - The entire input content as a single string.
   */
  function InputProcessor(rawString) {
    // Internal storage for all input lines, trimmed and split by newline.
    this._sourceLines = rawString.trim().split("\n");
    // Pointer to the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads a single value from the current line.
   * Values on a line are assumed to be space-separated and are read from right to left.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputProcessor.prototype.readSingleValue = function(returnAsString) {
    let allInputLines = this._sourceLines;
    let currentLinePosition = this._currentLineIndex;
    let retrievedValue;

    // If the current line is still a single string, split it into parts and reverse.
    // Reversing allows efficient `pop()` operations to get values from the "front" of the line.
    if (typeof allInputLines[currentLinePosition] === "string") {
      allInputLines[currentLinePosition] = allInputLines[currentLinePosition].split(" ").reverse();
    }

    // Get the next value from the end of the reversed array.
    retrievedValue = allInputLines[currentLinePosition].pop();

    // If the current line has no more values, advance to the next line.
    if (!allInputLines[currentLinePosition].length) {
      this._currentLineIndex++;
    }

    // Return the value, optionally converted to a number.
    return returnAsString ? retrievedValue : +retrievedValue;
  };

  /**
   * Reads an entire line of space-separated values.
   * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array containing all values from the line.
   */
  InputProcessor.prototype.readLineOfValues = function(returnAsStrings) {
    // Get the current line, split it by spaces, and then increment the line index.
    let lineSegments = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return the segments, optionally mapped to numbers.
    return returnAsStrings ? lineSegments : lineSegments.map(item => +item);
  };

  /**
   * Reads a block of 'count' lines, where each line is split into space-separated values.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputProcessor.prototype.readMatrix = function(count, returnAsStrings) {
    // Extract the specified number of lines and advance the line index.
    let rawLineBlock = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Process each line by splitting it into parts.
    let processedBlock = rawLineBlock.map(lineStr => lineStr.split(" "));
    // Return the processed block, optionally mapping all inner values to numbers.
    return returnAsStrings ? processedBlock : processedBlock.map(rowArr => rowArr.map(item => +item));
  };

  /**
   * Reads a block of 'count' raw lines without splitting their content.
   * @param {number} count - The number of lines to read.
   * @param {boolean} [returnAsStrings=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw line contents.
   */
  InputProcessor.prototype.readRawLines = function(count, returnAsStrings) {
    // Extract the specified number of lines and advance the line index.
    let rawLineData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += count);
    // Return the raw lines, optionally mapped to numbers.
    return returnAsStrings ? rawLineData : rawLineData.map(item => +item);
  };

  return createParser; // The factory function is the public interface of this module.
})();

// Initialize the input reader by parsing content from standard input.
var inputReader = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Output the final result obtained from the problem-solving function.
console.log(solveProblem());

/**
 * Main function to solve the specific problem.
 * It reads input parameters, processes obstacle data, and calculates a path-related value.
 * @returns {number} The calculated minimum column index minus one, representing the answer.
 */
function solveProblem() {
  // Read the grid dimensions and the total number of obstacles.
  let heightVal = inputReader.readSingleValue();     // Represents the height of the grid.
  let widthVal = inputReader.readSingleValue();      // Represents the width of the grid.
  let numObstacles = inputReader.readSingleValue();  // Total count of obstacles.

  // Initialize a data structure to keep track of blocked cells.
  // `blockedCells` is an array where each index `i` corresponds to row `i`.
  // Each element is an object, allowing sparse storage of blocked columns for that row.
  let blockedCells = Array(heightVal + 1).fill(0).map(rowPlaceholder => {
    return {}; // Each row will be an object mapping column index to a blocked status (e.g., 1).
  });

  // Iterate through each obstacle to mark its position.
  for (let idx = 0; idx < numObstacles; idx++) {
    let obstacleCoords = inputReader.readLineOfValues(); // Reads [column, row] for the obstacle.
    // The problem logic dictates that obstacles where the column index is less than the row index are ignored.
    // Only obstacles where column >= row are considered.
    if (obstacleCoords[0] < obstacleCoords[1]) {
      continue; // Skip this obstacle if its column is less than its row.
    }
    // Mark the cell at `[row][column]` as blocked.
    blockedCells[obstacleCoords[1]][obstacleCoords[0]] = 1;
  }

  // Add a boundary condition: mark all cells in the column immediately after the grid's width as blocked.
  // This simplifies pathfinding logic by ensuring a "wall" at the right edge.
  for (idx = 1; idx <= heightVal; idx++) {
    blockedCells[idx][widthVal + 1] = 1;
  }

  // Determine the initial result value. This is based on the first blocked cell in the first row.
  // `Object.keys` returns string keys, so `[0]` gets the first key, and `+` converts it to a number.
  let resultValue = Object.keys(blockedCells[1])[0] - 1;

  // Initialize `currentCol` to start checking from the second column.
  let currentCol = 2;

  // Iterate through rows, starting from the second row.
  // The loop continues as long as the current row `idx` is within the current `resultValue` and grid `heightVal`.
  for (idx = 2; idx <= resultValue && idx <= heightVal; idx++) {
    // Advance `currentCol` past any blocked cells in the current row.
    // This finds the first unblocked column in the current row, starting from `currentCol`.
    while (blockedCells[idx][currentCol]) {
      currentCol++;
    }

    // Iterate through all explicitly blocked cells in the current row.
    // `for...in` iterates over string keys (column indices).
    for (let cellKey in blockedCells[idx]) {
      let colNum = +cellKey; // Convert the string key to a numeric column index.

      // If the `currentCol` (the first unblocked column found so far) is already
      // at or beyond this specific blocked cell, then this blocked cell is not relevant for updating `resultValue`.
      if (currentCol >= colNum) {
        continue;
      }

      // If this blocked cell's column index minus one is less than the current `resultValue`,
      // update `resultValue` to this new, smaller value.
      if (colNum - 1 < resultValue) {
        resultValue = colNum - 1;
      }
      break; // Once a relevant blocked cell is found and potentially updates `resultValue`, no need to check further in this row.
    }

    currentCol++; // Increment `currentCol` for the next row's check.

    // If `currentCol` exceeds the grid's width, it means we've gone past the traversable area.
    if (currentCol > widthVal) {
      break; // Exit the loop as no further path can be found.
    }
  }

  return resultValue; // Return the final calculated result.
}
