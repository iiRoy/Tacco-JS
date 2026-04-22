var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataStore;
var capturedLines = [];

// Event handler for each line of input
inputReader.on('line', function(singleLineInput) {
  capturedLines.push(singleLineInput);
});

// Event handler for when input stream closes
inputReader.on('close', function() {
  dataStore = initializeInputProcessor(capturedLines);
  console.error('\n*** Input Processed, Output Follows ***');
  processSequence(); // Execute the main application logic
});

/**
 * Creates a deep clone of a value. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {any} originalValue - The value to be cloned.
 * @returns {any} A deep copy of the original value.
 */
function deepCopyValue(originalValue) {
  // Ensure we don't try to clone null or undefined
  if (originalValue === null || typeof originalValue === 'undefined') {
    return originalValue;
  }
  // Handle Set objects by converting to array and back to Set
  if (originalValue instanceof Set) {
    return new Set(Array.from(originalValue));
  }
  // For other serializable objects/primitives, use JSON serialization
  return JSON.parse(JSON.stringify(originalValue));
}

/**
 * Retrieves the next item from the input stream as an integer.
 * @returns {number} The next integer from input.
 */
function retrieveNumericItem() {
  return transformInput(fetchNextEntry(), 1);
}

/**
 * Retrieves the next item from the input stream as an array of strings (space-separated).
 * @returns {string[]} An array of strings.
 */
function retrieveStringArray() {
  return transformInput(fetchNextEntry(), 2);
}

/**
 * Retrieves the next item from the input stream as an array of integers (space-separated).
 * @returns {number[]} An array of integers.
 */
function retrieveNumericArray() {
  return transformInput(fetchNextEntry(), 4);
}

/**
 * Retrieves the next item from the input stream as an array of characters.
 * @returns {string[]} An array of characters.
 */
function retrieveCharacterArray() {
  return transformInput(fetchNextEntry(), 6);
}

/**
 * Fetches the next raw string entry from the input processor.
 * @returns {string} The next raw input string.
 */
function fetchNextEntry() {
  return dataStore.fetchNextEntry();
}

/**
 * Checks if there are more entries available in the input stream.
 * @returns {boolean} True if more entries exist, false otherwise.
 */
function hasFurtherEntries() {
  return dataStore.hasFurtherEntries();
}

const OUT_OF_BOUNDS_ERROR = 'InputStreamException: No more entries available in the input buffer.';

/**
 * Initializes an object to process an array of input strings.
 * @param {string[]} inputLines - An array of strings representing the input.
 * @returns {object} An object with methods to navigate the input.
 */
function initializeInputProcessor(inputLines) {
  return {
    sourceData: inputLines,
    currentPosition: 0,
    totalEntries: inputLines.length,

    /**
     * Determines if there are unprocessed entries remaining.
     * @returns {boolean} True if more input exists, false otherwise.
     */
    hasFurtherEntries: function() {
      return (this.currentPosition < this.totalEntries);
    },

    /**
     * Retrieves the next available input entry.
     * @returns {string} The next string from the input.
     * @throws {string} If no more input is available.
     */
    fetchNextEntry: function() {
      if (this.hasFurtherEntries()) {
        const nextValue = this.sourceData[this.currentPosition];
        this.currentPosition++; // Advance the pointer after retrieval
        return nextValue;
      } else {
        throw OUT_OF_BOUNDS_ERROR;
      }
    }
  };
}

/**
 * Outputs a message to the standard console.
 * @param {string | number} message - The message to display.
 */
function outputResult(message) {
  console.log(message);
}

/**
 * Logs a debug message to the error console, including detailed inspection.
 * @param {any} debugInfo - The data to inspect and log.
 */
function logDebugMessage(debugInfo) {
  console.error('DEBUG_INFO: ' + require('util').inspect(debugInfo, false, null, true));
}

/**
 * Transforms an input value based on a specified type.
 * @param {string | string[]} inputValue - The input to transform.
 * @param {number} transformationType - The type of transformation to apply.
 *   - 1: Parse as integer.
 *   - 2: Split string by space into array of strings.
 *   - 4: Split string by space and map to array of numbers.
 *   - 6: Split string into array of characters.
 *   - 7: Split string by character and map to array of numbers.
 *   - 8: Join array elements with space.
 *   - 9: Join array elements with newline.
 *   - 0: Join array elements without separator.
 * @returns {any} The transformed value.
 */
function transformInput(inputValue, transformationType) {
  // Guard against null/undefined input values
  if (inputValue === null || typeof inputValue === 'undefined') {
    return inputValue;
  }

  try {
    switch (transformationType) {
      case 1:
        return parseInt(inputValue, 10); // Always specify radix for parseInt
      case 2:
        return String(inputValue).split(' ');
      case 4:
        const spaceSeparatedNumbers = String(inputValue).split(' ');
        return spaceSeparatedNumbers.map(Number);
      case 6:
        return String(inputValue).split('');
      case 7:
        const charSeparatedNumbers = String(inputValue).split('');
        return charSeparatedNumbers.map(Number);
      case 0:
        if (Array.isArray(inputValue)) return inputValue.join('');
        return String(inputValue);
      case 8:
        if (Array.isArray(inputValue)) return inputValue.join(' ');
        return String(inputValue);
      case 9:
        if (Array.isArray(inputValue)) return inputValue.join('\n');
        return String(inputValue);
      default:
        return inputValue; // Return original if no specific transformation type is matched
    }
  } catch (err) {
    // In case of any parsing or splitting error, return the original value
    logDebugMessage(`Transformation error for type ${transformationType}: ${err.message}`);
    return inputValue;
  }
}

// Main application logic begins here
function processSequence() {
  const sequenceLength = retrieveNumericItem();
  const initialStateMarker = "S"; // Represents a 'Sheep' state
  const alternativeStateMarker = "W"; // Represents a 'Wolf' state

  // Early exit for invalid sequence lengths
  if (sequenceLength < 1) {
    outputResult("INVALID_LENGTH");
    return;
  }

  const inputSymbols = retrieveCharacterArray(); // E.g., ["o", "x", "o"]
  // The state tracker holds the determined animal type for each position (S or W)
  // Initialize with the first two states, which are fixed for the problem's logic.
  const stateTracker = [initialStateMarker, initialStateMarker];

  // Iterate through the sequence to determine the animal types
  // The loop starts from the second element (index 1) as the first is pre-initialized.
  // It iterates up to (but not including) sequenceLength, calculating stateTracker[i+1].
  for (let currentIdx = 1; currentIdx < sequenceLength; ++currentIdx) {
    const currentInputSymbol = inputSymbols[currentIdx];
    const previousState = stateTracker[currentIdx - 1];
    const currentStateAssumption = stateTracker[currentIdx]; // This is essentially the animal at currentIdx

    let nextCalculatedState; // Determine the animal type for the next position (currentIdx + 1)

    // Check if the current symbol indicates 'observing' (o) or 'not observing' (x)
    const isObserving = (currentInputSymbol === "o");

    if (isObserving) {
      // If observing:
      // If current animal is a Sheep ('S'), the next animal must be the same as the previous one.
      // If current animal is a Wolf ('W'), the next animal must be the opposite of the previous one.
      if (currentStateAssumption === initialStateMarker) {
        nextCalculatedState = previousState;
      } else { // currentStateAssumption === alternativeStateMarker
        nextCalculatedState = (previousState === initialStateMarker) ? alternativeStateMarker : initialStateMarker;
      }
    } else {
      // If not observing:
      // If current animal is a Sheep ('S'), the next animal must be the opposite of the previous one.
      // If current animal is a Wolf ('W'), the next animal must be the same as the previous one.
      if (currentStateAssumption === initialStateMarker) {
        nextCalculatedState = (previousState === initialStateMarker) ? alternativeStateMarker : initialStateMarker;
      } else { // currentStateAssumption === alternativeStateMarker
        nextCalculatedState = previousState;
      }
    }
    stateTracker.push(nextCalculatedState); // Add the determined state for the next position
  }

  // Debugging output for the full calculated sequence, including the N+1th element
  logDebugMessage("Full calculated sequence: " + stateTracker.join(""));

  // The problem requires checking the N+1th element's consistency with the initial state
  // and then outputting the first N elements if consistent.
  const finalCalculatedState = stateTracker[sequenceLength]; // This is the N+1th element in 0-indexed array

  // If the N+1th element matches the initial state marker, it's a valid cycle.
  if (finalCalculatedState === initialStateMarker) {
    // Remove the N+1th element as it's only for validation, not part of the N-length output.
    stateTracker.splice(sequenceLength, 1); // Remove 1 element at index 'sequenceLength'
    outputResult(stateTracker.join("")); // Output the resulting sequence
  } else {
    // If the N+1th element does not match, no valid sequence was found.
    outputResult(-1); // Indicate no solution
  }
}