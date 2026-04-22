// Module for processing text input from standard stream
var inputProcessor = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);

var dataStream;
var capturedLines = [];

inputProcessor.on('line', function(currentLineText) {
  capturedLines.push(currentLineText);
});

inputProcessor.on('close', function() {
  dataStream = initializeStream(capturedLines);
  console.error('\n'); // Emit a newline for console clarity

  var startTimeStamp = Date.now();
  executeAlgorithm();
  var elapsedTime = Date.now() - startTimeStamp;

  logDiagnostic('Execution duration: ' + elapsedTime + 'ms');
  logDiagnostic('Memory consumption: ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

// Utility function for creating deep copies or set duplicates
function duplicateEntity(sourceObject) {
  return (sourceObject instanceof Set)
    ? new Set(Array.from(sourceObject))
    : JSON.parse(JSON.stringify(sourceObject));
}

function extractInteger()        { return transformValue(retrieveNextElement(), 1); }
function extractStringArray()    { return transformValue(retrieveNextElement(), 2); }
function extractIntegerArray()   { return transformValue(retrieveNextElement(), 4); }
function extractCharacterArray() { return transformValue(retrieveNextElement(), 6); }

function retrieveNextElement() { return dataStream.retrieveNextElement(); }
function hasMoreElements()     { return dataStream.hasMoreElements(); }

function initializeStream(inputCollection) {
  return {
    sourceData: inputCollection,
    currentPosition: 0,
    maximumCount: inputCollection.length,

    hasMoreElements: function() {
      return (this.currentPosition < this.maximumCount);
    },

    retrieveNextElement: function() {
      if (this.hasMoreElements()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw new Error('InputBufferExhausted: No further data available for processing.');
      }
    }
  };
}

function displayResult(messageContent) {
  console.log(messageContent);
}

function logDiagnostic(diagnosticMessage) {
  console.error('DIAGNOSTIC_INFO: ' + require('util').inspect(diagnosticMessage, false, null));
}

// This function converts an input value based on a specified conversionType.
// Possible conversion types:
// 1: Parse input as an integer.
// 2: Split input string by spaces into an array.
// 4: Split input string by spaces and convert elements to numbers.
// 6: Split input string into an array of characters.
// 7: Split input string into characters and convert them to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
// Default: Return input as is.
function transformValue(inputValue, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputValue, 10); // Added radix for best practice
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
  } catch (operationError) {
    // In case of conversion failure, return original value
    return inputValue;
  }
}

// Main processing routine for the problem
function executeAlgorithm() {
  var dimension = extractInteger();
  var initialSequence = extractIntegerArray();

  // Initialize a grid of size dimension*dimension
  var resultGrid = new Array(dimension * dimension);

  // First initialization pass
  for (var outerLoopVar = 0; outerLoopVar < dimension; outerLoopVar++) {
    resultGrid[initialSequence[outerLoopVar] - 1] = outerLoopVar + 1;
  }

  // Second pass: Fill in missing values and check for conflicts
  for (var currentVal = 2; currentVal <= dimension; currentVal++) {
    var remainingSlots = currentVal - 1;
    for (var gridIndex = 0; gridIndex < dimension * dimension; gridIndex++) {
      if (resultGrid[gridIndex] === null) { // Using strict equality for null check
        remainingSlots--;
        resultGrid[gridIndex] = currentVal;
        if (remainingSlots === 0) {
          break; // All required slots for currentVal filled
        }
      } else if (resultGrid[gridIndex] === currentVal) {
        displayResult("No"); // Conflict found
        return;
      }
    }
  }

  // Third pass: Another filling phase based on initial sequence
  for (var iterationIdx = 1; iterationIdx < dimension; iterationIdx++) {
    var neededCount = dimension - iterationIdx;
    for (var positionOffset = initialSequence[iterationIdx - 1]; positionOffset < dimension * dimension; positionOffset++) {
      if (resultGrid[positionOffset] === null) {
        neededCount--;
        resultGrid[positionOffset] = iterationIdx;
        if (neededCount === 0) {
          break; // All needed slots for iterationIdx filled
        }
      }
    }
  }

  // Final check for any unfilled slots
  for (var finalCheckIdx = 0; finalCheckIdx < dimension * dimension; finalCheckIdx++) {
    if (resultGrid[finalCheckIdx] === null) {
      displayResult("No"); // Unfilled slot found
      return;
    }
  }

  displayResult("Yes"); // All conditions met
  displayResult(transformValue(resultGrid, 8)); // Output the grid as a space-separated string
}