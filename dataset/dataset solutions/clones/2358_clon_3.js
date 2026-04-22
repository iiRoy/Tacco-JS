const readlineModule = require('readline');
const utilModule = require('util');

const inputOutputConfig = {
  input: process.stdin,
  output: process.stdout
};

let inputReader = readlineModule.createInterface(inputOutputConfig);
let dataProcessor;
let rawInputLines = [];

inputReader.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

inputReader.on('close', () => {
  dataProcessor = initializeDataStream(rawInputLines);
  executeCoreLogic();
});

/**
 * Creates a deep copy of a value. Handles Sets and plain objects/arrays.
 * Primitive values, null, and undefined are returned as-is.
 * @param {*} originalVal The value to copy.
 * @returns {*} A deep copy of the value, or the original if not an object or if cloning fails.
 */
function deepCopyValue(originalVal) {
  if (originalVal === null || typeof originalVal !== 'object') {
    return originalVal;
  }
  if (originalVal instanceof Set) {
    return new Set(Array.from(originalVal));
  }
  try {
    return JSON.parse(JSON.stringify(originalVal));
  } catch (e) {
    // Fallback for objects with circular references or non-JSON-serializable properties.
    // For competitive programming, JSON.parse(JSON.stringify) is often sufficient.
    logDebugInfo(`Warning: Failed to deep copy object via JSON.stringify due to: ${e.message}`);
    return originalVal;
  }
}

/**
 * Helper function to parse a value into a number.
 * @param {string} value The string to parse.
 * @returns {number} The parsed number, or 0 if parsing fails.
 */
const parseNumeric = (value) => {
  const parsed = Number(value);
  if (isNaN(parsed)) {
    // In competitive programming, input is usually guaranteed valid.
    // Returning 0 or throwing an error are common choices for robustness.
    logDebugInfo(`Warning: Could not parse '${value}' to a number. Returning 0.`);
    return 0;
  }
  return parsed;
};

// Renamed and slightly refactored input retrieval functions for clarity
function retrieveInteger() { return transformInput(getNextDataItem(), 'integer'); }
function retrieveStringArray() { return transformInput(getNextDataItem(), 'stringArray'); }
function retrieveIntegerArray() { return transformInput(getNextDataItem(), 'integerArray'); }
function retrieveCharacterArray() { return transformInput(getNextDataItem(), 'charArray'); }

/**
 * Retrieves the next item (line) from the data stream.
 * @returns {string} The next line of input.
 * @throws {Error} If no more input is available.
 */
function getNextDataItem() { return dataProcessor.fetchNextLine(); }

/**
 * Checks if there's more data to process in the stream.
 * @returns {boolean} True if more data, false otherwise.
 */
function hasMoreInputData() { return dataProcessor.hasMoreData(); }

/**
 * Initializes and returns a data stream object for convenient input access.
 * @param {string[]} inputLines An array of raw input strings.
 * @returns {object} An object with methods to check for more data and fetch the next line.
 * @throws {Error} If inputLines is not a non-empty array.
 */
function initializeDataStream(inputLines) {
  if (!Array.isArray(inputLines) || inputLines.length === 0) {
    throw new Error('Input lines must be a non-empty array to initialize the data stream.');
  }

  return {
    sourceData: inputLines,
    currentPosition: 0,
    totalLines: inputLines.length,

    hasMoreData: function() {
      return (this.currentPosition < this.totalLines);
    },

    fetchNextLine: function() {
      if (this.hasMoreData()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw new Error('EndOfInputException: Attempted to fetch data beyond available input lines.');
      }
    }
  };
}

/**
 * Prints a result to the standard output.
 * @param {*} data The data to be printed.
 */
function outputResult(data) {
  console.log(data);
}

/**
 * Logs detailed debug information to the standard error stream.
 * @param {*} message The message or object to debug.
 */
function logDebugInfo(message) {
  console.error('DEBUG_INFO:', utilModule.inspect(message, { showHidden: false, depth: null, colors: true }));
}

/**
 * Transforms an input string based on the specified conversion type.
 * @param {string} inputString The string to transform.
 * @param {string} conversionType The type of conversion (e.g., 'integer', 'stringArray', 'integerArray', 'charArray').
 * @returns {*} The converted value. Returns the original string if conversion fails or type is unknown.
 */
function transformInput(inputString, conversionType) {
  try {
    switch (conversionType) {
      case 'integer':
        return parseInt(inputString, 10); // Explicit radix for safety
      case 'stringArray':
        return inputString.split(' ');
      case 'integerArray':
        return inputString.split(' ').map(parseNumeric); // Uses the helper for robustness
      case 'charArray':
        return inputString.split('');
      default:
        logDebugInfo(`Warning: Unknown conversion type '${conversionType}'. Returning original string.`);
        return inputString;
    }
  } catch (conversionError) {
    logDebugInfo(`Error during input transformation for type '${conversionType}': ${conversionError.message}. Returning original string.`);
    return inputString;
  }
}

// --- Main Application Logic ---

/**
 * The primary function containing the core algorithm.
 * This function reads grid dimensions, two matrices,
 * and then computes the minimum possible absolute sum difference
 * using dynamic programming to find reachable sums.
 */
function executeCoreLogic() {
  // Retrieve grid dimensions from the first line of input
  const dimensions = retrieveIntegerArray();
  const gridHeight = dimensions[0];
  const gridWidth = dimensions[1];

  // Input validation for grid dimensions
  if (gridHeight <= 0 || gridWidth <= 0) {
    logDebugInfo(`Error: Invalid grid dimensions provided (Height: ${gridHeight}, Width: ${gridWidth}). Both must be positive.`);
    outputResult("Error: Invalid grid dimensions.");
    return; // Terminate execution for invalid input
  }

  // Initialize the first matrix (initialGridData)
  const initialGridData = Array.from({ length: gridHeight }, () => []);
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const currentRow = retrieveIntegerArray();
    if (currentRow.length !== gridWidth) {
      logDebugInfo(`Error: Row ${rowIndex} of first matrix has incorrect number of columns. Expected ${gridWidth}, got ${currentRow.length}.`);
      outputResult("Error: Malformed input matrix.");
      return;
    }
    initialGridData[rowIndex] = currentRow;
  }

  // Process the second matrix, calculating absolute differences with the first
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    const secondMatrixRow = retrieveIntegerArray();
    if (secondMatrixRow.length !== gridWidth) {
      logDebugInfo(`Error: Row ${rowIndex} of second matrix has incorrect number of columns. Expected ${gridWidth}, got ${secondMatrixRow.length}.`);
      outputResult("Error: Malformed input matrix.");
      return;
    }
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
      initialGridData[rowIndex][colIndex] = Math.abs(initialGridData[rowIndex][colIndex] - secondMatrixRow[colIndex]);
    }
  }

  // Define the maximum possible absolute sum value we need to track in the DP table.
  // This value (90 in the original) typically represents the upper bound of the
  // answer or the maximum sum index for the DP array. Any sums >= this are ignored.
  const maxTrackableSum = 90;

  // Initialize the dynamic programming table.
  // dynamicProgrammingTable[r][c][k] is true if sum 'k' is reachable at cell (r,c).
  const dynamicProgrammingTable = Array.from({ length: gridHeight }, () =>
    Array.from({ length: gridWidth }, () =>
      Array(maxTrackableSum).fill(false)
    )
  );

  // Set the initial state: the value at (0,0) is reachable at (0,0).
  const initialCellVal = initialGridData[0][0];
  if (initialCellVal >= 0 && initialCellVal < maxTrackableSum) {
    dynamicProgrammingTable[0][0][initialCellVal] = true;
  } else {
    logDebugInfo(`Warning: Initial cell value (${initialCellVal}) is outside trackable sum range [0, ${maxTrackableSum - 1}].`);
    // Depending on problem specifics, this might be an error or simply means no path is tracked.
  }

  // Iterate through the grid to fill the DP table for all cells.
  // We process row by row, column by column.
  for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {

      // Skip the starting cell as its base case is already handled above.
      if (rowIndex === 0 && colIndex === 0) {
        continue;
      }

      const currentCellValue = initialGridData[rowIndex][colIndex];

      // Helper function to update DP table for a given previous cell's state
      const propagateSums = (prevDPState) => {
        for (let prevSumValue = 0; prevSumValue < maxTrackableSum; prevSumValue++) {
          if (prevDPState[prevSumValue]) {
            const sumAfterAddition = prevSumValue + currentCellValue;
            const sumAfterSubtraction = Math.abs(prevSumValue - currentCellValue);

            // Only track sums that are within the defined `maxTrackableSum` range.
            if (sumAfterAddition < maxTrackableSum) {
              dynamicProgrammingTable[rowIndex][colIndex][sumAfterAddition] = true;
            }
            if (sumAfterSubtraction < maxTrackableSum) {
              dynamicProgrammingTable[rowIndex][colIndex][sumAfterSubtraction] = true;
            }
          }
        }
      };

      // Propagate reachable sums from the cell directly above (if applicable)
      if (rowIndex > 0) {
        propagateSums(dynamicProgrammingTable[rowIndex - 1][colIndex]);
      }

      // Propagate reachable sums from the cell directly to the left (if applicable)
      if (colIndex > 0) {
        propagateSums(dynamicProgrammingTable[rowIndex][colIndex - 1]);
      }
    }
  }

  // After filling the DP table, find the smallest absolute sum difference
  // that is reachable at the bottom-right cell (gridHeight-1, gridWidth-1).
  let minimumReachableSum = -1; // Initialize with an indicator for 'not found'

  for (let finalSumCandidate = 0; finalSumCandidate < maxTrackableSum; finalSumCandidate++) {
    if (dynamicProgrammingTable[gridHeight - 1][gridWidth - 1][finalSumCandidate]) {
      minimumReachableSum = finalSumCandidate;
      break; // Found the smallest positive sum, so we can stop.
    }
  }

  // Output the final result or an appropriate message if no path was found.
  if (minimumReachableSum !== -1) {
    outputResult(minimumReachableSum);
  } else {
    outputResult("No reachable sum found at the destination cell within the trackable range.");
    logDebugInfo("Algorithm completed, but no path led to a valid sum within the specified range at the target cell.");
  }
}