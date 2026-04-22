let inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStream;
let capturedLines = [];

inputProcessor.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

inputProcessor.on('close', () => {
  dataStream = initializeDataStream(capturedLines);
  console.error('\n');
  let startTime = Date.now();
  executePrimaryLogic();
  let elapsedTime = Date.now() - startTime;
  logError('execution_time : ' + elapsedTime + 'ms');
  logError('memory_usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

/**
 * Creates a duplicate of an object. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {object} sourceObject The object to copy.
 * @returns {object} A deep copy of the sourceObject.
 */
function deepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Reads the next available input item and parses it as an integer.
 * @returns {number} The next input item converted to an integer.
 */
function readInteger() {
  return convertData(fetchNext(), 1);
}

/**
 * Reads the next available input item and splits it into a string array.
 * @returns {string[]} The next input item split by spaces into a string array.
 */
function readStringArray() {
  return convertData(fetchNext(), 2);
}

/**
 * Reads the next available input item, splits it by spaces, and converts elements to numbers.
 * @returns {number[]} The next input item split by spaces and converted to an array of numbers.
 */
function readIntegerArray() {
  return convertData(fetchNext(), 4);
}

/**
 * Reads the next available input item and splits it into a character array.
 * @returns {string[]} The next input item split into an array of characters.
 */
function readCharacterArray() {
  return convertData(fetchNext(), 6);
}

/**
 * Retrieves the subsequent entry from the global data stream.
 * @returns {string} The next data entry.
 */
function fetchNext() {
  return dataStream.retrieveNextEntry();
}

/**
 * Checks if there are more entries available in the global data stream.
 * @returns {boolean} True if more entries exist, false otherwise.
 */
function canFetchMore() {
  return dataStream.hasMoreEntries();
}

/**
 * Sets up an object for sequential reading of input lines.
 * @param {string[]} inputLines An array of strings representing input lines.
 * @returns {object} An object with methods for reading input.
 */
function initializeDataStream(inputLines) {
  return {
    dataEntries: inputLines,
    currentEntryIndex: 0,
    totalEntries: inputLines.length,

    /**
     * Determines if there are additional entries to process.
     * @returns {boolean} True if more entries are available, false otherwise.
     */
    hasMoreEntries: function() {
      return (this.currentEntryIndex < this.totalEntries);
    },

    /**
     * Fetches the next entry from the list.
     * @returns {string} The next entry.
     * @throws {string} If no more entries are available.
     */
    retrieveNextEntry: function() {
      if (this.hasMoreEntries()) {
        return this.dataEntries[this.currentEntryIndex++];
      } else {
        throw 'InputOutOfBoundsError : All input lines have been consumed.';
      }
    }
  };
}

/**
 * Prints a value to the standard output.
 * @param {*} value The value to be printed.
 */
function printOutput(value) {
  console.log(value);
}

/**
 * Logs a debug message to the standard error stream.
 * @param {*} message The message or object to log.
 */
function logError(message) {
  console.error('debug_info:' + require('util').inspect(message, false, null));
}

/**
 * Converts an input value based on a specified type.
 *
 * @param {string|string[]} inputValue The value to be converted.
 * @param {number} conversionType The type of conversion to apply:
 *   1: Parse as integer.
 *   2: Split by spaces into an array of strings.
 *   4: Split by spaces and convert to an array of numbers.
 *   6: Split into an array of characters.
 *   7: Split into characters and convert to an array of numbers.
 *   8: Join array elements with spaces.
 *   9: Join array elements with newlines.
 *   0: Join array elements with no separator.
 *   (Any other value returns the input as is.)
 * @returns {*} The converted value.
 */
function convertData(inputValue, conversionType) {
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
    return inputValue; // Return original if conversion fails
  }
}

/**
 * The primary logic function for the application.
 * Solves a specific problem based on input.
 */
function executePrimaryLogic() {
  const inputNumber = readInteger();
  const hundredsPart = Math.floor(inputNumber / 100);
  const remainderPart = inputNumber % 100;

  if (inputNumber < 100) {
    printOutput(0);
    return;
  }

  if (remainderPart !== 0) {
    const requiredValue = Math.ceil(remainderPart / 5);
    if (hundredsPart >= requiredValue) {
      printOutput(1);
    } else {
      printOutput(0);
    }
  } else {
    printOutput(1);
  }
}