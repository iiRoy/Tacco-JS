var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var dataStream;
var inputBuffer = [];

inputReader.on('line', function(lineContent) {
  inputBuffer.push(lineContent);
});

inputReader.on('close', function() {
  dataStream = initializeStream(inputBuffer);
  console.error('\n↑入力 ↓出力'); // Debug message, must remain unchanged
  executeLogic();
});

// Utility function to create a deep copy of objects or Sets
function duplicateObject(originalItem) {
  return (originalItem instanceof Set) ? new Set(Array.from(originalItem)) : JSON.parse(JSON.stringify(originalItem));
}

// Helper functions for input parsing
function retrieveInteger() {
  return convertInput(fetchNextItem(), 1);
}

function retrieveStringArray() {
  return convertInput(fetchNextItem(), 2);
}

function retrieveIntegerArray() {
  return convertInput(fetchNextItem(), 4);
}

function retrieveCharacterArray() {
  return convertInput(fetchNextItem(), 6);
}

function fetchNextItem() {
  return dataStream.advanceAndGet();
}

function hasMoreItems() {
  return dataStream.canAdvance();
}

// Initializes the input stream object
function initializeStream(inputLines) {
  return {
    sourceList: inputLines,
    currentPosition: 0,
    maxLength: inputLines.length,
    canAdvance: function() {
      return (this.currentPosition < this.maxLength);
    },
    advanceAndGet: function() {
      if (this.canAdvance()) {
        return this.sourceList[this.currentPosition++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Error message, must remain unchanged
      }
    }
  };
}

// Outputs a string to standard output
function printResult(outputString) {
  console.log(outputString);
}

// Outputs a debug message to standard error
function logDebug(debugContent) {
  console.error('debug:' + require('util').inspect(debugContent, false, null));
}

/*
 * param "conversionType" is
 * unknown or outlier : return i. 1: parseInt.
 * 2: split space. 4: split space and parseInt.
 * 6: split 1 character. 7: split 1 character and parseInt.
 * 8: join space. 9: join nextline. 0: join no character.
 */
function convertInput(inputValue, conversionType) {
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

// Main program logic
function executeLogic() {
  var countVal = retrieveInteger();
  var numSequence = retrieveIntegerArray();

  numSequence.sort(function(valA, valB) {
    return valA - valB;
  });

  var currentLevel = [];
  currentLevel.push(numSequence.pop());

  for (var levelIdx = 1; levelIdx <= countVal; levelIdx++) {
    var nextLevel = [];
    var elementsToPop = (1 << levelIdx); // Equivalent to Math.pow(2, levelIdx)

    for (var elementIdx = 0; elementIdx < elementsToPop; elementIdx++) {
      nextLevel.push(numSequence.pop());
    }

    for (var elementIdx = 0; elementIdx < nextLevel.length; elementIdx++) {
      if (currentLevel[elementIdx] <= nextLevel[elementIdx]) {
        printResult("NO"); // Output string, must remain unchanged
        return;
      }
    }
    currentLevel = currentLevel.concat(nextLevel);
  }

  printResult("YES"); // Output string, must remain unchanged
}
