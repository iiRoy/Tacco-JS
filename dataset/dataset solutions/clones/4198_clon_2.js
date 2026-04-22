const inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStore;
const receivedLines = [];

// Attaches an event listener to capture each line of incoming text.
inputReader.on('line', function(currentLineText) {
  receivedLines.push(currentLineText);
});

// Once all input has been read, this handler is triggered.
inputReader.on('close', () => {
  dataStore = initializeDataProcessor(receivedLines);
  console.error('\n*** Input parsing complete, commencing execution ***');
  executePrimaryLogic();
});

/**
 * Generates an independent copy of an object or Set structure.
 * @param {object|Set} originalObject - The data structure to be cloned.
 * @returns {object|Set} A new instance, a deep copy if JSON-serializable.
 */
function duplicateStructure(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Utility functions for fetching and converting input data types.
function retrieveInteger() {
  return dataTransformer(getNextElement(), 1);
}

function retrieveStringArray() {
  return dataTransformer(getNextElement(), 2);
}

function retrieveIntegerArray() {
  return dataTransformer(getNextElement(), 4);
}

function retrieveCharacterArray() {
  return dataTransformer(getNextElement(), 6);
}

function getNextElement() {
  return dataStore.next();
}

function hasMoreElements() {
  return dataStore.hasMoreElements();
}

/**
 * Prepares an object to manage sequential access to input lines.
 * @param {Array<string>} sourceLines - The collection of input strings.
 * @returns {object} An iterator-like object for input lines.
 */
function initializeDataProcessor(sourceLines) {
  return {
    elementList: sourceLines,
    currentIndex: 0,
    maximumElements: sourceLines.length,

    hasMoreElements: function() {
      return (this.currentIndex < this.maximumElements);
    },

    next: function() {
      if (this.hasMoreElements()) {
        return this.elementList[this.currentIndex++];
      } else {
        throw 'InputOutOfBoundsError: No further input tokens are available.';
      }
    }
  };
}

/**
 * Displays a provided message to the standard output stream.
 * @param {*} messageContent - The information to output.
 */
function displayOutput(messageContent) {
  console.log(messageContent);
}

/**
 * Emits a detailed debug message to the standard error stream.
 * @param {*} messageContent - The data to inspect and log.
 */
function logError(messageContent) {
  console.error('Debug Trace: ' + require('util').inspect(messageContent, false, null));
}

/**
 * Converts an input value based on a specified transformation code.
 * @param {*} inputValue - The value intended for conversion.
 * @param {number} transformationType - A numeric code indicating the desired conversion.
 *   - 1: Converts to a whole number.
 *   - 2: Splits a string by spaces into an array of strings.
 *   - 4: Splits a string by spaces and converts each part to a number.
 *   - 6: Splits a string into an array of individual characters.
 *   - 7: Splits a string into characters and converts each to a number.
 *   - 8: Joins array elements with a space character.
 *   - 9: Joins array elements with a newline character.
 *   - 0: Joins array elements without any separator.
 *   - Any other value: Returns the input value unchanged.
 * @returns {*} The result of the transformation or the original value if an error occurs.
 */
function dataTransformer(inputValue, transformationType) {
  try {
    switch (transformationType) {
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
  } catch (err) {
    return inputValue;
  }
}

// The core algorithm implementation starts here.
function executePrimaryLogic() {
  const firstInputLine = retrieveIntegerArray();
  const totalEntries = firstInputLine[0];
  const capacityLimit = firstInputLine[1];

  // Initialize an array, often used for difference array techniques or prefix sums.
  const frequencyArray = new Array(100005).fill(0);

  // Iterate through provided entries to update the frequency distribution.
  for (let idx = 0; idx < totalEntries; idx++) {
    const currentEntry = retrieveIntegerArray();
    frequencyArray[currentEntry[0]]++;
    frequencyArray[currentEntry[1] + 1]--;
  }

  let maximumOverlap = 1;

  // Compute prefix sums and determine the peak value within the array.
  for (let idx = 1; idx < 100005; idx++) {
    frequencyArray[idx] += frequencyArray[idx - 1];
    maximumOverlap = Math.max(maximumOverlap, frequencyArray[idx]);
  }

  // Present the final calculated result.
  displayOutput(maximumOverlap);
}