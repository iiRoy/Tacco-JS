// Utility functions for input/output operations.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor;
var inputLines = [];

inputReader.on('line', function(lineContent) {
  inputLines.push(lineContent);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputReader(inputLines);
  console.error('\n↑入力 ↓出力');
  executeAlgorithm();
});

// Creates a deep copy of an object or Set.
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Reads the next input line as an integer.
function readInteger() {
  return convertInput(getNextInput(), 1);
}

// Reads the next input line and splits it into a string array.
function readStringArray() {
  return convertInput(getNextInput(), 2);
}

// Reads the next input line, splits it, and converts to an integer array.
function readIntegerArray() {
  return convertInput(getNextInput(), 4);
}

// Reads the next input line and splits it into a character array.
function readCharacterArray() {
  return convertInput(getNextInput(), 6);
}

// Fetches the next available input line.
function getNextInput() {
  return inputProcessor.fetchNext();
}

// Checks if there are more input lines.
function hasMoreInput() {
  return inputProcessor.checkMore();
}

// Initializes the input reader object.
function initializeInputReader(rawInputData) {
  return {
    dataList: rawInputData,
    currentIdx: 0,
    maxLines: rawInputData.length,
    checkMore: function() {
      return (this.currentIdx < this.maxLines);
    },
    fetchNext: function() {
      if (this.checkMore()) {
        return this.dataList[this.currentIdx++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Prints a message to standard output.
function printResult(outputMessage) {
  console.log(outputMessage);
}

// Logs a debug message to standard error.
function logDebug(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

/*
 * Converts input based on a specified type.
 * conversionType:
 * 1: Parse as integer.
 * 2: Split by space into strings.
 * 4: Split by space and parse as numbers.
 * 6: Split by character into strings.
 * 7: Split by character and parse as numbers.
 * 8: Join array elements with space.
 * 9: Join array elements with newline.
 * 0: Join array elements without separator.
 * Default: Return input as is.
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

// Main algorithm execution starts here.
function executeAlgorithm() {
  var dimensions = readIntegerArray();
  var heightVal = dimensions[0];
  var widthVal = dimensions[1];

  var gridData = new Array(heightVal);
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    gridData[rowIdx] = readIntegerArray();
  }

  // Process the second set of input rows.
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    var tempRow = readIntegerArray();
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      gridData[rowIdx][colIdx] = Math.abs(gridData[rowIdx][colIdx] - tempRow[colIdx]);
    }
  }

  var maxPossibleSum = 90;
  var dynamicProgressionTable = new Array(heightVal);

  // Initialize the DP table.
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    dynamicProgressionTable[rowIdx] = new Array(widthVal);
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      dynamicProgressionTable[rowIdx][colIdx] = new Array(maxPossibleSum).fill(false);
    }
  }

  // Set initial state for DP.
  dynamicProgressionTable[0][0][gridData[0][0]] = true;

  // Fill the DP table using values from adjacent cells.
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      // Skip the starting cell as it's already initialized.
      if (rowIdx === 0 && colIdx === 0) {
        continue;
      }

      // Handle the first row (movement only from left).
      if (rowIdx === 0) {
        for (var currentSum = 0; currentSum < maxPossibleSum; currentSum++) {
          if (dynamicProgressionTable[rowIdx][colIdx - 1][currentSum]) {
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum + gridData[rowIdx][colIdx])] = true;
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum - gridData[rowIdx][colIdx])] = true;
          }
        }
      }
      // Handle the first column (movement only from top).
      else if (colIdx === 0) {
        for (var currentSum = 0; currentSum < maxPossibleSum; currentSum++) {
          if (dynamicProgressionTable[rowIdx - 1][colIdx][currentSum]) {
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum + gridData[rowIdx][colIdx])] = true;
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum - gridData[rowIdx][colIdx])] = true;
          }
        }
      }
      // Handle general cells (movement from top or left).
      else {
        for (var currentSum = 0; currentSum < maxPossibleSum; currentSum++) {
          // From top cell.
          if (dynamicProgressionTable[rowIdx - 1][colIdx][currentSum]) {
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum + gridData[rowIdx][colIdx])] = true;
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum - gridData[rowIdx][colIdx])] = true;
          }
          // From left cell.
          if (dynamicProgressionTable[rowIdx][colIdx - 1][currentSum]) {
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum + gridData[rowIdx][colIdx])] = true;
            dynamicProgressionTable[rowIdx][colIdx][Math.abs(currentSum - gridData[rowIdx][colIdx])] = true;
          }
        }
      }
    }
  }

  // Find the minimum absolute sum at the bottom-right cell.
  for (var currentSum = 0; currentSum < maxPossibleSum; currentSum++) {
    if (dynamicProgressionTable[heightVal - 1][widthVal - 1][currentSum]) {
      printResult(currentSum);
      return;
    }
  }
}
