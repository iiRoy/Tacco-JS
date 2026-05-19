var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputProcessor;
var inputLines = [];

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(inputLines);
  console.error('\n↑ Input ↓ Output');
  executeMainLogic();
});

function createDeepCopy(originalObject) {
  // Creates a deep copy of an object or Set.
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

function retrieveInteger() {
  return performTypeConversion(fetchNextInput(), 1);
}

function retrieveStringArray() {
  return performTypeConversion(fetchNextInput(), 2);
}

function retrieveIntegerArray() {
  return performTypeConversion(fetchNextInput(), 4);
}

function retrieveCharacterArray() {
  return performTypeConversion(fetchNextInput(), 6);
}

function fetchNextInput() {
  return inputProcessor.getNextEntry();
}

function hasMoreInput() {
  return inputProcessor.hasMoreEntries();
}

function initializeInputHandler(dataArray) {
  // Sets up an object to manage sequential access to input lines.
  return {
    sourceData: dataArray,
    currentPosition: 0,
    maximumEntries: dataArray.length,

    hasMoreEntries: function() {
      return (this.currentPosition < this.maximumEntries);
    },

    getNextEntry: function() {
      if (this.hasMoreEntries()) {
        return this.sourceData[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException: No further input available';
      }
    }
  };
}

function displayOutput(messageContent) {
  console.log(messageContent);
}

function logDebugMessage(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

// The 'conversionType' parameter dictates the transformation:
// 1: Parse as integer.
// 2: Split by space.
// 4: Split by space and convert to numbers.
// 6: Split into individual characters.
// 7: Split into individual characters and convert to numbers.
// 8: Join elements with spaces.
// 9: Join elements with newlines.
// 0: Join elements without any separator.
// Default: Return input as is.
function performTypeConversion(inputValue, conversionType) {
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

function executeMainLogic() {
  var countElements = retrieveInteger();
  var dataCollection = retrieveIntegerArray();

  dataCollection.sort(function(firstVal, secondVal) {
    return firstVal - secondVal;
  });

  var parentNodes = [];
  parentNodes.push(dataCollection.pop());

  for (var levelIndex = 1; levelIndex <= countElements; levelIndex++) {
    var childNodes = [];
    var numChildren = (1 << levelIndex); // Equivalent to 2^levelIndex

    for (var elementIndex = 0; elementIndex < numChildren; elementIndex++) {
      childNodes.push(dataCollection.pop());
    }

    for (var elementIndex = 0; elementIndex < childNodes.length; elementIndex++) {
      if (parentNodes[elementIndex] <= childNodes[elementIndex]) {
        displayOutput("No");
        return;
      }
    }
    parentNodes = parentNodes.concat(childNodes);
  }
  displayOutput("Yes");
}
