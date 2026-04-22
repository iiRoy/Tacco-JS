const INPUT_PROCESSOR_FACTORY = (function() {
  // This module provides utilities to parse input data from a multi-line string.
  /**
   * Creates an instance of the InputSourceReader for a given text document.
   * @param {string} inputDocument - The raw string content to be parsed.
   * @returns {InputSourceReader} A new reader instance.
   */
  function createInputProcessor(inputDocument) {
    return new InputSourceReader(inputDocument);
  }

  /**
   * @class InputSourceReader
   * @description Manages the reading and parsing of lines from an input document.
   */
  function InputSourceReader(inputDocument) {
    // Stores each line of the input document as an array element.
    this._lineBuffer = inputDocument.trim().split("\n");
    // Keeps track of the current line being processed.
    this._currentLineCursor = 0;
  }

  /**
   * Extracts a single numeric value from the current line.
   * If the line has multiple values, it pops the last one.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  InputSourceReader.prototype.fetchNumericValue = function(returnAsString) {
    let currentLineContents = this._lineBuffer;
    let lineIndexSnapshot = this._currentLineCursor;
    let extractedElement;

    // Check if the current line needs to be split into tokens.
    if (typeof currentLineContents[lineIndexSnapshot] === "string") {
      currentLineContents[lineIndexSnapshot] = currentLineContents[lineIndexSnapshot].split(" ").reverse();
    }
    // Retrieve the last token from the current line.
    extractedElement = currentLineContents[lineIndexSnapshot].pop();

    // If the current line is now exhausted, advance the cursor to the next line.
    if (!currentLineContents[lineIndexSnapshot].length) {
      this._currentLineCursor++;
    }
    // Return the element either as a string or a parsed number.
    return returnAsString ? extractedElement : Number(extractedElement);
  };

  /**
   * Reads all values from the current line, then advances to the next line.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed values from the line.
   */
  InputSourceReader.prototype.retrieveLineTokens = function(returnAsString) {
    // Get the current line, split it by spaces, and then advance the line cursor.
    let tokenizedLine = this._lineBuffer[this._currentLineCursor++].split(" ");
    // Return the tokens as strings or as parsed numbers.
    return returnAsString ? tokenizedLine : tokenizedLine.map(item => Number(item));
  };

  /**
   * Reads a specified number of lines and parses them into a matrix of numbers.
   * Each line is treated as a row in the matrix.
   * @param {number} numberOfLines - The count of lines to read for the matrix.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
   */
  InputSourceReader.prototype.acquireNumericMatrix = function(numberOfLines, returnAsString) {
    // Extract a slice of lines and map each into an array of string tokens.
    let extractedBlocks = this._lineBuffer
      .slice(this._currentLineCursor, (this._currentLineCursor += numberOfLines))
      .map(lineSegment => lineSegment.split(" "));
    // Return the matrix as strings or as parsed numbers.
    return returnAsString ? extractedBlocks : extractedBlocks.map(row => row.map(val => Number(val)));
  };

  /**
   * Reads a specified number of lines and parses each into a single number.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of parsed values.
   */
  InputSourceReader.prototype.obtainNumericRows = function(numberOfLines, returnAsString) {
    // Extract a slice of lines directly.
    let extractedBlocks = this._lineBuffer.slice(this._currentLineCursor, (this._currentLineCursor += numberOfLines));
    // Return the array of lines as strings or as parsed numbers.
    return returnAsString ? extractedBlocks : extractedBlocks.map(rowContent => Number(rowContent));
  };

  return createInputProcessor;
})();

// Initialize the input data reader by providing the standard input content.
const dataStreamReader = INPUT_PROCESSOR_FACTORY(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Output the result of the main computational algorithm.
console.log(computeMinimumPath());

/**
 * Executes the primary algorithm to determine the shortest path.
 * @returns {number} The calculated shortest path length.
 */
function computeMinimumPath() {
  // Read grid dimensions and number of obstacles from the input.
  const gridHeight = dataStreamReader.fetchNumericValue();
  const gridWidth = dataStreamReader.fetchNumericValue();
  const numObstacles = dataStreamReader.fetchNumericValue();

  // Initialize a 2D structure (using objects for sparse columns) to mark blocked cells.
  // The size is gridHeight + 1 to use 1-based indexing for rows.
  const obstacleMap = Array(gridHeight + 1)
    .fill(0)
    .map(_ => {
      return {};
    });

  // Process each obstacle definition.
  for (let rowIndex = 0; rowIndex < numObstacles; rowIndex++) {
    // Each obstacle is given by [column, row].
    const obstacleCoordinates = dataStreamReader.retrieveLineTokens();
    // If the column is less than the row, this constraint is invalid or ignored.
    if (obstacleCoordinates[0] < obstacleCoordinates[1]) {
      continue;
    }
    // Mark the cell at (row, column) as blocked (using 1 to signify blocked).
    obstacleMap[obstacleCoordinates[1]][obstacleCoordinates[0]] = 1;
  }

  // Mark all cells in the column immediately to the right of the grid (gridWidth + 1) as blocked.
  // This simplifies boundary checks for path traversal.
  for (let currentGridRow = 1; currentGridRow <= gridHeight; currentGridRow++) {
    obstacleMap[currentGridRow][gridWidth + 1] = 1;
  }

  // Initialize the shortest path length with the first available column in the first row, minus one.
  // Object.keys returns strings, so explicit Number conversion is needed.
  let shortestPathLength = Number(Object.keys(obstacleMap[1])[0]) - 1;
  // Initialize the current column position for pathfinding.
  let currentColPosition = 2;

  // Iterate through rows starting from the second row to gridHeight.
  for (let currentGridRow = 2; currentGridRow <= gridHeight; currentGridRow++) {
    // Advance currentColPosition past any obstacles in the current row.
    while (obstacleMap[currentGridRow][currentColPosition]) {
      currentColPosition++;
    }
    // If currentColPosition exceeds the current shortestPathLength,
    // it means we can't find a shorter path, so break.
    if (currentColPosition > shortestPathLength) {
      break;
    }

    // Iterate through the obstacle columns in the current row.
    for (let obstacleColKey in obstacleMap[currentGridRow]) {
      // Convert the obstacle column key (string) to a number.
      let obstacleCol = Number(obstacleColKey);
      // If the current path column is already at or past this obstacle, skip it.
      if (currentColPosition >= obstacleCol) {
        continue;
      }
      // If a closer obstacle is found (obstacleCol - 1), update shortestPathLength.
      if (obstacleCol - 1 < shortestPathLength) {
        shortestPathLength = obstacleCol - 1;
      }
      // Since we are looking for the *closest* obstacle to the left,
      // once we find one that's to the right of `currentColPosition`,
      // we can break, as subsequent obstacles will be further right.
      break;
    }
    // Advance the column position for the next row's calculation.
    currentColPosition++;
  }

  // Return the final calculated shortest path length.
  return shortestPathLength;
}