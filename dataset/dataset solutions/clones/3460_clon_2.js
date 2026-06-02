function InputProcessor(inputString) {
  // Initialize the internal storage for lines by splitting the input string.
  this._sourceLines = inputString.split("\n");
  // Set the initial line pointer to the first line.
  this._currentLineIndex = 0;
}

InputProcessor.prototype = {
  /**
   * Extracts a single value from the current line.
   * If the line has not been split into parts yet, it splits it by space and reverses it
   * to allow efficient popping from the end.
   * @param {boolean} asString - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  extractItem: function(asString) {
    let lineSegments = this._sourceLines;
    let currentLinePointer = this._currentLineIndex;
    let extractedResult;

    // Check if the current line is still a single string; if so, split and reverse it.
    if (typeof lineSegments[currentLinePointer] === "string") {
      lineSegments[currentLinePointer] = lineSegments[currentLinePointer].split(" ").reverse();
    }

    // Pop the last element from the (reversed) array of line segments.
    extractedResult = lineSegments[currentLinePointer].pop();

    // If the current line is now empty, advance the line pointer to the next line.
    if (!lineSegments[currentLinePointer].length) {
      this._currentLineIndex++;
    }

    // Return the result, converting to a number if 'asString' is false.
    return asString ? extractedResult : +extractedResult;
  },

  /**
   * Reads an entire line, splits it by space, and returns the values.
   * Advances the line pointer after reading.
   * @param {boolean} asStrings - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of values from the line.
   */
  fetchLine: function(asStrings) {
    // Get the current line, split it by space, and then increment the line pointer.
    let parsedLineSegments = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return the segments, mapping to numbers if 'asStrings' is false.
    return asStrings ? parsedLineSegments : parsedLineSegments.map(val => +val);
  },

  /**
   * Reads multiple lines and processes them into a 2D array (matrix).
   * @param {number} numLinesToRead - The number of lines to read.
   * @param {boolean} asStrings - If true, values in the matrix are strings; otherwise, numbers.
   * @returns {Array<Array<string|number>>} A matrix of values.
   */
  getMatrix: function(numLinesToRead, asStrings) {
    let sourceDataArray = this._sourceLines;
    let initialLineIndex = this._currentLineIndex;
    let outputGrid = [];
    let loopIterator = 0;

    // Loop through the specified number of lines.
    if (asStrings) {
      for (; loopIterator < numLinesToRead; loopIterator++) {
        outputGrid[loopIterator] = sourceDataArray[initialLineIndex + loopIterator].split(" ");
      }
    } else {
      for (; loopIterator < numLinesToRead; loopIterator++) {
        outputGrid[loopIterator] = sourceDataArray[initialLineIndex + loopIterator].split(" ").map(val => +val);
      }
    }

    // Advance the line pointer by the number of lines read.
    this._currentLineIndex += numLinesToRead;
    return outputGrid;
  },
};

// Create an instance of the InputProcessor, reading from standard input.
var dataParser = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));
// Define a large prime modulus for calculations.
var primeModulus = 1000000007; // Equivalent to 1e9 + 7

// Output the result of the main calculation function.
console.log(calculatePaths());

/**
 * Main function to solve the problem using dynamic programming.
 * Calculates the number of paths in a grid-like structure.
 * @returns {number} The total number of valid paths.
 */
function calculatePaths() {
  // Read grid dimensions and target column from input.
  var numRows = dataParser.extractItem();
  var numCols = dataParser.extractItem();

  // Handle edge case where width is 1.
  if (numCols === 1) return 1;

  var targetCol = dataParser.extractItem();

  // Initialize a 2D array (DP table) to store path counts.
  // dp[i][j] will store the number of ways to reach row 'i' at column 'j'.
  var dynamicProgrammingTable = Array(numRows + 1).fill(0).map(() => Array(numCols + 1).fill(0));

  // Base case: At row 0, there's 1 way to be at column 1 (assuming 1-indexed columns).
  dynamicProgrammingTable[0][1] = 1;

  // Predefined sequence of factors (related to Fibonacci numbers or combinations).
  // This sequence is used to calculate combinations of adjacent bars.
  var combinationFactors = [1, 1, 2, 3, 5, 8, 13, 21, 34];

  // Iterate through each row from 1 to numRows.
  for (var currentRow = 1; currentRow <= numRows; currentRow++) {
    // Calculate paths for the first column (column 1).
    // Paths can come from column 1 or column 2 of the previous row.
    dynamicProgrammingTable[currentRow][1] = dynamicProgrammingTable[currentRow - 1][1] * combinationFactors[numCols - 1];
    dynamicProgrammingTable[currentRow][1] += dynamicProgrammingTable[currentRow - 1][2] * combinationFactors[numCols - 2];
    dynamicProgrammingTable[currentRow][1] %= primeModulus;

    // Iterate through intermediate columns (from 2 to numCols - 1).
    for (var currentColumn = 2; currentColumn < numCols; currentColumn++) {
      // Paths can come from column (j-1), j, or (j+1) of the previous row.
      // Each term is multiplied by specific combination factors based on remaining columns.
      dynamicProgrammingTable[currentRow][currentColumn] = dynamicProgrammingTable[currentRow - 1][currentColumn - 1] * combinationFactors[currentColumn - 2] * combinationFactors[numCols - currentColumn];
      dynamicProgrammingTable[currentRow][currentColumn] += dynamicProgrammingTable[currentRow - 1][currentColumn] * combinationFactors[currentColumn - 1] * combinationFactors[numCols - currentColumn];
      dynamicProgrammingTable[currentRow][currentColumn] += dynamicProgrammingTable[currentRow - 1][currentColumn + 1] * combinationFactors[currentColumn - 1] * combinationFactors[numCols - currentColumn - 1];
      dynamicProgrammingTable[currentRow][currentColumn] %= primeModulus;
    }

    // Calculate paths for the last column (column numCols).
    // Paths can come from column (numCols-1) or numCols of the previous row.
    dynamicProgrammingTable[currentRow][numCols] = dynamicProgrammingTable[currentRow - 1][numCols - 1] * combinationFactors[numCols - 2];
    dynamicProgrammingTable[currentRow][numCols] += dynamicProgrammingTable[currentRow - 1][numCols] * combinationFactors[numCols - 1];
    dynamicProgrammingTable[currentRow][numCols] %= primeModulus;
  }

  // The final answer is the number of ways to reach the target column at the last row.
  return dynamicProgrammingTable[numRows][targetCol];
}
