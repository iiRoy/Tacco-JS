// This section handles input acquisition from the standard stream.
const dataStream = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});
let parsedContent;
const receivedData = [];

dataStream.on('line', function(lineContent) {
  receivedData.push(lineContent);
});

dataStream.on('close', function() {
  parsedContent = setupInput(receivedData);
  console.error('\n↑ Input Data ↓ Program Output');
  mainRoutine();
});

// Utility function to create a deep copy of an object or Set.
function createCopy(originalData) {
  return (originalData instanceof Set)
    ? new Set(Array.from(originalData))
    : JSON.parse(JSON.stringify(originalData));
}

// Functions to retrieve and convert different data types from the input source.
function getInteger()        { return transformValue(fetchNext(), 1); }
function getStringArray()    { return transformValue(fetchNext(), 2); }
function getIntegerArray()   { return transformValue(fetchNext(), 4); }
function getCharacterArray() { return transformValue(fetchNext(), 6); }

// Core functions to interact with the input iterator.
function fetchNext()         { return parsedContent.retrieveNext(); }
function hasMoreInput()      { return parsedContent.canAdvance(); }

// Initializes an input iterator object from an array of strings.
function setupInput(sourceLines) {
  return {
    contentArray: sourceLines,
    readPosition: 0,
    totalCount: sourceLines.length,

    // Checks if there are more items to read.
    canAdvance: function() {
      return (this.readPosition < this.totalCount);
    },

    // Retrieves the next item and advances the read position.
    retrieveNext: function() {
      if (this.canAdvance()) {
        return this.contentArray[this.readPosition++];
      } else {
        throw 'EndOfInputReachedException - No more data available for processing.';
      }
    }
  };
}

// Outputs a string to the console.
function displayMessage(resultValue) {
  console.log(resultValue);
}

// Logs debug information to the standard error stream.
function logDebug(debugInfo) {
  console.error('DEBUG INFO: ' + require('util').inspect(debugInfo, false, null));
}

// This function processes an input value based on a specified conversion type.
// Conversion Type Key:
//   - Default or unknown: returns the input as is.
//   - 1: Parses to an integer.
//   - 2: Splits by space into a string array.
//   - 4: Splits by space and converts to an array of numbers.
//   - 6: Splits into an array of individual characters.
//   - 7: Splits into characters and converts each to a number.
//   - 8: Joins array elements with spaces.
//   - 9: Joins array elements with newlines.
//   - 0: Joins array elements without any separator.
function transformValue(itemToProcess, modeFlag) {
  try {
    switch (modeFlag) {
      case 1:  return parseInt(itemToProcess);
      case 2:  return itemToProcess.split(' ');
      case 4:  return itemToProcess.split(' ').map(Number);
      case 6:  return itemToProcess.split('');
      case 7:  return itemToProcess.split('').map(Number);
      case 8:  return itemToProcess.join(' ');
      case 9:  return itemToProcess.join('\n');
      case 0:  return itemToProcess.join('');
      default: return itemToProcess;
    }
  } catch (processingError) {
    return itemToProcess; // Fallback in case of conversion error
  }
}

// Main execution function for the program logic.
function mainRoutine() {
  const initialValues = getIntegerArray();
  const primaryValue = initialValues[0];
  const conversionBase = initialValues[1];
  displayMessage(primaryValue.toString(conversionBase).length);
}