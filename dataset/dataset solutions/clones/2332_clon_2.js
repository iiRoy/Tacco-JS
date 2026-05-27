var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var rawInputLines = [];

inputReader.on('line', function(inputLine) {
  rawInputLines.push(inputLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(rawInputLines);
  console.error('\n');
  var startTime = Date.now();
  executePrimaryLogic();
  var elapsedTime = Date.now() - startTime;
  logDebugInfo('execution time : ' + elapsedTime + 'ms');
  logDebugInfo('memory usage : ' + Math.round(process.memoryUsage().heapTotal / 1024) + 'KB');
});

function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function retrieveNextInteger() {
  return convertInputData(fetchNextToken(), 1);
}

function retrieveNextStringArray() {
  return convertInputData(fetchNextToken(), 2);
}

function retrieveNextIntegerArray() {
  return convertInputData(fetchNextToken(), 4);
}

function retrieveNextCharacterArray() {
  return convertInputData(fetchNextToken(), 6);
}

function fetchNextToken() {
  return inputProcessor.getNextLine();
}

function hasMoreTokens() {
  return inputProcessor.hasMoreData();
}

function initializeInputHandler(linesArray) {
  return {
    dataLines: linesArray,
    currentPosition: 0,
    totalLines: linesArray.length,
    hasMoreData: function() {
      return (this.currentPosition < this.totalLines);
    },
    getNextLine: function() {
      if (this.hasMoreData()) {
        return this.dataLines[this.currentPosition++];
      } else {
        throw 'InputExhaustedException - No more data available for processing.';
      }
    }
  };
}

function displayResult(outputValue) {
  console.log(outputValue);
}

function logDebugInfo(debugMessage) {
  console.error('debug_output:' + require('util').inspect(debugMessage, false, null));
}

// This function handles various input conversions based on the 'conversionType' parameter.
// conversionType:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and convert to numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to numbers.
// 8: Join array elements with spaces.
// 9: Join array elements with newlines.
// 0: Join array elements without any separator.
// Default: Return input as is.
function convertInputData(inputValue, conversionType) {
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
  } catch (error) {
    return inputValue;
  }
}

function executePrimaryLogic() {
  var totalElements = retrieveNextInteger();
  var elementSequence = retrieveNextIntegerArray();
  var removedCount = 0;
  var expectedValue = 1;

  for (var idx = 0; idx < totalElements; idx++) {
    if (elementSequence[idx] === expectedValue) {
      expectedValue++;
    } else {
      removedCount++;
    }
  }

  displayResult((removedCount === totalElements) ? -1 : removedCount);
}
