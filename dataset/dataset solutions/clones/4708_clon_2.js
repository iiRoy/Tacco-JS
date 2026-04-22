let inputReader = require('readline').createInterface({
  inputStream: process.stdin,
  outputStream: process.stdout
});

let dataStore;
let receivedLines = [];

inputReader.addEventListener('line', (currentLine) => {
  receivedLines.push(currentLine);
});

inputReader.addEventListener('close', () => {
  dataStore = initializeParser(receivedLines);
  console.error('\n▲ Input ▼ Output'); // Informative message about input/output flow
  primaryProcess();
});

// Creates a deep copy of an object or a Set instance.
function duplicateObject(sourceObj) {
  return (sourceObj instanceof Set) ? new Set(Array.from(sourceObj)) : JSON.parse(JSON.stringify(sourceObj));
}

// Retrieves the next item from the data source and converts it to an integer.
function retrieveInteger() {
  return dataConverter(fetchNextItem(), 1);
}

// Retrieves the next item from the data source and converts it to a string array.
function retrieveStringArray() {
  return dataConverter(fetchNextItem(), 2);
}

// Retrieves the next item from the data source and converts it to an integer array.
function retrieveIntegerArray() {
  return dataConverter(fetchNextItem(), 4);
}

// Retrieves the next item from the data source and converts it to a character array.
function retrieveCharacterArray() {
  return dataConverter(fetchNextItem(), 6);
}

// Fetches the next available item from the data source.
function fetchNextItem() {
  return dataStore.fetchNextItem();
}

// Checks if there are more items available in the data source.
function hasMoreItems() {
  return dataStore.hasMoreItems();
}

// Initializes the data parser with the provided input.
function initializeParser(sourceData) {
  return {
    itemsList: sourceData,
    currentIndex: 0,
    maximumCount: sourceData.length,
    // Method to check if more items are available.
    hasMoreItems: function() {
      return (this.currentIndex < this.maximumCount);
    },
    // Method to retrieve the next item. Throws an error if no more items.
    fetchNextItem: function() {
      if (this.hasMoreItems()) {
        return this.itemsList[this.currentIndex++];
      } else {
        throw 'EndOfInputException: No further input available for processing.';
      }
    }
  };
}

// Displays the final computed result to the console.
function displayResult(messageContent) {
  console.log(messageContent);
}

// Logs debug information to the error stream.
function logDebugMessage(debugPayload) {
  console.error('DEBUG INFO: ' + require('util').inspect(debugPayload, false, null));
}

/**
 * Converts the input value based on the specified conversion type.
 * @param {any} inputValue - The value to be converted.
 * @param {number} conversionType - Specifies the conversion logic:
 *   1: Parse as integer.
 *   2: Split by space into string array.
 *   4: Split by space and parse each element as integer.
 *   6: Split into character array.
 *   7: Split into character array and parse each element as integer.
 *   8: Join array elements with space.
 *   9: Join array elements with newline.
 *   0: Join array elements without separator.
 *   Default: Return input as is.
 * @returns {any} The converted value.
 */
function dataConverter(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue);
      case 2:
        return inputValue.split(' ');
      case 4:
        return inputValue.split(' ').map(Number);
      case 6:
        return inputValue.split('');
      case 7:
        return inputValue.split('').map(Number);
      case 8:
        return inputValue.join(' ');
      case 9:
        return inputValue.join('\n');
      case 0:
        return inputValue.join('');
      default:
        return inputValue;
    }
  } catch (conversionError) {
    return inputValue; // Return original value on error
  }
}

// End of utility functions.
// -----------------------------------------------------------------------------------

// Main processing logic for the problem.
function primaryProcess() {
  const SHEEP_STATE = "S"; // Represents the 'Sheep' state
  const WOLF_STATE = "W";  // Represents the 'Wolf' state
  const OBSERVED_O = "o";  // Represents the 'o' observation in the input

  let sequenceLength = retrieveInteger();
  let initialState = SHEEP_STATE; // Initial assumption for the first character if needed
  let inputSequence = retrieveCharacterArray();
  let stateTracker = [SHEEP_STATE]; // Stores the deduced states for each position

  // Iterate through the input sequence to determine states
  for (let currentPosition = 0; currentPosition < sequenceLength; currentPosition++) {
    const currentObservation = inputSequence[currentPosition];
    const currentStateAtPosition = stateTracker[currentPosition];
    const previousState = (currentPosition > 0) ? stateTracker[currentPosition - 1] : undefined;

    if (currentObservation === OBSERVED_O) {
      // Logic branch for 'o' observation
      if (currentStateAtPosition === SHEEP_STATE) {
        if (currentPosition === 0) {
          stateTracker.push(initialState); // Use the global initial state for the first prediction
        } else {
          stateTracker.push(previousState);
        }
      } else { // currentStateAtPosition === WOLF_STATE
        if (previousState === SHEEP_STATE) {
          stateTracker.push(WOLF_STATE);
        } else {
          stateTracker.push(SHEEP_STATE);
        }
      }
    } else { // Logic branch for non-'o' observation (e.g., 'x')
      if (currentStateAtPosition === SHEEP_STATE) {
        if (currentPosition === 0) {
          stateTracker.push(WOLF_STATE);
        } else {
          if (previousState === SHEEP_STATE) {
            stateTracker.push(WOLF_STATE);
          } else {
            stateTracker.push(SHEEP_STATE);
          }
        }
      } else { // currentStateAtPosition === WOLF_STATE
        stateTracker.push(previousState);
      }
    }
  }

  // Check the final state and output the result
  if (stateTracker[sequenceLength] === initialState) {
    stateTracker.pop(); // Remove the last state, which is redundant for the output string
    displayResult(stateTracker.join(""));
  } else {
    displayResult(-1); // Indicate that no valid sequence matching the criteria was found
  }
}