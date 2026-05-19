var INPUT_PARSER = (function() {
  /**
   * Factory function to create an input parser instance.
   * @param {string} rawInputString - The complete string content to be parsed.
   * @returns {InputReader} A new instance of the InputReader.
   */
  function createParser(rawInputString) {
    return new InputReader(rawInputString);
  }

  /**
   * @class InputReader
   * @description Manages the parsing of input data, line by line or token by token.
   * @param {string} initialInput - The full input string, typically from stdin.
   */
  function InputReader(initialInput) {
    // Stores all input lines, trimmed and split by newline.
    this._lines = initialInput.trim().split("\n");
    // Keeps track of the current line index being processed.
    this._lineIndex = 0;
  }

  /**
   * Reads and returns a single token from the current line.
   * Tokens are space-separated and read in reverse order from the line.
   * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, attempts to convert to a number.
   * @returns {string|number} The next token.
   */
  InputReader.prototype.readToken = function(returnAsString) {
    var currentLineContent = this._lines,
      currentLinePosition = this._lineIndex,
      extractedToken;

    // If the current line is still a single string, split it into tokens and reverse.
    // Reversing allows efficient `pop()` operations.
    if (typeof currentLineContent[currentLinePosition] === "string") {
      currentLineContent[currentLinePosition] = currentLineContent[currentLinePosition].split(" ").reverse();
    }

    // Get the last token from the (reversed) array of tokens for the current line.
    extractedToken = currentLineContent[currentLinePosition].pop();

    // If the current line's token array is now empty, advance to the next line.
    if (!currentLineContent[currentLinePosition].length) {
      this._lineIndex++;
    }

    // Return the token, either as a string or converted to a number.
    return returnAsString ? extractedToken : +extractedToken;
  };

  /**
   * Reads an entire line, splits it by spaces, and returns the resulting array of tokens.
   * @param {boolean} returnAsStrings - If true, tokens are strings; otherwise, they are numbers.
   * @returns {Array<string|number>} An array of tokens from the read line.
   */
  InputReader.prototype.readLine = function(returnAsStrings) {
    var lineTokens = this._lines[this._lineIndex++].split(" ");
    return returnAsStrings ? lineTokens : lineTokens.map(tokenItem => +tokenItem);
  };

  /**
   * Reads a specified number of lines, treating each as a row in a matrix.
   * Each row is split into tokens by spaces.
   * @param {number} numberOfLines - The count of lines to read for the matrix.
   * @param {boolean} returnAsStrings - If true, matrix elements are strings; otherwise, numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputReader.prototype.readMatrix = function(numberOfLines, returnAsStrings) {
    var matrixRows = this._lines.slice(this._lineIndex, this._lineIndex += numberOfLines).map(lineStr => lineStr.split(" "));
    return returnAsStrings ? matrixRows : matrixRows.map(rowArr => rowArr.map(tokenItem => +tokenItem));
  };

  /**
   * Reads a specified number of lines as raw strings or numbers.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} returnAsStrings - If true, returns lines as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array containing the raw lines.
   */
  InputReader.prototype.readRawLines = function(numberOfLines, returnAsStrings) {
    var rawLineData = this._lines.slice(this._lineIndex, this._lineIndex += numberOfLines);
    return returnAsStrings ? rawLineData : rawLineData.map(lineItem => +lineItem);
  };

  return createParser;
})();

// Instantiate the input parser with data read from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

// Call the main problem-solving function and output its return value.
console.log(solveProblem());

/**
 * Implements the core logic to solve the problem.
 * This function processes a grid to find connected components based on a specific rule:
 * two adjacent cells are in the same component if their characters are *different*.
 * It then counts '.' and non-'.' characters within each component and calculates
 * a final sum based on these counts.
 * @returns {number} The computed final answer.
 */
function solveProblem() {
  // Read the dimensions of the grid.
  var gridHeight = inputData.readToken();
  var gridWidth = inputData.readToken();

  // Read the grid content, where each element is a character string.
  var charGrid = inputData.readRawLines(gridHeight, true);

  // Initialize a 2D array to store the component ID for each cell.
  // All cells start with 0, indicating they are unvisited/unassigned.
  var componentMap = Array(gridHeight).fill(0).map(function() {
    return Array(gridWidth).fill(0);
  });

  // Counter for the number of unique components found.
  var componentCounter = 0;

  // Iterate through each cell in the grid to find and process components.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++) {
      // If the current cell has already been assigned to a component, skip it.
      if (componentMap[rowIdx][colIdx] !== 0) {
        continue;
      }

      // Found an unvisited cell, so start a new component.
      componentMap[rowIdx][colIdx] = ++componentCounter;

      // Use a stack (LIFO) for a DFS-like traversal to find all connected cells.
      // Each element in the queue is an array [row, col].
      var traversalStack = [
        [rowIdx, colIdx]
      ];

      // Process cells from the stack until it's empty.
      while (traversalStack.length) {
        var currentCellCoords = traversalStack.pop();
        var currentRow = currentCellCoords[0];
        var currentCol = currentCellCoords[1];

        // Check the four adjacent neighbors (up, down, left, right).

        // Check top neighbor
        if (currentRow > 0 &&
          componentMap[currentRow - 1][currentCol] === 0 && // Is unvisited
          charGrid[currentRow][currentCol] !== charGrid[currentRow - 1][currentCol]) { // Has different character
          componentMap[currentRow - 1][currentCol] = componentCounter; // Assign to current component
          traversalStack.push([currentRow - 1, currentCol]); // Add to stack for further processing
        }
        // Check bottom neighbor
        if (currentRow < gridHeight - 1 &&
          componentMap[currentRow + 1][currentCol] === 0 &&
          charGrid[currentRow][currentCol] !== charGrid[currentRow + 1][currentCol]) {
          componentMap[currentRow + 1][currentCol] = componentCounter;
          traversalStack.push([currentRow + 1, currentCol]);
        }
        // Check left neighbor
        if (currentCol > 0 &&
          componentMap[currentRow][currentCol - 1] === 0 &&
          charGrid[currentRow][currentCol] !== charGrid[currentRow][currentCol - 1]) {
          componentMap[currentRow][currentCol - 1] = componentCounter;
          traversalStack.push([currentRow, currentCol - 1]);
        }
        // Check right neighbor
        if (currentCol < gridWidth - 1 &&
          componentMap[currentRow][currentCol + 1] === 0 &&
          charGrid[currentRow][currentCol] !== charGrid[currentRow][currentCol + 1]) {
          componentMap[currentRow][currentCol + 1] = componentCounter;
          traversalStack.push([currentRow, currentCol + 1]);
        }
      }
    }
  }

  // Initialize an array to store character counts for each component.
  // `componentCharCounts[id]` will be `[dot_count, other_char_count]`.
  var componentCharCounts = Array(componentCounter + 1).fill(0).map(function() {
    return [0, 0];
  });

  // Variable to accumulate the final calculated result.
  var finalResult = 0;

  // Iterate through the grid again to populate the character counts for each component.
  for (var r = 0; r < gridHeight; r++) {
    for (var c = 0; c < gridWidth; c++) {
      // Check if the character is a dot or something else.
      if (charGrid[r][c] === ".") {
        componentCharCounts[componentMap[r][c]][0]++; // Increment dot count for this component
      } else {
        componentCharCounts[componentMap[r][c]][1]++; // Increment other char count for this component
      }
    }
  }

  // Calculate the final result by summing (dot_count * other_count) for each component.
  // Component ID 0 is typically unused or for unvisited cells, so we iterate from 0 to componentCounter.
  for (var compId = 0; compId <= componentCounter; compId++) {
    finalResult += componentCharCounts[compId][0] * componentCharCounts[compId][1];
  }

  return finalResult;
}
