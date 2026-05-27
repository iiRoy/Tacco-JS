var inputProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataHandler;
var inputLines = [];

inputProcessor.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputProcessor.on('close', function() {
  dataHandler = initializeInputHandler(inputLines);
  console.error('\n'); // Output a newline to stderr

  var startTime = Date.now();
  executeProcessing();
  var endTime = Date.now() - startTime;

  logDebugMessage('execution time : ' + endTime + 'ms');
  logDebugMessage('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

// Creates a deep copy of an object or Set.
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger() {
  return transformInput(fetchNextItem(), 1);
}

function retrieveStringArray() {
  return transformInput(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
  return transformInput(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
  return transformInput(fetchNextItem(), 6);
}

function fetchNextItem() {
  return dataHandler.getNextEntry();
}

function hasMoreItems() {
  return dataHandler.checkAvailability();
}

function initializeInputHandler(sourceInput) {
  return {
    sourceData: sourceInput,
    currentPosition: 0,
    maximumEntries: sourceInput.length,

    checkAvailability: function() {
      return (this.currentPosition < this.maximumEntries);
    },

    getNextEntry: function() {
      if (this.checkAvailability()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

function displayResult(outputContent) {
  console.log(outputContent);
}

function logDebugMessage(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

// Utility for converting input based on a specified format code.
// Format codes:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and parse as integers.
// 6: Split into individual characters.
// 7: Split into characters and parse as integers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without separator.
// Default: Return input as is.
function transformInput(inputVal, conversionType) {
  try {
    switch (conversionType) {
      case 1:
        return parseInt(inputVal);
      case 2:
        return inputVal.split(' ');
      case 4:
        return inputVal.split(' ').map(Number);
      case 6:
        return inputVal.split('');
      case 7:
        return inputVal.split('').map(Number);
      case 8:
        return inputVal.join(' ');
      case 9:
        return inputVal.join('\n');
      case 0:
        return inputVal.join('');
      default:
        return inputVal;
    }
  } catch (error) {
    return inputVal;
  }
}

function executeProcessing() {
  var dimensionSize = retrieveInteger();
  var initialSequence = retrieveIntegerArray();
  var resultGrid = new Array(dimensionSize * dimensionSize);

  // Populate initial positions based on the input sequence
  for (var outerLoopIndex = 0; outerLoopIndex < dimensionSize; outerLoopIndex++) {
    resultGrid[initialSequence[outerLoopIndex] - 1] = outerLoopIndex + 1;
  }

  // Fill in remaining slots from left to right for increasing values
  for (var outerLoopIndex = 2; outerLoopIndex <= dimensionSize; outerLoopIndex++) {
    var remainingSlots = outerLoopIndex - 1;
    for (var innerLoopIndex = 0; innerLoopIndex < dimensionSize * dimensionSize; innerLoopIndex++) {
      if (resultGrid[innerLoopIndex] == null) {
        remainingSlots--;
        resultGrid[innerLoopIndex] = outerLoopIndex;
        if (remainingSlots == 0) {
          break;
        }
      } else if (resultGrid[innerLoopIndex] == outerLoopIndex) {
        displayResult("No");
        return;
      }
    }
  }

  // Fill in remaining slots from right to left for decreasing values
  for (var outerLoopIndex = 1; outerLoopIndex < dimensionSize; outerLoopIndex++) {
    var remainingSlots = dimensionSize - outerLoopIndex;
    for (var innerLoopIndex = dimensionSize * dimensionSize - 1; innerLoopIndex >= 0; innerLoopIndex--) {
      if (resultGrid[innerLoopIndex] == null) {
        remainingSlots--;
        resultGrid[innerLoopIndex] = outerLoopIndex;
        if (remainingSlots == 0) {
          break;
        }
      } else if (resultGrid[innerLoopIndex] == outerLoopIndex) {
        displayResult("No");
        return;
      }
    }
  }

  // Final check for any unfilled slots
  for (var outerLoopIndex = 0; outerLoopIndex < dimensionSize * dimensionSize; outerLoopIndex++) {
    if (resultGrid[outerLoopIndex] == null) {
      displayResult("No");
      return;
    }
  }

  displayResult("Yes");
  displayResult(transformInput(resultGrid, 8));
}
