var InputProcessor = (function () {
  /**
   * Initializes a new input parsing utility.
   * @param {string} sourceString - The complete string of input data.
   * @returns {InputDataParser} An instance of the input data parser.
   */
  function createParser(sourceString) {
    return new InputDataParser(sourceString);
  }

  /**
   * Represents a parser for structured input data.
   * @class
   * @param {string} rawInputString - The raw string content to be parsed.
   */
  function InputDataParser(rawInputString) {
    // Internal storage for all input lines, split by newline and trimmed.
    this._sourceLines = rawInputString.trim().split("\n");
    // Pointer to the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Retrieves a single value from the current input line.
   * Values are extracted in reverse order from how they appear on the line.
   * @param {boolean} returnAsString - If true, the value is returned as a string; otherwise, as a number.
   * @returns {string|number} The extracted data item.
   */
  InputDataParser.prototype.extractValue = function (returnAsString) {
    let linesCollection = this._sourceLines;
    let currentLinePosition = this._currentLineIndex;
    let resultItem;

    // If the current line is still a raw string, split it into parts and reverse for easy popping.
    if (typeof linesCollection[currentLinePosition] === "string") {
      linesCollection[currentLinePosition] = linesCollection[
        currentLinePosition
      ].split(" ").reverse();
    }

    // Get the last element from the (reversed) array, which is the next value.
    resultItem = linesCollection[currentLinePosition].pop();

    // If the current line is now empty after popping, advance to the next line.
    if (!linesCollection[currentLinePosition].length) {
      this._currentLineIndex++;
    }

    // Return the item, optionally converted to a number.
    return returnAsString ? resultItem : Number(resultItem);
  };

  /**
   * Reads an entire line of input and parses its space-separated values.
   * @param {boolean} returnAsStrings - If true, values are returned as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array containing the parsed values from the line.
   */
  InputDataParser.prototype.readLineValues = function (returnAsStrings) {
    // Get the current line, split it by spaces, and then increment the line pointer.
    let lineSegments = this._sourceLines[this._currentLineIndex++].split(" ");
    // Return segments as strings or map them to numbers.
    return returnAsStrings
      ? lineSegments
      : lineSegments.map((segment) => Number(segment));
  };

  /**
   * Reads a specified number of lines and parses them as a 2D matrix of values.
   * @param {number} numberOfLines - The count of lines to read for the matrix.
   * @param {boolean} returnAsStrings - If true, values are returned as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
   */
  InputDataParser.prototype.readMatrixValues = function (
    numberOfLines,
    returnAsStrings
  ) {
    // Extract the specified number of lines and update the line pointer.
    let matrixRows = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numberOfLines)
    );
    // Split each row into individual values.
    let parsedRows = matrixRows.map((rowStr) => rowStr.split(" "));
    // Return as strings or convert all matrix elements to numbers.
    return returnAsStrings
      ? parsedRows
      : parsedRows.map((row) => row.map((val) => Number(val)));
  };

  /**
   * Reads a specified number of lines without further parsing (as raw lines).
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} returnAsStrings - If true, lines are returned as strings; otherwise, attempts to convert to numbers.
   * @returns {Array<string|number>} An array of raw lines.
   */
  InputDataParser.prototype.readRawLines = function (
    numberOfLines,
    returnAsStrings
  ) {
    // Extract the specified number of lines and update the line pointer.
    let rawLineData = this._sourceLines.slice(
      this._currentLineIndex,
      (this._currentLineIndex += numberOfLines)
    );
    // Return lines as strings or attempt to convert them to numbers.
    return returnAsStrings
      ? rawLineData
      : rawLineData.map((line) => Number(line));
  };

  return createParser;
})();

// Instantiate the input reader by reading from standard input.
var inputReader = InputProcessor(
  require("fs").readFileSync("/dev/stdin", "utf8")
);

// Execute the main problem-solving logic and print its result to the console.
console.log(solveProblem());

/**
 * Solves the main problem, which involves finding the minimum width path
 * through a grid with obstacles.
 * @returns {number} The calculated minimum width.
 */
function solveProblem() {
  // Read the grid dimensions (height, width) and the total number of obstacles.
  const heightVal = inputReader.extractValue();
  const widthVal = inputReader.extractValue();
  const numObstacles = inputReader.extractValue();

  // Initialize a data structure to represent the grid and store obstacle locations.
  // It's an array of objects, allowing for sparse column representation.
  // Array size is heightVal + 1 for 1-based indexing of rows.
  let obstacleMap = Array(heightVal + 0x1) // Using hex literal for 1
    .fill(0)
    .map((element) => {
      return {};
    });

  // Populate the obstacle map with the provided obstacle coordinates.
  for (let obstacleIndex = 0; obstacleIndex < numObstacles; obstacleIndex++) {
    // Read the column and row for the current obstacle.
    // obstacleCoords[0] is column, obstacleCoords[1] is row.
    let obstacleCoords = inputReader.readLineValues();

    // If the obstacle's column is less than its row, it's considered invalid or irrelevant; skip it.
    if (obstacleCoords[0] < obstacleCoords[1]) {
      continue;
    }

    // Mark the obstacle's position in the map.
    // The row is obstacleCoords[1], and the column is obstacleCoords[0].
    obstacleMap[obstacleCoords[1]][obstacleCoords[0]] = 0x1; // Mark with 1
  }

  // Add a "boundary wall" obstacle at widthVal + 1 for every row.
  // This simplifies boundary checks in the pathfinding logic.
  for (let rowIdx = 0x1; rowIdx <= heightVal; rowIdx++) {
    obstacleMap[rowIdx][widthVal + 0x1] = 1; // Mark with 1
  }

  // Determine the initial minimum width based on the first row's obstacles.
  // Object.keys returns string keys, so convert to number before subtraction.
  let minWidth = Number(Object.keys(obstacleMap[1])[0]) - 1;

  // Initialize the current column position for path traversal, starting from column 2.
  let currentCol = 0x2; // Using hex literal for 2

  // Iterate through rows, starting from the second row, to find the narrowest path.
  // The loop continues as long as the current row is within the calculated minWidth and grid height.
  for (
    let rowIdx = 0x2;
    rowIdx <= minWidth && rowIdx <= heightVal;
    rowIdx++
  ) {
    // Advance currentCol past any obstacles in the current row.
    while (obstacleMap[rowIdx][currentCol]) {
      currentCol++;
    }

    // Iterate through the obstacles present in the current row.
    for (let colKey in obstacleMap[rowIdx]) {
      // Convert the column key (which is a string) to a numeric value.
      let currentObstacleCol = Number(colKey);

      // If the current search column has already passed this obstacle, skip it.
      if (currentCol > currentObstacleCol) {
        continue;
      }

      // If the path to this obstacle is narrower than the current minimum width, update minWidth.
      if (currentObstacleCol - 1 < minWidth) {
        minWidth = currentObstacleCol - 1;
      }
      // Once an obstacle is found that is not behind the current search column,
      // it defines the effective boundary for this row, so we can stop checking this row.
      break;
    }
    // Move the search column one step to the right for the next row.
    currentCol++;

    // If the current search column reaches or exceeds the total width,
    // it implies that the path has been constrained to the maximum possible extent,
    // so further iterations won't yield a smaller minWidth.
    if (currentCol >= widthVal) {
      break;
    }
  }

  // Return the final calculated minimum width.
  return minWidth;
}
