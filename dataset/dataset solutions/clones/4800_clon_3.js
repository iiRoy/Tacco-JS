// Module for handling standard input/output streams.
const ioStreamManager = require('readline').createInterface({
  input: process.stdin, // Direct input from the standard input channel.
  output: process.stdout // Direct output to the standard output channel.
});

// A dynamic array to accumulate all input lines received.
let collectedInputLines = [];
// An instantiated object that will manage access to parsed input data.
let dataTokenProvider = null;

/**
 * Event handler for each individual line read from the input stream.
 * Appends the received line to our collection.
 * @param {string} currentInputLine - The line of text read from stdin.
 */
ioStreamManager.on('line', (currentInputLine) => {
  collectedInputLines.push(currentInputLine);
});

/**
 * Event handler executed once the entire input stream has been closed.
 * This marks the readiness for processing all collected input.
 */
ioStreamManager.on('close', () => {
  // Initialize the data token provider with all collected input lines.
  dataTokenProvider = initializeInputParser(collectedInputLines);
  console.error('\n'); // Insert a blank line in the error console for readability.

  const executionStartTime = Date.now(); // Record the start time for performance measurement.
  executeMainProgramLogic(); // Invoke the primary application logic.
  const totalExecutionDuration = Date.now() - executionStartTime; // Calculate elapsed time.

  // Log performance metrics to the debug console.
  outputDebugMessage(`Operation time: ${totalExecutionDuration} milliseconds`);
  // Report memory usage, specifically 'heapUsed' for more relevant live memory consumption.
  const memoryUsageKB = Math.round(process.memoryUsage().heapUsed / 1024);
  outputDebugMessage(`Current memory footprint: ${memoryUsageKB} KB`);
});

/**
 * Creates a deep duplicate of a given value.
 * This function is included for Type III clone requirements (structural changes),
 * even if not directly used in the main algorithm.
 * @param {any} originalValue - The value to be duplicated.
 * @returns {any} A deep copy of the original value.
 */
function createDeepCopy(originalValue) {
  // Special handling for Set objects, creating a new Set from its elements.
  if (originalValue instanceof Set) {
    return new Set(Array.from(originalValue));
  }
  try {
    // Attempt to deep copy using JSON serialization/deserialization for generic objects/arrays.
    return JSON.parse(JSON.stringify(originalValue));
  } catch (serializationError) {
    // Log a warning if JSON serialization fails (e.g., due to circular references).
    outputDebugMessage(`Warning: Failed to create deep copy via JSON for object. Error: ${serializationError.message}`);
    return originalValue; // Return the original value as a fallback.
  }
}

/**
 * Retrieves and converts the next input token into an integer.
 * @returns {number} The next integer from the input.
 */
function getNextInteger() {
  return transformInputData(fetchNextInputToken(), 'parseInteger');
}

/**
 * Retrieves the next input token and splits it into an array of strings.
 * @returns {string[]} An array of strings.
 */
function getNextStringArray() {
  return transformInputData(fetchNextInputToken(), 'splitBySpace');
}

/**
 * Retrieves the next input token, splits it, and converts elements to integers.
 * @returns {number[]} An array of integers.
 */
function getNextIntegerArray() {
  return transformInputData(fetchNextInputToken(), 'splitAndParseIntegers');
}

/**
 * Retrieves the next input token and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
function getNextCharacterArray() {
  return transformInputData(fetchNextInputToken(), 'splitIntoChars');
}

/**
 * Fetches the next raw line (token) from the input data provider.
 * @returns {string} The next available input line.
 */
function fetchNextInputToken() {
  return dataTokenProvider.requestNextLine();
}

/**
 * Checks if there are more lines (tokens) available for processing.
 * @returns {boolean} True if more input is available, false otherwise.
 */
function hasMoreInputTokens() {
  return dataTokenProvider.checkHasMoreLines();
}

/**
 * Factory function to create an input parsing object.
 * This object manages the state of the input lines and the current reading position.
 * @param {string[]} availableInputLines - An array of all input lines collected.
 * @returns {object} An object with methods for input consumption.
 */
function initializeInputParser(availableInputLines) {
  let currentReadingPointer = 0; // Internal index to track the current line being read.
  const totalAvailableLines = availableInputLines.length; // Total number of lines.

  return {
    /**
     * Determines if there are still unprocessed lines in the input.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    checkHasMoreLines: function() {
      return currentReadingPointer < totalAvailableLines;
    },
    /**
     * Retrieves the next line from the input stream and advances the pointer.
     * @returns {string} The next line of input.
     * @throws {Error} If no more input lines are available.
     */
    requestNextLine: function() {
      if (this.checkHasMoreLines()) {
        return availableInputLines[currentReadingPointer++];
      } else {
        // Throw a specific error for out-of-bounds input access.
        throw new Error('Input stream exhausted. Attempted to read past the end of available lines.');
      }
    }
  };
}

/**
 * Outputs a message to the standard console.
 * @param {any} messageContent - The content to display.
 */
function displayStandardOutput(messageContent) {
  console.log(messageContent);
}

/**
 * Outputs a debug message to the standard error console.
 * @param {any} debugMessage - The message or data to log for debugging.
 */
function outputDebugMessage(debugMessage) {
  console.error(`[DEBUG_INFO]: ${debugMessage}`);
}

/**
 * A flexible utility function for transforming input data based on a specified mode.
 * Uses an object map for clearer transformation logic instead of a switch.
 * @param {string | string[]} inputData - The data to be transformed.
 * @param {string} transformationMode - A string indicating the desired transformation type.
 * @returns {any} The transformed data, or the original data if transformation fails.
 */
function transformInputData(inputData, transformationMode) {
  // Basic validation for null or undefined input.
  if (inputData === undefined || inputData === null) {
      outputDebugMessage(`Warning: Attempted to transform undefined/null value for mode '${transformationMode}'. Returning original.`);
      return inputData;
  }

  // Object mapping transformation modes to their respective functions.
  const modeHandlers = {
    'parseInteger': (val) => Number(val), // Converts string to number.
    'splitBySpace': (val) => String(val).split(' '), // Splits a string by spaces.
    'splitAndParseIntegers': (val) => String(val).split(' ').map(Number), // Splits and converts to numbers.
    'splitIntoChars': (val) => String(val).split(''), // Splits string into an array of characters.
    'joinWithSpaces': (val) => Array.isArray(val) ? val.join(' ') : String(val), // Joins array elements with spaces.
    'joinWithNewlines': (val) => Array.isArray(val) ? val.join('\n') : String(val), // Joins array elements with newlines.
    'joinWithoutSeparator': (val) => Array.isArray(val) ? val.join('') : String(val), // Joins array elements without separator.
    'default': (val) => val // Default handler returns the value unchanged.
  };

  const selectedHandler = modeHandlers[transformationMode] || modeHandlers['default'];
  try {
    return selectedHandler(inputData);
  } catch (errorDuringTransform) {
    outputDebugMessage(`Error occurred during data transformation for mode '${transformationMode}': ${errorDuringTransform.message}`);
    return inputData; // Return original data on any transformation error.
  }
}

/**
 * The main algorithmic logic of the program.
 * This function orchestrates reading input, performing calculations, and outputting results.
 */
function executeMainProgramLogic() {
  // Read the primary dimension (N) for the grid.
  const gridDimension = getNextInteger();

  // Input validation: Ensure the grid dimension is a positive integer.
  if (gridDimension <= 0 || !Number.isInteger(gridDimension)) {
    displayStandardOutput("Invalid input: Grid dimension must be a positive integer.");
    return; // Terminate if input is invalid.
  }

  // Read the initial permutation array.
  const initialPermutationSequence = getNextIntegerArray();

  // Validate the length of the initial permutation.
  if (initialPermutationSequence.length !== gridDimension) {
    displayStandardOutput("No"); // Output "No" for invalid input structure.
    outputDebugMessage(`Initial permutation array length mismatch. Expected ${gridDimension}, but received ${initialPermutationSequence.length}.`);
    return;
  }

  // Initialize the final result array. It will have N*N elements, initially all null.
  const finalGridArrangement = Array.from({ length: gridDimension * gridDimension }, () => null);

  // --- Phase 1: Populate the grid based on the initial permutation sequence. ---
  // Iterate through the initial sequence to place the first set of values.
  for (let currentIdx = 0; currentIdx < gridDimension; ++currentIdx) {
    const valueToPlace = initialPermutationSequence[currentIdx];

    // Validate the value to ensure it falls within the expected range of indices.
    if (valueToPlace < 1 || valueToPlace > gridDimension * gridDimension) {
        outputDebugMessage(`Error: Value ${valueToPlace} in initial permutation is out of bounds [1, ${gridDimension * gridDimension}].`);
        displayStandardOutput("No"); // Indicate failure due to invalid data.
        return;
    }
    // Place (currentIdx + 1) at the position indicated by (valueToPlace - 1)
    finalGridArrangement[valueToPlace - 1] = currentIdx + 1;
  }

  // --- Phase 2: Fill remaining empty slots iteratively with values from 2 to N. ---
  // This loop processes values that need to be filled into the grid.
  for (let currentFillingValue = 2; currentFillingValue <= gridDimension; ++currentFillingValue) {
    let slotsRequiredForCurrentValue = currentFillingValue - 1; // Number of slots to fill for the current value.

    // Iterate through every position in the final grid arrangement.
    for (let gridPosition = 0; gridPosition < gridDimension * gridDimension; ++gridPosition) {
      // If the current slot is empty (null), fill it.
      if (finalGridArrangement[gridPosition] === null) {
        finalGridArrangement[gridPosition] = currentFillingValue; // Assign the current filling value.
        slotsRequiredForCurrentValue--; // Decrement the count of slots still needed.
        // If all required slots for this value are filled, move to the next filling value.
        if (slotsRequiredForCurrentValue === 0) {
          break; // Exit inner loop.
        }
      } else if (finalGridArrangement[gridPosition] === currentFillingValue) {
        // Critical check: If the current filling value is already present in a non-null slot,
        // this indicates an invalid or impossible arrangement.
        displayStandardOutput("No"); // Output "No" and terminate the program.
        return;
      }
    }
    // Optional check: If after iterating through the entire grid, we still need to fill slots
    // for the current value, it means no valid arrangement can be formed.
    if (slotsRequiredForCurrentValue > 0) {
        outputDebugMessage(`Failed to place all required instances of value ${currentFillingValue}. Remaining: ${slotsRequiredForCurrentValue}.`);
        displayStandardOutput("No");
        return;
    }
  }

  // --- Phase 3: Fill any remaining null slots using a sequential pattern. ---
  // This array tracks how many slots are left for each sequential number (1 to N).
  // Each element `i` initially represents `N - 1 - i` available slots for `i+1`.
  const sequentialSlotTracker = Array.from({ length: gridDimension }, (_, index) => gridDimension - 1 - index);

  let currentSequentialNumber = 1; // The value to be used for sequential filling.
  let trackerArrayIndex = 0; // Index for accessing `sequentialSlotTracker`.

  // Iterate through the entire grid to find and fill any final null positions.
  for (let positionIndex = 0; positionIndex < gridDimension * gridDimension; ++positionIndex) {
    if (finalGridArrangement[positionIndex] === null) {
      finalGridArrangement[positionIndex] = currentSequentialNumber; // Assign the current sequential number.

      // Ensure we don't access `sequentialSlotTracker` out of bounds.
      if (trackerArrayIndex < sequentialSlotTracker.length) {
          sequentialSlotTracker[trackerArrayIndex]--; // Decrement the count for the current number.
          // If the count for the current sequential number reaches zero,
          // move to the next sequential number and its corresponding tracker entry.
          if (sequentialSlotTracker[trackerArrayIndex] === 0) {
              trackerArrayIndex++; // Advance to the next tracker entry.
              currentSequentialNumber++; // Increment the sequential number for subsequent fills.
          }
      } else {
          // This scenario implies that the `sequentialSlotTracker` has been exhausted,
          // but there are still nulls to fill. This might indicate a logical flaw
          // or a situation where the last `currentSequentialNumber` should continue filling.
          // For now, it will just keep filling with the last `currentSequentialNumber`.
          outputDebugMessage(`Warning: Sequential slot tracker exhausted, but nulls remain. Filling with ${currentSequentialNumber}.`);
      }
    }
  }

  // If the program reaches this point, a valid arrangement has been found.
  displayStandardOutput("Yes");
  // Output the final arrangement as a space-separated string.
  displayStandardOutput(transformInputData(finalGridArrangement, 'joinWithSpaces'));
}