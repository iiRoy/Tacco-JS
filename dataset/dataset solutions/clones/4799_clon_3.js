// A small collection of utilities for handling input/output and common operations.
// These are generally for internal use within the execution environment.

// Input processing setup using Node.js readline module
const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let collectedLines = []; // Array to store all incoming input lines
let dataContainer;       // Object responsible for managing input line iteration

// Event handler for each line received from standard input
inputProcessor.on('line', (currentLine) => {
  collectedLines.push(currentLine);
});

// Event handler for when the input stream closes (EOF reached)
inputProcessor.on('close', () => {
  dataContainer = initializeInputReader(collectedLines); // Prepare the data reader
  console.error('\n'); // Add a blank line for cleaner output separation in debug stream

  const startTime = performance.now(); // Utilize high-resolution timer for precision
  executeCoreLogic();                   // Initiate the main program logic
  const durationMs = performance.now() - startTime;

  logDebugInfo(`Execution Time: ${durationMs.toFixed(2)} ms`);
  // Log memory usage in a more user-friendly format (MegaBytes)
  logDebugInfo(`Memory Usage: ${(process.memoryUsage().heapTotal / (1024 * 1024)).toFixed(2)} MB`);
});

/**
 * Creates a deep clone of a given value.
 * Specifically handles Set objects, and falls back to JSON serialization for other types.
 * @param {*} originalValue - The value to be cloned.
 * @returns {*} A deep clone of the provided value.
 */
function deepValueCopy(originalValue) {
  if (originalValue instanceof Set) {
    return new Set(Array.from(originalValue));
  }
  // This method provides a common but limited deep copy; it will not handle functions, Dates,
  // BigInts, or circular references correctly. For typical data structures, it's often sufficient.
  try {
    return JSON.parse(JSON.stringify(originalValue));
  } catch (e) {
    // Log a warning if JSON serialization fails, e.g., due to unsupported types.
    console.warn("Warning: Failed to perform full deep copy for object:", originalValue, e);
    return originalValue; // In case of failure, return the original reference.
  }
}

/**
 * Retrieves and parses the next integer from the input stream.
 * @returns {number} The parsed integer value.
 */
function getNextInteger() {
  return transformInput(fetchNextToken(), 'parse_int');
}

/**
 * Retrieves the next line as an array of strings, split by spaces.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return transformInput(fetchNextToken(), 'split_space');
}

/**
 * Retrieves the next line as an array of numbers, split by spaces.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return transformInput(fetchNextToken(), 'split_space_and_int');
}

/**
 * Retrieves the next line as an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return transformInput(fetchNextToken(), 'split_char');
}

/**
 * Fetches the next raw line (token) from the input source and advances the reader's pointer.
 * @returns {string} The next available input line.
 */
function fetchNextToken() {
  return dataContainer.advancePointer();
}

/**
 * Checks if there are more input lines available to be read.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreInput() {
  return dataContainer.canAdvance();
}

/**
 * Initializes an object to facilitate sequential reading of input lines.
 * @param {string[]} sourceLines - An array of strings representing all input lines.
 * @returns {object} An object with methods to check for available input and advance through it.
 * @throws {Error} If the provided sourceLines is not an array.
 */
function initializeInputReader(sourceLines) {
  if (!Array.isArray(sourceLines)) {
    throw new Error('Input source must be an array of strings for initialization.');
  }

  // Internal state for the reader
  let currentPosition = 0;
  const totalLines = sourceLines.length;

  return {
    inputLines: sourceLines,   // Reference to the original array of lines
    position: 0,               // Current index of the line to be read next
    lineCount: totalLines,     // Total number of lines available in the input

    /**
     * Determines if there are still unread lines in the input.
     * @returns {boolean} True if `position` is less than `lineCount`, indicating more lines.
     */
    canAdvance: function() {
      return (this.position < this.lineCount);
    },

    /**
     * Retrieves the next line from the input and increments the position.
     * @returns {string} The line at the current `position`.
     * @throws {Error} If an attempt is made to read beyond the end of the input lines.
     */
    advancePointer: function() {
      if (this.canAdvance()) {
        return this.inputLines[this.position++];
      } else {
        throw new Error('End of input stream reached. No more lines can be read.');
      }
    }
  };
}

/**
 * Prints a message to standard output, typically for final results.
 * @param {*} message - The content to be displayed.
 */
function displayResult(message) {
  console.log(message);
}

/**
 * Prints a debug message to standard error, useful for diagnostics and tracing.
 * Uses `util.inspect` for detailed object representation.
 * @param {*} debugMessage - The information to log as a debug message.
 */
function logDebugInfo(debugMessage) {
  // `showHidden: false`, `depth: null` (infinite depth), `colors: true` for readability
  console.error('DEBUG_INFO: ' + require('util').inspect(debugMessage, { showHidden: false, depth: null, colors: true }));
}

/**
 * Transforms an input string or array based on a specified operation.
 * This function consolidates various parsing and joining operations.
 * @param {string|string[]} inputData - The data to apply the transformation to.
 * @param {string} operationType - A string key defining the transformation (e.g., 'parse_int', 'join_space').
 * @returns {*} The transformed data, or the original data if transformation fails or is unknown.
 */
function transformInput(inputData, operationType) {
  try {
    switch (operationType) {
      case 'parse_int':
        return parseInt(inputData, 10); // Always specify radix 10 for safety
      case 'split_space':
        return inputData.split(' ');
      case 'split_space_and_int':
        return inputData.split(' ').map(Number); // Converts to number, handles floats too
      case 'split_char':
        return inputData.split('');
      case 'split_char_and_int':
        return inputData.split('').map(Number);
      case 'join_space':
        return inputData.join(' ');
      case 'join_newline':
        return inputData.join('\n');
      case 'join_none':
        return inputData.join('');
      default:
        return inputData; // If no matching operation, return data untransformed
    }
  } catch (err) {
    // Log transformation errors but return the original data to avoid crashing the program.
    logDebugInfo(`Transformation error for operation '${operationType}': ${err.message}`);
    return inputData;
  }
}

// End of utility functions section.

// The primary execution block for the program.
// This function orchestrates the main algorithm to solve the puzzle.
function executeCoreLogic() {
  const dimensionSize = getNextInteger(); // Read the main dimension parameter N
  const initialPlacementIndices = getNextIntegerArray(); // Read the initial permutation list

  // --- Input Validation Guard Clauses ---
  if (dimensionSize <= 0 || !Number.isInteger(dimensionSize)) {
    displayResult("No");
    logDebugInfo(`Invalid dimension size provided: ${dimensionSize}. Must be a positive integer.`);
    return;
  }
  if (initialPlacementIndices.length !== dimensionSize) {
    displayResult("No");
    logDebugInfo(`Initial placement list length (${initialPlacementIndices.length}) does not match dimension size (${dimensionSize}).`);
    return;
  }

  // Initialize the grid representation. Using `undefined` explicitly for empty cells.
  // A 1D array simplifies indexing for an N*N grid.
  const gridCells = Array.from({ length: dimensionSize * dimensionSize }).fill(undefined);
  let possibleSolutionFound = true; // Flag to track the viability of a solution throughout phases

  // --- Phase 1: Populate cells based on the initial input ---
  // The input `initialPlacementIndices[idx]` provides a 1-based index for where `idx + 1` should be placed.
  for (let idx = 0; idx < dimensionSize; ++idx) {
    const targetCellIndex = initialPlacementIndices[idx] - 1; // Convert to 0-based array index
    const valueToPlace = idx + 1; // Values are 1-indexed (1 through N)

    // Robustness check: Ensure target index is within grid boundaries
    if (targetCellIndex < 0 || targetCellIndex >= gridCells.length) {
      logDebugInfo(`Error: Initial placement index ${targetCellIndex} (from input ${initialPlacementIndices[idx]}) is out of bounds.`);
      possibleSolutionFound = false;
      break;
    }

    // Conflict check: If a cell is already occupied, the initial state is invalid.
    if (gridCells[targetCellIndex] !== undefined) {
      logDebugInfo(`Error: Cell ${targetCellIndex} already occupied during initial placement for value ${valueToPlace}.`);
      possibleSolutionFound = false;
      break;
    }
    gridCells[targetCellIndex] = valueToPlace;
  }

  if (!possibleSolutionFound) {
    displayResult("No");
    return;
  }

  // --- Helper function to attempt filling a segment of the grid ---
  // This function encapsulates the common logic for filling a certain number of empty slots
  // with a specific value within a given range, while checking for conflicts.
  // Returns true if the required count was met without conflicts, false otherwise.
  const attemptFillSegment = (valueToAssign, startIdx, endIdx, requiredCount) => {
    let currentFillCount = 0;
    for (let k = startIdx; k < endIdx; ++k) {
      if (gridCells[k] === undefined) { // Check if the cell is currently empty
        gridCells[k] = valueToAssign;
        currentFillCount++;
        if (currentFillCount === requiredCount) {
          return true; // Successfully filled the required number of slots
        }
      } else if (gridCells[k] === valueToAssign) {
        // Critical conflict: The cell *already* contains the value we are trying to place.
        // This indicates an impossible scenario according to problem rules.
        logDebugInfo(`Conflict detected: Value ${valueToAssign} already at index ${k} during fill attempt.`);
        return false;
      }
      // If cell is occupied by a *different* value, we simply skip it and move to the next.
    }
    // If the loop completes, check if the required count of fills was actually met.
    // This catches cases where there weren't enough empty slots in the segment.
    return currentFillCount === requiredCount;
  };

  // --- Phase 2: Fill remaining cells based on increasing values (from 2 up to N) ---
  // For each value `currentVal` from 2 to N, `N-1` additional slots need to be filled.
  for (let currentVal = 2; currentVal <= dimensionSize; ++currentVal) {
    const neededSlots = dimensionSize - 1; // Each value (2 to N) needs N-1 instances in total (one already placed implicitly)
    if (!attemptFillSegment(currentVal, 0, gridCells.length, neededSlots)) {
      possibleSolutionFound = false;
      break; // Exit early if a conflict or insufficient slots are found
    }
  }

  if (!possibleSolutionFound) {
    displayResult("No");
    return;
  }

  // --- Phase 3: Fill remaining cells based on decreasing values (from N-1 down to 1) ---
  // This phase seems to fill `dimensionSize - currentVal` instances of `currentVal`
  // starting from an index derived from `initialPlacementIndices[currentVal-1]`.
  // The original loop was `for(var i = 1; i < N; i++)`, which translates to `currentVal` from 1 to N-1.
  for (let currentVal = 1; currentVal < dimensionSize; ++currentVal) {
    const slotsToFill = dimensionSize - currentVal;
    // `initialPlacementIndices[currentVal - 1]` provides a 1-based starting position from input.
    const startingInputIndex = initialPlacementIndices[currentVal - 1];

    // Validate the starting index obtained from input
    if (startingInputIndex === undefined || startingInputIndex < 1 || startingInputIndex > gridCells.length) {
       logDebugInfo(`Error: Invalid starting point for phase 3: ${startingInputIndex} for value ${currentVal}.`);
       possibleSolutionFound = false;
       break;
    }

    // Convert the 1-based input index to a 0-based array index for `attemptFillSegment`.
    if (!attemptFillSegment(currentVal, startingInputIndex - 1, gridCells.length, slotsToFill)) {
      possibleSolutionFound = false;
      break; // Exit early if a conflict or insufficient slots are found
    }
  }

  if (!possibleSolutionFound) {
    displayResult("No");
    return;
  }

  // --- Final Validation: Ensure all cells in the grid are filled ---
  // This loop acts as a final safeguard against any missed conditions or under-filling.
  for (let k = 0; k < gridCells.length; ++k) {
    if (gridCells[k] === undefined) {
      logDebugInfo(`Error: Unfilled cell found at index ${k} during final validation.`);
      possibleSolutionFound = false;
      break; // An empty cell means no valid solution
    }
  }

  // --- Output the final result ---
  if (possibleSolutionFound) {
    displayResult("Yes");
    // Format the output array by joining elements with spaces as required.
    displayResult(transformInput(gridCells, 'join_space'));
  } else {
    displayResult("No");
  }
}