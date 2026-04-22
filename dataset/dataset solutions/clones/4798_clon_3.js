const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataProcessor;
const rawInputLines = [];

// Event handler for each line received
inputReader.on('line', (currentLine) => {
  rawInputLines.push(currentLine);
});

// Event handler for when input stream closes
inputReader.on('close', () => {
  // Initialize the data source once all input is gathered
  dataProcessor = createInputSource(rawInputLines);

  // Execute the primary application logic
  runMainApplication();
});

// Defines a simple input source object for sequential reading
function createInputSource(inputDataCollection) {
  return {
    inputDataCollection: inputDataCollection,
    currentReadIndex: 0,
    totalDataCount: inputDataCollection.length,

    // Checks if there are more items to read
    canAdvance: function() {
      return (this.currentReadIndex < this.totalDataCount);
    },

    // Fetches the next item from the input data
    fetchNextItem: function() {
      if (this.canAdvance()) {
        return this.inputDataCollection[this.currentReadIndex++];
      } else {
        throw new Error('InputError: No more data available to read.');
      }
    }
  };
}

// Utility functions for fetching specific data types
const CONV_TYPE_PARSE_INT = 1;
const CONV_TYPE_SPLIT_SPACE = 2;
const CONV_TYPE_MAP_NUMBERS = 4;
const CONV_TYPE_SPLIT_CHARS = 6;
const CONV_TYPE_MAP_CHAR_NUMBERS = 7;
const CONV_TYPE_JOIN_SPACE = 8;
const CONV_TYPE_JOIN_NEWLINE = 9;
const CONV_TYPE_JOIN_NONE = 0;

function retrieveNextInteger() { return processInputToken(getNextToken(), CONV_TYPE_PARSE_INT); }
function retrieveNextStringArray() { return processInputToken(getNextToken(), CONV_TYPE_SPLIT_SPACE); }
function retrieveNextIntegerArray() { return processInputToken(getNextToken(), CONV_TYPE_MAP_NUMBERS); }
function retrieveNextCharacterArray() { return processInputToken(getNextToken(), CONV_TYPE_SPLIT_CHARS); }

// Retrieves the next raw token from the data source
function getNextToken() { return dataProcessor.fetchNextItem(); }
// Checks if more tokens are available
function hasMoreTokens() { return dataProcessor.canAdvance(); }

// Logs output to standard output
function logOutput(message) { console.log(message); }
// Logs debug messages to standard error
function logDebugMessage(message) { console.error('DEBUG_INFO:', require('util').inspect(message, false, null)); }

// Converts an input token based on the specified conversion type
function processInputToken(tokenVal, conversionType) {
  try {
    switch (conversionType) {
      case CONV_TYPE_PARSE_INT: return parseInt(tokenVal, 10); // Base 10 for safety
      case CONV_TYPE_SPLIT_SPACE: return tokenVal.split(' ');
      case CONV_TYPE_MAP_NUMBERS: return tokenVal.split(' ').map(Number);
      case CONV_TYPE_SPLIT_CHARS: return tokenVal.split('');
      case CONV_TYPE_MAP_CHAR_NUMBERS: return tokenVal.split('').map(Number);
      case CONV_TYPE_JOIN_SPACE: return tokenVal.join(' ');
      case CONV_TYPE_JOIN_NEWLINE: return tokenVal.join('\n');
      case CONV_TYPE_JOIN_NONE: return tokenVal.join('');
      default: return tokenVal; // Return as-is if type is unknown
    }
  } catch (err) {
    logDebugMessage(`Conversion error for token: ${tokenVal}, type: ${conversionType}. Error: ${err.message}`);
    return tokenVal; // Fallback to original token on error
  }
}

// --- Core Application Logic ---

// Helper function to fill a segment of the grid with a specific value
// Returns true if filling is successful, false if a conflict occurs or not enough slots are found
function attemptGridSegmentFill(targetGrid, valueToPlace, slotsRequired, startIndex, endIndex, stepDirection) {
  let slotsFilledCount = 0;
  for (let cellIndex = startIndex; (stepDirection > 0 ? cellIndex < endIndex : cellIndex >= endIndex); cellIndex += stepDirection) {
    if (targetGrid[cellIndex] === null) {
      // Found an empty slot, place the value
      targetGrid[cellIndex] = valueToPlace;
      slotsFilledCount++;
      if (slotsFilledCount === slotsRequired) {
        return true; // All required slots for this value are filled
      }
    } else if (targetGrid[cellIndex] === valueToPlace) {
      // Conflict: The current value is already present in a cell we are trying to fill
      return false;
    }
    // If targetGrid[cellIndex] has a different value, just skip and continue
  }
  // If loop finishes and not all required slots were filled, it's a failure
  // Special case: if slotsRequired was 0, and no conflict occurred, it's a success
  return slotsFilledCount === slotsRequired;
}

// The primary function orchestrating the puzzle solution
function runMainApplication() {
  const gridDimension = retrieveNextInteger();
  const initialPlacementIndices = retrieveNextIntegerArray();

  // Validate initial inputs
  if (gridDimension <= 0 || initialPlacementIndices.length !== gridDimension) {
    logOutput("No");
    return;
  }

  const totalGridSize = gridDimension * gridDimension;
  // Initialize grid with nulls to represent empty cells
  const solutionGridCells = Array(totalGridSize).fill(null);

  // Phase 1: Place initial values based on input
  for (let iterIdx = 0; iterIdx < gridDimension; ++iterIdx) {
    const targetCellIdx = initialPlacementIndices[iterIdx] - 1; // Adjust to 0-based index

    // Basic bounds and conflict check for initial placements
    if (targetCellIdx < 0 || targetCellIdx >= totalGridSize || solutionGridCells[targetCellIdx] !== null) {
      logOutput("No");
      return;
    }
    solutionGridCells[targetCellIdx] = iterIdx + 1;
  }

  // Phase 2: Fill remaining cells with increasing values (from 2 up to gridDimension)
  // These values fill from the beginning of the grid
  for (let currentValue = 2; currentValue <= gridDimension; ++currentValue) {
    const requiredEmptySlots = currentValue - 1;
    if (!attemptGridSegmentFill(solutionGridCells, currentValue, requiredEmptySlots, 0, totalGridSize, 1)) {
      logOutput("No");
      return;
    }
  }

  // Phase 3: Fill remaining cells with decreasing values (from 1 up to gridDimension-1)
  // These values fill from the end of the grid, using a reverse iteration
  for (let currentValue = 1; currentValue < gridDimension; ++currentValue) {
    const requiredEmptySlots = gridDimension - currentValue;
    if (!attemptGridSegmentFill(solutionGridCells, currentValue, requiredEmptySlots, totalGridSize - 1, -1, -1)) {
      logOutput("No");
      return;
    }
  }

  // Final validation: Ensure all cells are filled
  for (const cellValue of solutionGridCells) {
    if (cellValue === null) {
      logOutput("No");
      return;
    }
  }

  // If all checks pass, the puzzle is solvable
  logOutput("Yes");
  logOutput(processInputToken(solutionGridCells, CONV_TYPE_JOIN_SPACE));
}