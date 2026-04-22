var SOURCE_PROCESSOR = ( function () {
  /**
   * Factory function to create an input data processor.
   * @param {string} sourceInput - The raw input string containing multiple lines.
   * @returns {ContentBuffer} An instance of the ContentBuffer for data extraction.
   */
  function initializeProcessor (sourceInput) {
    return new ContentBuffer(sourceInput);
  }

  /**
   * Represents a buffer for processing line-oriented input data.
   * Provides methods to extract various data types from the buffered lines.
   * @param {string} initialString - The full content string to be processed.
   */
  function ContentBuffer (initialString) {
    // Stores individual lines from the input string.
    this._textLines = initialString.trim().split("\n");
    // Pointer to the current line being read.
    this._lineIndex = 0;
  }

  /**
   * Extracts a single value from the current line.
   * If the line is exhausted, it moves to the next.
   * @param {boolean} [returnRaw=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The extracted value.
   */
  ContentBuffer.prototype.getValue = function (returnRaw) {
    var lineCollection = this._textLines,
      currentPointer = this._lineIndex,
      extractedItem;

    // If the current line hasn't been processed into an array of tokens yet, do so.
    // It's reversed so `pop()` can simulate reading from the beginning.
    if ( typeof lineCollection[currentPointer] === 'string' ) {
      lineCollection[currentPointer] = lineCollection[currentPointer].split(' ').reverse();
    }
    extractedItem = lineCollection[currentPointer].pop();

    // If the current line is now empty, advance to the next line.
    if ( !lineCollection[currentPointer].length ) {
      this._lineIndex++;
    }
    // Return the item, optionally parsed as a number.
    return returnRaw ? extractedItem : +extractedItem;
  };

  /**
   * Reads the entire current line, splits it by spaces, and returns the tokens.
   * Automatically advances the line pointer.
   * @param {boolean} [keepStrings=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  ContentBuffer.prototype.getTokens = function (keepStrings) {
    var lineParts = this._textLines[this._lineIndex++].split(' ');
    // Map to numbers if not keeping as strings.
    return keepStrings ? lineParts : lineParts.map( item => +item );
  };

  /**
   * Reads a specified number of lines and processes them into a 2D array (matrix).
   * Each line is split by spaces.
   * @param {number} numRows - The number of lines to read for the matrix.
   * @param {boolean} [preserveTypes=false] - If true, keeps matrix elements as strings; otherwise, converts to numbers.
   * @returns {Array<Array<string|number>>} The extracted matrix data.
   */
  ContentBuffer.prototype.getMatrix = function (numRows, preserveTypes) {
    var matrixData = this._textLines.slice(this._lineIndex, this._lineIndex += numRows)
                     .map( rowStr => rowStr.split(' ') );
    // Convert all elements to numbers if not preserving types.
    return preserveTypes ? matrixData : matrixData.map( row => row.map( val => +val ) );
  };

  /**
   * Reads a specified number of lines without further processing.
   * @param {number} blockLength - The number of raw lines to retrieve.
   * @param {boolean} [asStrings=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of raw line contents.
   */
  ContentBuffer.prototype.getRawBlock = function (blockLength, asStrings) {
    var rawLines = this._textLines.slice(this._lineIndex, this._lineIndex += blockLength);
    // Convert to numbers if not keeping as strings.
    return asStrings ? rawLines : rawLines.map( lineContent => +lineContent );
  };

  // Return the factory function to create processor instances.
  return initializeProcessor;
} )();

// Create an instance of the input data reader by parsing standard input.
var dataStreamReader = SOURCE_PROCESSOR(require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" }));

// Output the result of the main computation.
console.log(computePath());

/**
 * Main function to solve the pathfinding problem.
 * Calculates the minimum clearance required.
 * @returns {number} The calculated minimum clearance.
 */
function computePath() {
  // Read board dimensions and number of obstacles.
  var boardHeight = dataStreamReader.getValue();
  var boardWidth = dataStreamReader.getValue();
  var totalBlocks = dataStreamReader.getValue();

  // Initialize the obstacle map (grid).
  // Using an array of objects to simulate sparse 2D grid with object keys as column indices.
  var obstacleMap = Array(boardHeight + 1);
  for (var rowIterator = 0; rowIterator <= boardHeight; rowIterator++) {
    obstacleMap[rowIterator] = {};
    // Place a sentinel value at boardWidth + 1 to simplify boundary checks.
    obstacleMap[rowIterator][boardWidth + 1] = 1;
  }

  // Populate the obstacle map with block positions.
  for (rowIterator = 0; rowIterator < totalBlocks; rowIterator++) {
    var blockPosition = dataStreamReader.getTokens(); // [col, row]
    obstacleMap[blockPosition[1]][blockPosition[0]] = 1; // Mark obstacle at (col, row)
  }

  // Initialize minimum clearance with the first obstacle in row 1.
  // Object.keys returns string keys, so convert to number.
  var minimumClearance = (Object.keys(obstacleMap[1])[0] - 1);
  var currentScanCol = 2; // Start scanning from column 2 (as 1 is typically the start).

  // Iterate through rows from the second row onwards.
  for (rowIterator = 2; rowIterator <= boardHeight; rowIterator++) {
    // Find the first clear column in the current row.
    while (obstacleMap[rowIterator][currentScanCol]) {
      currentScanCol++;
    }

    // Optimization: If the current clear column is already beyond the best found clearance,
    // further search in this path won't yield a better result.
    if (currentScanCol > minimumClearance) {
      break;
    }

    // Iterate through obstacles in the current row to potentially update minimumClearance.
    for (const obstacleKey in obstacleMap[rowIterator]) {
      const obstacleCol = +obstacleKey; // Convert the column key to a number.

      // If the obstacle is to the left of the current scanning column, it's irrelevant for this path.
      if (currentScanCol > obstacleCol) {
        continue;
      }

      // If this obstacle provides a tighter clearance than the current minimum, update it.
      // (obstacleCol - 1) represents the clearance just before the obstacle.
      if ((obstacleCol - 1) < minimumClearance) {
        minimumClearance = (obstacleCol - 1);
      }
      // Once the first relevant obstacle is found for this row (from left to right),
      // we can stop checking further obstacles in this row for this column path.
      break;
    }
    // Advance the scanning column for the next row.
    currentScanCol++;
  }
  // Return the final calculated minimum clearance.
  return minimumClearance;
}