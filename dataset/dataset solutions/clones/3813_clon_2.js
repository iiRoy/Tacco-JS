// This initial block configures input handling and provides essential utility functions.
var lineProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputSource;
var receivedLines = [];

lineProcessor.on('line', function(textSegment) {
  receivedLines.push(textSegment);
});

lineProcessor.on('close', function() {
  inputSource = prepareData(receivedLines);
  console.error('\n'); // Insert a new line in the error console for readability

  const measurementStart = Date.now();
  executeProgram();
  const durationMillis = Date.now() - measurementStart;

  logDebugInfo('execution time : ' + durationMillis + 'ms');
  logDebugInfo('memory footprint : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

// Creates a deep copy of an object or a Set.
function createCopy(originalItem) {
  return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

// Reads the next input item and converts it to an integer.
function getNumericValue() {
  return transformValue(retrieveNext(), 1);
}

// Reads the next input item and splits it into a string array.
function getStringTokens() {
  return transformValue(retrieveNext(), 2);
}

// Reads the next input item, splits it, and converts parts to an integer array.
function getNumericTokens() {
  return transformValue(retrieveNext(), 4);
}

// Reads the next input item and splits it into a character array.
function getCharTokens() {
  return transformValue(retrieveNext(), 6);
}

// Fetches the subsequent input segment from the source.
function retrieveNext() {
  return inputSource.fetchNextItem();
}

// Checks if there are more input segments available.
function canAdvance() {
  return inputSource.hasMoreData();
}

// Initializes the input data parser with the collected lines.
function prepareData(sourceLines) {
  return {
    sourceLines: sourceLines,
    parseIndex: 0,
    totalSegments: sourceLines.length,
    hasMoreData: function() {
      return (this.parseIndex < this.totalSegments);
    },
    fetchNextItem: function() {
      if (this.hasMoreData()) {
        return this.sourceLines[this.parseIndex++];
      } else {
        throw new Error('End of input reached. No more data segments available.');
      }
    }
  };
}

// Prints the provided content to standard output.
function displayResult(content) {
  console.log(content);
}

// Outputs debug information to the error stream.
function logDebugInfo(message) {
  console.error('trace:' + require('util').inspect(message, false, null));
}

// This function processes input strings based on a specified operation code.
// The 'operationCode' parameter dictates the transformation:
// 1: Parses the input to an integer.
// 2: Splits the input string by spaces into an array of strings.
// 4: Splits the input string by spaces and maps each part to a number, returning an array of integers.
// 6: Splits the input string into an array of individual characters.
// 7: Splits the input string into individual characters and maps each to a number, returning an array of integers.
// 8: Joins array elements with a space character.
// 9: Joins array elements with a newline character.
// 0: Joins array elements without any separator.
// Default: Returns the input value unchanged if the operationCode is not recognized.
function transformValue(itemToConvert, operationCode) {
  try {
    switch (operationCode) {
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
  } catch (errorInstance) {
    // If any conversion fails, return the original item.
    return itemToConvert;
  }
}

// The core algorithm for solving the problem.
function executeProgram() {
  const arraySize = getNumericValue();
  const elementCounts = new Array(arraySize + 1).fill(0);
  let maximumLength = 0;

  for (let elementIndex = 0; elementIndex < arraySize; elementIndex++) {
    const parsedValue = getNumericValue();
    elementCounts[parsedValue] = elementCounts[parsedValue - 1] + 1;
    maximumLength = Math.max(maximumLength, elementCounts[parsedValue]);
  }

  displayResult(arraySize - maximumLength);
}