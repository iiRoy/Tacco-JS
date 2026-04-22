"use strict";

// Helper for explicit number conversion.
const toNumeric = (val) => Number(val);

// Constants for input parsing
const WHITESPACE_DELIMITER = " ";
const NEWLINE_DELIMITER = "\n";

// InputParserFactory: Manages reading data from a string source.
// This module provides functions to create a parser instance and extract various data types.
const InputParserFactory = (function () {
  /**
   * Creates a new instance of a LineBasedParser.
   * @param {string} rawInputString - The complete input string.
   * @returns {LineBasedParser} A new parser object.
   */
  function createParser(rawInputString) {
    return new LineBasedParser(rawInputString);
  }

  /**
   * LineBasedParser: Handles parsing of input data line by line.
   * @param {string} rawInputString - The full input content.
   */
  function LineBasedParser(rawInputString) {
    // Stores all input lines, trimmed and split by newline.
    this.sourceLinesArray = rawInputString.trim().split(NEWLINE_DELIMITER);
    // Pointer to the current line being processed.
    this.currentLineIdx = 0;
    // Buffer for tokens of the current line, to support sequential token extraction.
    this.currentLineTokensBuffer = [];
  }

  // Prototype methods for LineBasedParser to extract different data formats.
  LineBasedParser.prototype = {
    /**
     * Extracts a single token from the current line. If the current line's tokens are exhausted,
     * it advances to the next line.
     * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, attempts conversion to a number.
     * @returns {string|number} The extracted token.
     */
    getNextToken: function (returnAsString = false) {
      // If the current line's token buffer is empty or not yet initialized for the current line
      if (this.currentLineTokensBuffer.length === 0) {
        // Guard against reading past the end of input
        if (this.currentLineIdx >= this.sourceLinesArray.length) {
          throw new Error("Attempted to read past end of input data.");
        }
        // Split the current line into tokens and store in the buffer.
        // The original code used `reverse` then `pop`. To maintain a similar effect (processing from right to left or a specific order),
        // we'll store them in a way that `pop` naturally works, or just process left-to-right.
        // For simplicity and common use-case, we'll process left-to-right.
        // The original `reverse()` was a specific implementation detail; we'll remove that for clarity unless it's critical.
        // Let's assume standard left-to-right token consumption for a Type III rewrite.
        this.currentLineTokensBuffer = this.sourceLinesArray[this.currentLineIdx].split(WHITESPACE_DELIMITER);
        // If the line is empty, advance the line pointer and try again (or handle error).
        // For competitive programming, empty lines are usually not expected unless specific.
        if (this.currentLineTokensBuffer.length === 0 && this.sourceLinesArray[this.currentLineIdx] !== "") {
             // This case handles a line that was just whitespace or genuinely empty and split into [""].
             // To match previous behavior of `pop()` on an empty array returning `undefined`,
             // we'll simulate. Let's just advance the line and try again if it yields nothing.
             // Or, more robustly, ensure the split always yields something.
             // If a line is " ", split(" ") -> ["", ""]. Pop would give "".
             // If a line is "", split("") -> [""]
             // Original: `s[y]=s[y].split(" ").reverse(); r=s[y].pop();`
             // If `s[y]` is "1 2", it becomes ["2", "1"]. pop -> "1".
             // If `s[y]` is "1", it becomes ["1"]. pop -> "1".
             // If `s[y]` is "", it becomes [""] (if split("")). If split(" ") -> [""] (if trim before).
             // The original code doesn't trim *before* split, but `_s` is already trimmed per line.
             // So `_s[y]` is never `""` unless it was a blank line in the input.
             // Let's assume tokens are always present or it's an error.
             throw new Error(`Empty line or invalid token on line ${this.currentLineIdx + 1}`);
        }
        // If the buffer is still empty (e.g., line was just whitespace), advance and retry.
        if (this.currentLineTokensBuffer.length === 0 && this.sourceLinesArray[this.currentLineIdx].trim() === "") {
            this.currentLineIdx++;
            return this.getNextToken(returnAsString); // Recursive call to get token from next line
        }
      }

      const extractedToken = this.currentLineTokensBuffer.shift(); // Get token from the front of the array.
                                                                    // Original used pop after reverse. Shift is effectively same if we don't reverse.

      // If the buffer is now empty after shifting, it means we've consumed all tokens for this line.
      // Advance the line pointer for the next read operation.
      if (this.currentLineTokensBuffer.length === 0) {
        this.currentLineIdx++;
      }

      return returnAsString ? extractedToken : toNumeric(extractedToken);
    },

    /**
     * Reads an entire line and returns its tokens.
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    readTokensAsArray: function (returnAsStrings = false) {
      if (this.currentLineIdx >= this.sourceLinesArray.length) {
        throw new Error("Attempted to read past end of input data for line array.");
      }
      const lineContent = this.sourceLinesArray[this.currentLineIdx++];
      const tokens = lineContent.split(WHITESPACE_DELIMITER);
      // Clear any pending tokens for this line in the buffer, as we've read the whole line.
      this.currentLineTokensBuffer = [];
      return returnAsStrings ? tokens : tokens.map(toNumeric);
    },

    /**
     * Reads N lines and returns them as a 2D array (matrix) of tokens.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsStrings=false] - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<Array<string|number>>} A 2D array of tokens.
     */
    readTokenMatrix: function (numLines, returnAsStrings = false) {
      if (this.currentLineIdx + numLines > this.sourceLinesArray.length) {
        throw new Error(`Attempted to read ${numLines} lines, but only ${this.sourceLinesArray.length - this.currentLineIdx} remain.`);
      }
      const matrix = this.sourceLinesArray
        .slice(this.currentLineIdx, (this.currentLineIdx += numLines))
        .map((line) => line.split(WHITESPACE_DELIMITER));
      // Clear any pending tokens as multiple lines are consumed
      this.currentLineTokensBuffer = [];
      return returnAsStrings ? matrix : matrix.map((row) => row.map(toNumeric));
    },

    /**
     * Reads N lines directly as raw strings.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} [returnAsNumbers=false] - If true, attempts conversion of each line to a number; otherwise, returns raw strings.
     * @returns {Array<string|number>} An array of raw line strings.
     */
    readRawLines: function (numLines, returnAsNumbers = false) {
      if (this.currentLineIdx + numLines > this.sourceLinesArray.length) {
        throw new Error(`Attempted to read ${numLines} lines, but only ${this.sourceLinesArray.length - this.currentLineIdx} remain.`);
      }
      const lines = this.sourceLinesArray.slice(this.currentLineIdx, (this.currentLineIdx += numLines));
      // Clear any pending tokens as multiple lines are consumed
      this.currentLineTokensBuffer = [];
      return returnAsNumbers ? lines.map(toNumeric) : lines;
    },
  };

  return createParser;
})();

/**
 * Dynamically creates a multi-dimensional array initialized with a given value.
 * This function replaces the `eval`-based `xArray` for safety and clarity.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., (0, H, W) for HxW array).
 * @returns {Array} The multi-dimensional array.
 */
function buildMultiDimArray(initialValue, ...dimensions) {
  // Ensure at least one dimension is provided
  if (dimensions.length === 0) {
    return initialValue;
  }

  const createDimension = (depth) => {
    const size = dimensions[depth];
    if (size <= 0) {
        throw new Error("Array dimensions must be positive integers.");
    }
    const arr = new Array(size);
    if (depth === dimensions.length - 1) {
      // Last dimension, fill with initial value
      for (let i = 0; i < size; i++) {
        arr[i] = initialValue;
      }
    } else {
      // Deeper dimension, recursively create next dimension
      for (let i = 0; i < size; i++) {
        arr[i] = createDimension(depth + 1);
      }
    }
    return arr;
  };

  return createDimension(0);
}

// Global variables for grid dimensions, layout, and BFS result.
let distanceMapGrid;
let gridHeightValue;
let gridWidthValue;
let mapLayoutData;

// Read input from stdin using the custom parser.
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputDataReader = InputParserFactory(fileContent);

// Main execution block.
console.log(executeGridTraversal());

/**
 * Orchestrates the grid traversal and distance calculation.
 * Finds the maximum shortest path distance between any two reachable '.' cells.
 * @returns {number} The maximum distance found.
 */
function executeGridTraversal() {
  gridHeightValue = inputDataReader.getNextToken();
  gridWidthValue = inputDataReader.getNextToken();

  // Basic validation for grid dimensions
  if (gridHeightValue <= 0 || gridWidthValue <= 0) {
    console.error("Invalid grid dimensions: Height and Width must be positive.");
    return 0; // Or throw an error, depending on desired behavior
  }

  // Read the grid layout as an array of strings.
  mapLayoutData = inputDataReader.readRawLines(gridHeightValue, false); // false ensures strings

  let maximumPathLength = 0; // Stores the overall maximum distance found.

  // Iterate over each cell in the grid.
  for (let row = 0; row < gridHeightValue; ++row) {
    for (let col = 0; col < gridWidthValue; ++col) {
      // If the current cell is an empty space ('.'), start a BFS from it.
      if (mapLayoutData[row][col] === ".") {
        // Calculate distances from this starting point.
        const currentRunMaxDistance = calculateDistancesBFS(row, col);
        // Update the overall maximum path length.
        maximumPathLength = Math.max(maximumPathLength, currentRunMaxDistance);
      }
    }
  }
  return maximumPathLength;
}

// Directions for BFS (Up, Down, Left, Right)
const DELTA_ROWS = [-1, 1, 0, 0];
const DELTA_COLS = [0, 0, -1, 1];
const NUM_DIRECTIONS = 4;

/**
 * Performs a Breadth-First Search (BFS) to calculate distances from a starting cell
 * to all other reachable '.' cells. Populates `distanceMapGrid` and returns the max distance found in this run.
 * @param {number} startRow - The starting row coordinate.
 * @param {number} startCol - The starting column coordinate.
 * @returns {number} The maximum distance found during this BFS run.
 */
function calculateDistancesBFS(startRow, startCol) {
  // Initialize the distance grid for this BFS run.
  // -1 indicates unvisited cells.
  distanceMapGrid = buildMultiDimArray(-1, gridHeightValue, gridWidthValue);

  // Guard clause: If the starting cell is not traversable (e.g., '#'), return 0 distance.
  if (mapLayoutData[startRow][startCol] !== ".") {
    return 0;
  }

  distanceMapGrid[startRow][startCol] = 0; // Distance from start to itself is 0.
  let currentLevelCells = [[startRow, startCol]]; // Queue for the current BFS level.
  let currentPathDistance = 0; // Current distance from the source cell.
  let maxDistanceInThisRun = 0; // Max distance found during this particular BFS.

  // BFS loop: continues as long as there are cells to visit in the current level.
  while (currentLevelCells.length > 0) {
    let nextLevelCells = []; // Queue for cells in the next BFS level.
    currentPathDistance++; // Increment distance for the next level.

    // Process all cells in the current level.
    for (const [currentRow, currentCol] of currentLevelCells) {
      // Explore all four possible directions (neighbors).
      for (let i = 0; i < NUM_DIRECTIONS; ++i) {
        const neighborRow = currentRow + DELTA_ROWS[i];
        const neighborCol = currentCol + DELTA_COLS[i];

        // Check if the neighbor is within grid boundaries.
        const isValidRow = neighborRow >= 0 && neighborRow < gridHeightValue;
        const isValidCol = neighborCol >= 0 && neighborCol < gridWidthValue;

        if (isValidRow && isValidCol) {
          // Check if the neighbor is an empty space ('.') and hasn't been visited yet.
          if (mapLayoutData[neighborRow][neighborCol] === "." && distanceMapGrid[neighborRow][neighborCol] === -1) {
            distanceMapGrid[neighborRow][neighborCol] = currentPathDistance; // Mark as visited with current distance.
            nextLevelCells.push([neighborRow, neighborCol]); // Add to the queue for the next level.
            maxDistanceInThisRun = Math.max(maxDistanceInThisRun, currentPathDistance); // Update max distance.
          }
        }
      }
    }
    // Move to the next level of cells.
    currentLevelCells = nextLevelCells;
  }
  return maxDistanceInThisRun;
}