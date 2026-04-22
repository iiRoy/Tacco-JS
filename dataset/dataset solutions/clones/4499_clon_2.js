// This section handles input acquisition and initial setup.
var streamProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var dataSource;
var bufferedLines = [];

streamProcessor.on('line', function(incomingLine) {
  bufferedLines.push(incomingLine);
});

streamProcessor.on('close', function() {
  dataSource = setupProcessor(bufferedLines);
  console.error('\n↑Input ↓Output');
  executeProgram();
});

// Utility for creating deep copies of objects or sets.
function replicateItem(itemToCopy) {
  return (itemToCopy instanceof Set) ? new Set(Array.from(itemToCopy)) : JSON.parse(JSON.stringify(itemToCopy));
}

// Functions to retrieve and convert various input formats.
function fetchInteger() {
  return processInput(acquireNext(), 1);
}

function fetchStringList() {
  return processInput(acquireNext(), 2);
}

function fetchIntegerList() {
  return processInput(acquireNext(), 4);
}

function fetchCharCollection() {
  return processInput(acquireNext(), 6);
}

function acquireNext() {
  return dataSource.getNextElement();
}

function isAvailable() {
  return dataSource.hasMoreElements();
}

// Sets up the custom input accessor object.
function setupProcessor(incomingContent) {
  return {
    contentArray: incomingContent,
    currentPosition: 0,
    totalItems: incomingContent.length,
    hasMoreElements: function() {
      return (this.currentPosition < this.totalItems);
    },
    getNextElement: function() {
      if (this.hasMoreElements()) {
        return this.contentArray[this.currentPosition++];
      } else {
        throw 'InputOutOfBoundsException ‚ No further input available';
      }
    }
  };
}

// Displays the final program output.
function emitValue(dataToPrint) {
  console.log(dataToPrint);
}

// Logs diagnostic information for debugging purposes.
function debugInfo(diagnosticData) {
  console.error('trace:' + require('util').inspect(diagnosticData, false, null));
}

// This function handles various data transformations based on a specified type.
// The 'operationCode' parameter determines the conversion.
// 1: Parses to an integer.
// 2: Splits by space into a string array.
// 4: Splits by space and converts to a number array.
// 6: Splits into a character array.
// 7: Splits into characters and converts to a number array.
// 8: Joins array elements with spaces.
// 9: Joins array elements with newlines.
// 0: Joins array elements without separators.
// Default: Returns the input unchanged.
function processInput(itemToProcess, operationCode) {
  try {
    switch (operationCode) {
      case 1:
        return parseInt(itemToProcess);
      case 2:
        return itemToProcess.split(' ');
      case 4:
        return itemToProcess.split(' ').map(Number);
      case 6:
        return itemToProcess.split('');
      case 7:
        return itemToProcess.split('').map(Number);
      case 8:
        return itemToProcess.join(' ');
      case 9:
        return itemToProcess.join('\n');
      case 0:
        return itemToProcess.join('');
      default:
        return itemToProcess;
    }
  } catch (err) {
    return itemToProcess;
  }
}

// End of utility functions and input handling.
// The main application logic begins here.
function executeProgram() {
  var itemCount = fetchInteger();
  var dataSequence = fetchIntegerList();
  var processedElements = [];

  for (var elementIndex = 0; elementIndex < itemCount; elementIndex++) {
    if (itemCount % 2 == 0) {
      if (elementIndex % 2 == 0) {
        processedElements.push(dataSequence[elementIndex]);
      } else {
        processedElements.unshift(dataSequence[elementIndex]);
      }
    } else {
      if (elementIndex % 2 == 1) {
        processedElements.push(dataSequence[elementIndex]);
      } else {
        processedElements.unshift(dataSequence[elementIndex]);
      }
    }
  }
  emitValue(processInput(processedElements, 8));
}