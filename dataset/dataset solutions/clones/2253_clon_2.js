"use strict"
;
// This module provides a utility for parsing input data from a string.
var INPUT_HANDLER=(
  function()
  {
    /**
     * Creates a new input reader instance.
     * @param {string} inputStringData - The raw string data to parse.
     * @returns {InputReader} A new InputReader object.
     */
    function createInputReader ( inputStringData )
    {
      return new InputReader(inputStringData);
    }

    /**
     * Constructor for InputReader objects.
     * @param {string} inputStringData - The raw string data.
     */
    function InputReader ( inputStringData )
    {
      this._sourceLines = inputStringData .trim() .split ( "\n" ) ;
      this._linePointer = 0;
    }

    /**
     * Fetches a single item from the current line.
     * Items are read from right to left (last word first).
     * Moves to the next line if the current one is exhausted.
     * @param {boolean} asString - If true, returns the item as a string; otherwise, as a number.
     * @returns {string|number} The fetched item.
     */
    InputReader.prototype.fetchSingleItem =
      function( asString )
      {
        var lineData = this._sourceLines,
            lineIdx = this._linePointer,
            extractedValue;

        if ( typeof lineData[lineIdx] === "string" )
        {
          lineData[lineIdx] = lineData[lineIdx].split(" ").reverse();
        }
        extractedValue = lineData[lineIdx].pop();

        if ( !lineData[lineIdx].length )
        {
          this._linePointer++;
        }

        return asString ? extractedValue : +extractedValue;
      };

    /**
     * Fetches all items from the current line.
     * Moves the line pointer to the next line.
     * @param {boolean} keepStrings - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array of items from the line.
     */
    InputReader.prototype.fetchLineItems =
      function( keepStrings )
      {
        var lineContent = this._sourceLines[this._linePointer++].split(" ");
        return keepStrings ? lineContent : lineContent.map( itemText => +itemText );
      };

    /**
     * Fetches a matrix (2D array) of items.
     * Moves the line pointer by `numRows`.
     * @param {number} numRows - The number of rows to read for the matrix.
     * @param {boolean} preserveTypes - If true, returns items as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} The matrix of items.
     */
    InputReader.prototype.fetchMatrix =
      function( numRows, preserveTypes )
      {
        var resultMatrix =
          this._sourceLines
            .slice(this._linePointer, this._linePointer += numRows)
            .map(rowString => rowString.split(" "));

        return preserveTypes ? resultMatrix : resultMatrix.map(row => row.map(cell => +cell));
      };

    /**
     * Fetches multiple lines of data.
     * Moves the line pointer by `lineCount`.
     * @param {number} lineCount - The number of lines to read.
     * @param {boolean} stringMode - If true, returns lines as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} An array of lines.
     */
    InputReader.prototype.fetchMultiLines =
      function( lineCount, stringMode )
      {
        var collectedLines =
          this._sourceLines.slice(this._linePointer, this._linePointer += lineCount);

        return stringMode ? collectedLines : collectedLines.map(lineEntry => +lineEntry);
      };

    return createInputReader;
  }
)();

// Initialize the data processor by reading from standard input.
var dataProcessor = INPUT_HANDLER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array with a specified fill value.
 * @param {*} initialFillValue - The value to fill the innermost array with.
 * @param {...number} dimensions - The dimensions of the array (e.g., d1, d2, d3).
 * @returns {Array} The newly created multi-dimensional array.
 */
function makeMultiDimArray(initialFillValue)
{
  var argsList = arguments,
      argCount = argsList.length,
      arrayCreationString =
        "Array(argsList[" + --argCount + "]).fill(0).map(x=>{return " + initialFillValue + ";})";

  while (--argCount)
  {
    arrayCreationString = "Array(argsList[" + argCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }

  return eval(arrayCreationString);
}

// Global variables for grid dimensions, grid data, and distance map.
var distanceMap, gridHeight, gridWidth, gridCells;

// Execute the main solver function and print its result.
console.log(executeSolver());

/**
 * Main function to solve the problem.
 * Reads grid dimensions, processes the grid, and finds the maximum distance.
 * @returns {number} The maximum calculated distance.
 */
function executeSolver()
{
  gridHeight = dataProcessor.fetchSingleItem();
  gridWidth = dataProcessor.fetchSingleItem();
  gridCells = dataProcessor.fetchMultiLines(gridHeight, 1);

  var maxDistance = 0;

  // Iterate through each cell of the grid.
  for (var rowIdx = 0; rowIdx < gridHeight; rowIdx++)
  {
    for (var colIdx = 0; colIdx < gridWidth; colIdx++)
    {
      // If a cell is a '.' (empty space), start a BFS-like calculation from it.
      if (gridCells[rowIdx][colIdx] === ".")
      {
        calculateDistances(rowIdx, colIdx);

        // After calculating distances for one starting point, find the maximum in the distance map.
        for (var iterRow = 0; iterRow < gridHeight; iterRow++)
        {
          for (var iterCol = 0; iterCol < gridWidth; iterCol++)
          {
            if (maxDistance < distanceMap[iterRow][iterCol])
            {
              maxDistance = distanceMap[iterRow][iterCol];
            }
          }
        }
      }
    }
  }

  return maxDistance;
}

/**
 * Performs a Breadth-First Search (BFS) to calculate distances from a starting point (startRow, startCol).
 * Updates the global `distanceMap` with the distances.
 * @param {number} startRow - The starting row index.
 * @param {number} startCol - The starting column index.
 */
function calculateDistances(startRow, startCol)
{
  // Initialize the distance map with -1 (unvisited).
  distanceMap = makeMultiDimArray(-1, gridHeight, gridWidth);
  distanceMap[startRow][startCol] = 0; // Starting point has distance 0.

  var currentLevelQueue = [startRow, startCol]; // Queue for BFS traversal.
  var currentDistance = 1; // Current distance level.

  // Continue BFS as long as there are cells to visit in the current level.
  while (currentLevelQueue.length)
  {
    var nextLevelQueue = []; // Queue for the next level's cells.

    // Process all cells in the current level.
    while (currentLevelQueue.length)
    {
      // Dequeue coordinates (x, y) - note the order of pop.
      var currentX = currentLevelQueue.pop(),
          currentY = currentLevelQueue.pop();

      // Check left neighbor.
      if (currentX && distanceMap[currentY][currentX - 1] === -1 && gridCells[currentY][currentX - 1] === ".")
      {
        distanceMap[currentY][currentX - 1] = currentDistance;
        nextLevelQueue.push(currentY, currentX - 1);
      }
      // Check right neighbor.
      if (currentX < gridWidth - 1 && distanceMap[currentY][currentX + 1] === -1 && gridCells[currentY][currentX + 1] === ".")
      {
        distanceMap[currentY][currentX + 1] = currentDistance;
        nextLevelQueue.push(currentY, currentX + 1);
      }
      // Check top neighbor.
      if (currentY && distanceMap[currentY - 1][currentX] === -1 && gridCells[currentY - 1][currentX] === ".")
      {
        distanceMap[currentY - 1][currentX] = currentDistance;
        nextLevelQueue.push(currentY - 1, currentX);
      }
      // Check bottom neighbor.
      if (currentY < gridHeight - 1 && distanceMap[currentY + 1][currentX] === -1 && gridCells[currentY + 1][currentX] === ".")
      {
        distanceMap[currentY + 1][currentX] = currentDistance;
        nextLevelQueue.push(currentY + 1, currentX);
      }
    }

    currentDistance++; // Increment distance for the next level.
    currentLevelQueue = nextLevelQueue; // Move to the next level.
  }
}