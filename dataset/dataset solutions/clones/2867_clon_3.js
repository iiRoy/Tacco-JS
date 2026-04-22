// This module provides a robust framework for competitive programming,
// including streamlined input processing, output handling, and debugging utilities.

// --- Core Configuration and Constants ---
const APPLICATION_NAME = "GridPathCalculator";
const DEBUG_LOG_PREFIX = "APP_DEBUG: ";
const CONVERSION_MODE = {
  TO_INTEGER: 1,
  SPLIT_STRING_BY_SPACE: 2,
  SPLIT_NUMBERS_BY_SPACE: 4,
  SPLIT_TO_CHARACTER_ARRAY: 6,
  SPLIT_TO_NUMBER_ARRAY_BY_CHAR: 7, // Not used in this specific problem, but kept for completeness
  JOIN_ARRAY_WITH_SPACE: 8,
  JOIN_ARRAY_WITH_NEWLINE: 9,
  JOIN_ARRAY_WITHOUT_DELIMITER: 0,
};
const GRID_EMPTY_CELL = '.';
const GRID_OBSTACLE_CELL = '#';

// --- Global Input/Output Infrastructure ---
let cliInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
let inputDataManager; // Holds the instantiated input reader
let collectedInputLines = []; // Temporary storage for all lines read from STDIN

// Event handler for each line received from standard input
cliInterface.on('line', function(singleLine) {
  collectedInputLines.push(singleLine);
});

// Event handler triggered when all input has been received (EOF)
cliInterface.on('close', function() {
  inputDataManager = createInputReader(collectedInputLines);
  applicationLog("--- Starting " + APPLICATION_NAME + " ---");
  const executionStartTime = process.hrtime.bigint(); // High-resolution timer for precise duration

  try {
    executeMainLogic(); // Invoke the primary application logic
  } catch (err) {
    applicationLog(`FATAL ERROR: An unhandled exception occurred during execution.`);
    applicationLog(`Error Message: ${err.message || String(err)}`);
    if (err.stack) {
      applicationLog(`Stack Trace:\n${err.stack}`);
    }
  } finally {
    const executionEndTime = process.hrtime.bigint();
    const durationInMs = Number(executionEndTime - executionStartTime) / 1_000_000; // Convert nanoseconds to milliseconds

    applicationLog("--- " + APPLICATION_NAME + " Finished ---");
    applicationLog(`Total Execution Time: ${durationInMs.toFixed(3)} ms`);

    const currentMemoryUsage = process.memoryUsage();
    applicationLog(`Memory Usage (Heap Allocated): ${Math.round(currentMemoryUsage.heapTotal / 1024)} KB`);
    applicationLog(`Memory Usage (Heap Used): ${Math.round(currentMemoryUsage.heapUsed / 1024)} KB`);
  }
});

// --- Input Accessor Functions ---

/**
 * Reads the next line from the input stream and parses it as an integer.
 * @returns {number} The parsed integer value.
 */
function getNextInteger() { return processInputData(retrieveNextLine(), CONVERSION_MODE.TO_INTEGER); }

/**
 * Reads the next line and splits it into an array of strings using space as delimiter.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() { return processInputData(retrieveNextLine(), CONVERSION_MODE.SPLIT_STRING_BY_SPACE); }

/**
 * Reads the next line, splits it by space, and converts each part to a number.
 * @returns {number[]} An array of numbers.
 */
function getNextIntegerArray() { return processInputData(retrieveNextLine(), CONVERSION_MODE.SPLIT_NUMBERS_BY_SPACE); }

/**
 * Reads the next line and converts it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() { return processInputData(retrieveNextLine(), CONVERSION_MODE.SPLIT_TO_CHARACTER_ARRAY); }

/**
 * Retrieves the next raw line string from the managed input data stream.
 * @returns {string} The next available line of input.
 */
function retrieveNextLine() { return inputDataManager.fetchNextLine(); }

/**
 * Checks if there are more lines remaining in the input stream.
 * @returns {boolean} True if more input lines are available, false otherwise.
 */
function checkMoreLinesExist() { return inputDataManager.hasMoreLines(); }

/**
 * Creates and returns an object responsible for managing sequential access to input lines.
 * @param {string[]} sourceArray - An array containing all raw input lines.
 * @returns {object} An object with methods for input line management.
 */
function createInputReader(sourceArray) {
  if (!Array.isArray(sourceArray)) {
    throw new TypeError("Input source for the reader must be an array of strings.");
  }

  const readerInstance = {
    allLines: sourceArray,
    currentPosition: 0,
    totalLineCount: sourceArray.length,

    /**
     * Determines if there are any lines left to read.
     * @returns {boolean} True if more lines are available, false otherwise.
     */
    hasMoreLines: function() {
      return (this.currentPosition < this.totalLineCount);
    },

    /**
     * Fetches the next line from the input source and advances the internal pointer.
     * Throws a RangeError if no more lines are available.
     * @returns {string} The next line content.
     */
    fetchNextLine: function() {
      if (!this.hasMoreLines()) {
        throw new RangeError("Input stream exhausted. Attempted to read beyond available lines.");
      }
      const lineToReturn = this.allLines[this.currentPosition];
      this.currentPosition++;
      return lineToReturn;
    }
  };
  return readerInstance;
}

// --- Output and Logging Utilities ---

/**
 * Outputs the given message to standard output, typically for final results.
 * @param {*} content - The content to be displayed.
 */
function displayResult(content) {
  console.log(content);
}

/**
 * Logs a debug message to standard error, including a timestamp and detailed inspection of data.
 * @param {*} dataToLog - The data structure or message to be logged for debugging.
 */
function applicationLog(dataToLog) {
  const currentTimestamp = new Date().toISOString();
  // Using inspect with `colors: true` for better readability in terminals
  console.error(`${currentTimestamp} ${DEBUG_LOG_PREFIX}${require("util").inspect(dataToLog, { showHidden: false, depth: null, colors: true })}`);
}

// --- Generic Input Processing Function ---

/**
 * Converts or processes an input value based on a specified conversion mode.
 * @param {*} valueToConvert - The input value to be processed.
 * @param {number} mode - The conversion mode, defined by `CONVERSION_MODE` constants.
 * @returns {*} The processed value. Returns original value on error or unknown mode.
 */
function processInputData(valueToConvert, mode) {
  try {
    switch (mode) {
      case CONVERSION_MODE.TO_INTEGER:
        return parseInt(valueToConvert, 10); // Always specify radix 10 for safety
      case CONVERSION_MODE.SPLIT_STRING_BY_SPACE:
        return String(valueToConvert).split(" ");
      case CONVERSION_MODE.SPLIT_NUMBERS_BY_SPACE:
        return String(valueToConvert).split(" ").map(Number);
      case CONVERSION_MODE.SPLIT_TO_CHARACTER_ARRAY:
        return String(valueToConvert).split("");
      case CONVERSION_MODE.SPLIT_TO_NUMBER_ARRAY_BY_CHAR:
        return String(valueToConvert).split("").map(Number);
      case CONVERSION_MODE.JOIN_ARRAY_WITH_SPACE:
        if (!Array.isArray(valueToConvert)) throw new TypeError("Input must be an array for join operations.");
        return valueToConvert.join(" ");
      case CONVERSION_MODE.JOIN_ARRAY_WITH_NEWLINE:
        if (!Array.isArray(valueToConvert)) throw new TypeError("Input must be an array for join operations.");
        return valueToConvert.join("\n");
      case CONVERSION_MODE.JOIN_ARRAY_WITHOUT_DELIMITER:
        if (!Array.isArray(valueToConvert)) throw new TypeError("Input must be an array for join operations.");
        return valueToConvert.join("");
      default:
        applicationLog(`Warning: Unknown conversion mode '${mode}'. Returning original value.`);
        return valueToConvert;
    }
  } catch (conversionError) {
    applicationLog(`Error encountered during input conversion (mode: ${mode}): ${conversionError.message}`);
    return valueToConvert; // Fallback: return the original value if conversion fails
  }
}

// --- Grid Cell Data Structure ---

/**
 * Defines the data structure for each cell within the grid.
 * It stores lengths of contiguous paths of empty cells extending from this cell.
 */
class GridCellMetrics {
  constructor() {
    this.downwardPathLength = 0;   // Length of '.' cells extending downwards from this cell.
    this.rightwardPathLength = 0;  // Length of '.' cells extending rightwards from this cell.
  }
}

// --- Main Application Logic ---
function executeMainLogic() {
  const dimensionsRawInput = getNextIntegerArray();

  // Input validation for grid dimensions
  if (!Array.isArray(dimensionsRawInput) || dimensionsRawInput.length !== 2) {
    throw new Error("Invalid grid dimensions input. Expected an array of two integers (Height, Width).");
  }

  const gridRows = dimensionsRawInput[0];
  const gridColumns = dimensionsRawInput[1];

  // Early exit for invalid grid sizes
  if (gridRows <= 0 || gridColumns <= 0) {
    applicationLog(`Note: Grid dimensions are non-positive (Rows: ${gridRows}, Columns: ${gridColumns}). Outputting 0.`);
    displayResult(0);
    return;
  }

  applicationLog(`Initializing grid for dimensions: ${gridRows}x${gridColumns}`);

  // Create two-dimensional arrays for character grid and cell metrics
  const characterGrid = Array.from({ length: gridRows });
  const cellMetricsGrid = Array.from({ length: gridRows }, () =>
    Array.from({ length: gridColumns }, () => new GridCellMetrics())
  );

  // First Pass: Populate character grid and calculate rightward path lengths (left-to-right)
  for (let r = 0; r < gridRows; r++) {
    characterGrid[r] = getNextCharacterArray(); // Read a row of characters into the grid

    for (let c = 0; c < gridColumns; c++) {
      if (characterGrid[r][c] === GRID_EMPTY_CELL) {
        // If current cell is empty, calculate the horizontal path length ending at this cell
        if (c === 0) {
          cellMetricsGrid[r][c].rightwardPathLength = 1;
        } else {
          // Extend path from the cell to the left
          cellMetricsGrid[r][c].rightwardPathLength = cellMetricsGrid[r][c - 1].rightwardPathLength + 1;
        }
      }
      // If the cell is an obstacle, rightwardPathLength remains its default of 0.
    }
  }

  // Second Pass: Calculate downward path lengths (top-to-bottom)
  for (let c = 0; c < gridColumns; c++) { // Iterate columns first, then rows
    for (let r = 0; r < gridRows; r++) {
      if (characterGrid[r][c] === GRID_EMPTY_CELL) {
        // If current cell is empty, calculate the vertical path length ending at this cell
        if (r === 0) {
          cellMetricsGrid[r][c].downwardPathLength = 1;
        } else {
          // Extend path from the cell above
          cellMetricsGrid[r][c].downwardPathLength = cellMetricsGrid[r - 1][c].downwardPathLength + 1;
        }
      }
      // If the cell is an obstacle, downwardPathLength remains its default of 0.
    }
  }

  // Third Pass: Propagate maximum rightward and downward path lengths (right-to-left, bottom-to-top)
  // This step ensures that `rightwardPathLength` at (r,c) stores the length of the longest horizontal
  // segment of empty cells that *starts* at (r,c) and extends rightwards. Similarly for `downwardPathLength`.
  for (let r = gridRows - 1; r >= 0; r--) {
    for (let c = gridColumns - 1; c >= 0; c--) {
      // Only process empty cells for propagation
      if (characterGrid[r][c] === GRID_EMPTY_CELL) {
        // Propagate horizontal length from the right neighbor
        if (c < gridColumns - 1) { // Check if not in the last column
          cellMetricsGrid[r][c].rightwardPathLength =
            Math.max(cellMetricsGrid[r][c].rightwardPathLength,
                     cellMetricsGrid[r][c + 1].rightwardPathLength);
        }
        // Propagate vertical length from the bottom neighbor
        if (r < gridRows - 1) { // Check if not in the last row
          cellMetricsGrid[r][c].downwardPathLength =
            Math.max(cellMetricsGrid[r][c].downwardPathLength,
                     cellMetricsGrid[r + 1][c].downwardPathLength);
        }
      }
    }
  }

  let largestPlusShapeSize = 0;

  // Final Pass: Calculate the maximum "plus" shape size across all cells
  for (let r = 0; r < gridRows; r++) {
    for (let c = 0; c < gridColumns; c++) {
      // Only consider empty cells as potential centers for a plus shape
      if (characterGrid[r][c] === GRID_EMPTY_CELL) {
        const currentCellMetrics = cellMetricsGrid[r][c];
        // The total number of cells in a plus shape is the sum of its horizontal and vertical
        // arm lengths, minus 1 because the center cell is counted in both.
        const calculatedPlusSize = currentCellMetrics.downwardPathLength + currentCellMetrics.rightwardPathLength - 1;

        if (calculatedPlusSize > largestPlusShapeSize) {
          largestPlusShapeSize = calculatedPlusSize;
        }
      }
    }
  }

  displayResult(largestPlusShapeSize);
}