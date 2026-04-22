const inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataStream;
const capturedLines = [];

inputProcessor.on('line', (currentLine) => {
  capturedLines.push(currentLine);
});

inputProcessor.on('close', () => {
  dataStream = initializeDataSource(capturedLines);
  console.error('\n'); // Output a newline to error stream
  const operationStart = Date.now();
  ExecutePrincipalLogic();
  const elapsedDuration = Date.now() - operationStart;
  logDiagnostic(`time elapsed: ${elapsedDuration} ms`);
  logDiagnostic(`memory usage: ${Math.round(process.memoryUsage().heapTotal / 1024)} KB`);
});

/**
 * Creates a deep copy of an object. Handles Sets specifically, otherwise uses JSON serialization.
 * @param {any} sourceObject - The object to replicate.
 * @returns {any} A deep clone of the source object.
 */
function replicateObject(sourceObject) {
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

/**
 * Retrieves the next item from the data stream and converts it to an integer.
 * @returns {number} The next integer value.
 */
function retrieveInteger() { return transformValue(fetchNextItem(), 1); }

/**
 * Retrieves the next item from the data stream and converts it to a string array.
 * @returns {string[]} The next string array.
 */
function retrieveStringArray() { return transformValue(fetchNextItem(), 2); }

/**
 * Retrieves the next item from the data stream and converts it to an integer array.
 * @returns {number[]} The next integer array.
 */
function retrieveIntegerArray() { return transformValue(fetchNextItem(), 4); }

/**
 * Retrieves the next item from the data stream and converts it to a character array.
 * @returns {string[]} The next character array.
 */
function retrieveCharacterArray() { return transformValue(fetchNextItem(), 6); }

/**
 * Fetches the next available item from the data stream.
 * @returns {string} The next item as a string.
 */
function fetchNextItem() { return dataStream.fetchNextItem(); }

/**
 * Checks if there are more items available in the data stream.
 * @returns {boolean} True if more items exist, false otherwise.
 */
function hasMoreItems() { return dataStream.hasMoreItems(); }

/**
 * Initializes and returns a data source object for sequential access.
 * @param {string[]} rawInputArray - An array of raw input strings.
 * @returns {object} An object with methods for sequential data access.
 */
function initializeDataSource(rawInputArray) {
  return {
    sourceData: rawInputArray,
    currentPosition: 0,
    maximumLength: rawInputArray.length,

    hasMoreItems: function() {
      return (this.currentPosition < this.maximumLength);
    },

    fetchNextItem: function() {
      if (this.hasMoreItems()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'InputSequenceExhaustedError: No further input available';
      }
    }
  };
}

/**
 * Displays a message to the standard output.
 * @param {any} messageContent - The content to display.
 */
function displayResult(messageContent) {
  console.log(messageContent);
}

/**
 * Logs a diagnostic message to the standard error stream.
 * @param {any} diagnosticMessage - The message or object to log.
 */
function logDiagnostic(diagnosticMessage) {
  console.error('diagnostics: ' + require('util').inspect(diagnosticMessage, false, null));
}

/* Parameter 'conversionType' specifies the transformation:
 *   - Default/unrecognized: Returns 'itemToConvert' unchanged.
 *   - 1: Parses as an integer.
 *   - 2: Splits string by spaces.
 *   - 4: Splits by spaces and converts parts to numbers.
 *   - 6: Splits string into individual characters.
 *   - 7: Splits into characters and converts to numbers.
 *   - 8: Joins array elements with spaces.
 *   - 9: Joins array elements with newlines.
 *   - 0: Joins array elements without separator. */
function transformValue(itemToConvert, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(itemToConvert);
      case 2:
        return itemToConvert.split(' ');
      case 4:
        return itemToConvert.split(' ').map(Number);
      case 6:
        return itemToConvert.split('');
      case 7:
        return itemToConvert.split('').map(Number);
      case 8:
        return itemToConvert.join(' ');
      case 9:
        return itemToConvert.join('\n');
      case 0:
        return itemToConvert.join('');
      default:
        return itemToConvert;
    }
  } catch (exceptionError) {
    return itemToConvert; // Return original item on conversion error
  }
}

/**
 * This is the primary execution function for the program's logic.
 */
function ExecutePrincipalLogic() {
  const firstInputSet = retrieveIntegerArray();
  const upperBound = firstInputSet[0];
  const lowerBound = firstInputSet[1];
  const moduloConstant = 1000000007;
  let finalAccumulator = 0;

  for (let loopCounter = lowerBound; loopCounter <= upperBound + 1; loopCounter++) {
    const minimumSum = loopCounter * (loopCounter - 1) / 2;
    const maximumSum = upperBound * loopCounter - minimumSum;
    finalAccumulator += maximumSum - minimumSum + 1;
    finalAccumulator %= moduloConstant;
  }

  displayResult(finalAccumulator);
}