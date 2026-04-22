// This module handles reading input from standard input and processing it.
// It includes utilities for data transformation and a core algorithm for pathfinding.

/**
 * A utility class for handling input lines from a source.
 * It provides methods to retrieve lines sequentially and check for availability.
 */
class InputLineStream {
  #sourceLines; // Private field to store all input lines.
  #currentPosition = 0; // Private field to track the current index.

  /**
   * Initializes the InputLineStream by reading content from a specified path.
   * @param {string} inputPath - The file path to read from (e.g., "/dev/stdin").
   */
  constructor(inputPath) {
    try {
      const rawContent = require("fs").readFileSync(inputPath, "utf8");
      this.#sourceLines = rawContent.trim().split("\n");
      // If trimming and splitting results in a single empty string, treat it as no lines.
      if (this.#sourceLines.length === 1 && this.#sourceLines[0] === '') {
          this.#sourceLines = [];
      }
    } catch (error) {
      // Report the error to standard error and initialize with an empty array.
      console.error("Failed to read input from path:", inputPath, error.message);
      this.#sourceLines = [];
    }
  }

  /**
   * Retrieves the next available line from the stream.
   * Throws an error if no more lines are available.
   * @returns {string} The next line as a string.
   */
  fetchNextLine() {
    if (!this.hasMoreLines()) {
      throw new Error("EndOfStreamException: No more data elements to retrieve.");
    }
    const extractedLine = this.#sourceLines[this.#currentPosition];
    this.#currentPosition++;
    return extractedLine;
  }

  /**
   * Checks if there are more lines available in the stream.
   * @returns {boolean} True if more lines exist, false otherwise.
   */
  hasMoreLines() {
    return this.#currentPosition < this.#sourceLines.length;
  }

  /**
   * Returns the next line without advancing the stream's position.
   * @returns {string | undefined} The next line or undefined if no more lines.
   */
  peekNextLine() {
    if (!this.hasMoreLines()) {
      return undefined;
    }
    return this.#sourceLines[this.#currentPosition];
  }
}

// Global instance of the input stream handler for the primary input source.
const primaryInputStream = new InputLineStream("/dev/stdin");

/**
 * A collection of static methods for transforming various data types.
 * Each method handles a specific conversion scenario, improving readability over a single switch.
 */
const DataConverter = {
  /**
   * Converts a string to an integer (base 10).
   * @param {string} inputStr - The string to convert.
   * @returns {number} The integer representation, or NaN if conversion fails.
   */
  toInt: (inputStr) => parseInt(inputStr, 10),

  /**
   * Splits a string by a single space character into an array of strings.
   * @param {string} inputStr - The string to split.
   * @returns {string[]} An array of substrings.
   */
  splitBySpace: (inputStr) => inputStr.split(" "),

  /**
   * Splits a string by space and then converts each resulting substring to a number.
   * @param {string} inputStr - The string to split and convert.
   * @returns {number[]} An array of numbers.
   */
  splitBySpaceAndToNums: (inputStr) => inputStr.split(" ").map(Number),

  /**
   * Splits a string into an array of individual characters.
   * @param {string} inputStr - The string to split.
   * @returns {string[]} An array of characters.
   */
  splitByChar: (inputStr) => inputStr.split(""),

  /**
   * Splits a string into characters and then converts each character (as a string) to a number.
   * @param {string} inputStr - The string to split and convert.
   * @returns {number[]} An array of numbers (from characters).
   */
  splitByCharAndToNums: (inputStr) => inputStr.split("").map(Number),

  /**
   * Joins an array of items into a single string, using a space as the separator.
   * @param {Array} items - The array of items to join.
   * @returns {string} The joined string.
   */
  joinWithSpace: (items) => items.join(" "),

  /**
   * Joins an array of items into a single string, using a newline character as the separator.
   * @param {Array} items - The array of items to join.
   * @returns {string} The joined string.
   */
  joinWithNewline: (items) => items.join("\n"),

  /**
   * Joins an array of items into a single string without any separator.
   * @param {Array} items - The array of items to join.
   * @returns {string} The joined string.
   */
  joinWithoutSeparator: (items) => items.join(""),

  /**
   * A passthrough function that returns the input value unchanged.
   * Useful for scenarios where no transformation is needed.
   * @param {*} inputVal - The value to return.
   * @returns {*} The original input value.
   */
  passThrough: (inputVal) => inputVal,
};

/**
 * Prints a given message to standard output, followed by a newline.
 * This is the primary function for reporting final results or intermediate debug messages.
 * @param {*} message - The content to be displayed.
 */
function printOutput(message) {
  console.log(message);
}

/**
 * The main execution function for the pathfinding problem.
 * It reads grid dimensions, processes the grid, and calculates the shortest path
 * from (0,0) to (H-1, W-1) through '.' cells using Breadth-First Search (BFS).
 * Finally, it computes the number of '.' cells that are NOT part of the shortest path.
 */
function solveMazePath() {
  // Read grid dimensions (Height and Width) from the first line of input.
  // Expects two space-separated numbers, e.g., "5 5".
  const gridDimensions = DataConverter.splitBySpaceAndToNums(primaryInputStream.fetchNextLine());

  const gridHeight = gridDimensions[0];
  const gridWidth = gridDimensions[1];

  // --- Initial Validation and Edge Cases ---
  // If dimensions are invalid (non-positive, or NaN from conversion),
  // or if the input stream was empty/failed, output -1 immediately.
  if (
    !Number.isInteger(gridHeight) || gridHeight <= 0 ||
    !Number.isInteger(gridWidth) || gridWidth <= 0 ||
    !primaryInputStream.hasMoreLines() && (gridHeight > 0 || gridWidth > 0)
  ) {
    printOutput(-1);
    return;
  }
  // Arbitrary upper limits to prevent excessive memory usage or computation for very large grids.
  if (gridHeight > 1000 || gridWidth > 1000) {
      printOutput(-1);
      return;
  }

  // Initialize the maze grid and a tracking grid for visited cells.
  // mazeGrid stores characters ('.', '#'), visitedCells stores booleans.
  const mazeGrid = new Array(gridHeight);
  // Using Array.from for clearer initialization of 2D array with distinct inner arrays.
  const visitedCells = Array.from({ length: gridHeight }, () => new Array(gridWidth).fill(false));

  // Populate the maze grid with characters from subsequent input lines.
  // Each line represents a row in the grid.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    // Ensure we have enough lines for the declared height.
    if (!primaryInputStream.hasMoreLines()) {
        printOutput(-1); // Not enough input lines for the declared height.
        return;
    }
    mazeGrid[rowIdx] = DataConverter.splitByChar(primaryInputStream.fetchNextLine());
    // Basic validation: check if row length matches declared width.
    if (mazeGrid[rowIdx].length !== gridWidth) {
        printOutput(-1); // Malformed grid input.
        return;
    }
  }

  // Check if the starting cell (0,0) or the ending cell (H-1, W-1) are blocked ('#').
  // If either is a wall, no path is possible.
  if (mazeGrid[0][0] === '#' || mazeGrid[gridHeight - 1][gridWidth - 1] === '#') {
      printOutput(-1);
      return;
  }

  // --- Breadth-First Search (BFS) Setup ---
  // The BFS queue will store tuples of [row, column, path_length_from_start].
  const bfsTraversalQueue = [[0, 0, 0]];
  visitedCells[0][0] = true; // Mark the starting cell as visited.

  let minPathSteps = Number.MAX_SAFE_INTEGER; // Initialize with the largest possible safe integer.

  // Define possible moves (up, down, left, right) as changes in row and column indices.
  const deltaRow = [-1, 1, 0, 0]; // Corresponds to: Up, Down, Same Row
  const deltaCol = [0, 0, -1, 1]; // Corresponds to: Same Col, Same Col, Left, Right
  const numDirections = 4; // Total number of cardinal directions to explore.

  // Helper function to check if a given cell coordinate is within the grid boundaries.
  const isValidCell = (r, c) => r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;

  // --- BFS Traversal Loop ---
  // Continue as long as there are cells in the queue to explore.
  while (bfsTraversalQueue.length > 0) {
    // Dequeue the current cell's information (row, column, and path length to it).
    const [currentRow, currentCol, currentPathLength] = bfsTraversalQueue.shift();

    // If the current cell is the destination (bottom-right corner).
    if (currentRow === gridHeight - 1 && currentCol === gridWidth - 1) {
      // Update the minimum path length found so far.
      minPathSteps = Math.min(minPathSteps, currentPathLength);
      // Since BFS finds the shortest path layer by layer, once we reach the goal,
      // any subsequent paths found to the goal via this branch will be equal or longer.
      // We can continue to process the rest of the queue to ensure all paths are explored
      // if the problem required something else, but for shortest path, `Math.min` handles it.
      continue; // Move to the next item in the queue.
    }

    // Explore all 4 possible neighboring cells (up, down, left, right).
    for (let i = 0; i < numDirections; i++) {
      const nextRow = currentRow + deltaRow[i];
      const nextCol = currentCol + deltaCol[i];

      // Check conditions for a valid and explorable neighbor:
      // 1. Is it within the grid boundaries?
      // 2. Is it a walkable cell ('.')?
      // 3. Has it not been visited yet?
      if (
        isValidCell(nextRow, nextCol) &&
        mazeGrid[nextRow][nextCol] === "." &&
        !visitedCells[nextRow][nextCol]
      ) {
        visitedCells[nextRow][nextCol] = true; // Mark this new cell as visited.
        // Enqueue the neighbor with an incremented path length.
        bfsTraversalQueue.push([nextRow, nextCol, currentPathLength + 1]);
      }
    }
  }

  // --- Post-BFS Analysis and Result Calculation ---
  // If `minPathSteps` is still `Number.MAX_SAFE_INTEGER`, it means no path was found
  // from the start to the end cell.
  if (minPathSteps === Number.MAX_SAFE_INTEGER) {
    printOutput(-1);
  } else {
    // Calculate the total number of '.' (walkable) cells in the entire maze grid.
    let totalWalkableCells = 0;
    for (let r = 0; r < gridHeight; r++) {
      for (let c = 0; c < gridWidth; c++) {
        if (mazeGrid[r][c] === ".") {
          totalWalkableCells++;
        }
      }
    }

    // The problem asks for the number of '.' cells that are NOT part of the shortest path.
    // A path of `minPathSteps` length means it visited `minPathSteps + 1` cells
    // (e.g., length 0 means 1 cell: start=end).
    const cellsOnShortestPath = minPathSteps + 1;
    const resultCount = totalWalkableCells - cellsOnShortestPath;
    printOutput(resultCount);
  }
}

// Execute the main program logic to solve the maze path problem.
solveMazePath();