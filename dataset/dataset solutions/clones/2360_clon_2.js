// This section handles input processing and utility functions.
// It's generally not part of the core algorithm logic.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Stores the initialized input handler.
var inputLines = []; // Accumulates all lines read from standard input.

inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

inputReader.on('close', function() {
  inputProcessor = initializeInputHandler(inputLines);
  console.error('\n↑入力 ↓出力'); // Output for debugging/user guidance.
  executeSolution(); // Start the main problem-solving logic.
});

// Creates a deep copy of an object or Set.
function createDeepCopy(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

// Fetches the next input item and converts it to an integer.
function getNextInteger() {
  return convertInput(fetchNextItem(), 1);
}

// Fetches the next input item and converts it to a string array.
function getNextStringArray() {
  return convertInput(fetchNextItem(), 2);
}

// Fetches the next input item and converts it to an integer array.
function getNextIntegerArray() {
  return convertInput(fetchNextItem(), 4);
}

// Fetches the next input item and converts it to a character array.
function getNextCharacterArray() {
  return convertInput(fetchNextItem(), 6);
}

// Retrieves the next available input item from the handler.
function fetchNextItem() {
  return inputProcessor.fetchNextItem();
}

// Checks if there are more input items available.
function hasMoreItems() {
  return inputProcessor.hasMoreItems();
}

// Initializes an object to handle sequential input reading.
function initializeInputHandler(allInputLines) {
  return {
    dataList: allInputLines,
    currentIdx: 0,
    maxCount: allInputLines.length,

    // Method to check if more input lines exist.
    hasMoreItems: function() {
      return (this.currentIdx < this.maxCount);
    },

    // Method to get the next input line.
    fetchNextItem: function() {
      if (this.hasMoreItems()) {
        return this.dataList[this.currentIdx++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input';
      }
    }
  };
}

// Prints the final result to standard output.
function printResult(outputValue) {
  console.log(outputValue);
}

// Logs debug information to standard error.
function logDebug(debugInfo) {
  console.error('debug:' + require('util').inspect(debugInfo, false, null));
}

// Utility function to convert input based on a specified type.
// Type "conversionType" determines the parsing method:
// 1: Parse as integer.
// 2: Split by space into string array.
// 4: Split by space and parse each part as number into integer array.
// 6: Split into character array.
// 7: Split into character array and parse each as number.
// 8: Join array elements with space.
// 9: Join array elements with newline.
// 0: Join array elements without separator.
// Default: Return input as is.
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
    return inputValue; // In case of conversion error, return original value.
  }
}

// End of input processing and utility functions.

// Main function containing the problem's solution logic.
function executeSolution() {
  // Read the first line which contains H and W.
  var dimensions = getNextIntegerArray();
  var heightVal = dimensions[0];
  var widthVal = dimensions[1];

  // Initialize a 2D array to store grid values.
  var gridValues = new Array(heightVal);
  // Initialize a 3D DP table.
  var dynamicProgTable = new Array(heightVal);
  // Define the maximum possible sum for DP table dimension.
  var maxPossibleSum = 1272;

  // Populate the gridValues and initialize the DP table structure.
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    dynamicProgTable[rowIdx] = new Array(widthVal);
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      dynamicProgTable[rowIdx][colIdx] = new Array(maxPossibleSum);
    }
    // Read the initial row values for the grid.
    gridValues[rowIdx] = getNextIntegerArray();
  }

  // Process the second set of input rows to calculate absolute differences.
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    var tempRow = getNextIntegerArray(); // Read the next row for subtraction.
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      // Calculate the absolute difference and update gridValues.
      gridValues[rowIdx][colIdx] = Math.abs(gridValues[rowIdx][colIdx] - tempRow[colIdx]);
    }
  }

  // Initialize the DP table at the starting cell (0,0).
  // The value at gridValues[0][0] is the initial sum.
  dynamicProgTable[0][0][gridValues[0][0]] = true;

  // Iterate through the grid to fill the DP table.
  for (var rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    for (var colIdx = 0; colIdx < widthVal; colIdx++) {
      // Skip the starting cell as it's already initialized.
      if (rowIdx === 0 && colIdx === 0) {
        continue;
      }

      // Handle the first row (movement only from left).
      if (rowIdx === 0) {
        for (var sumVal = 0; sumVal < maxPossibleSum; sumVal++) {
          // If the previous cell (left) had a path leading to 'sumVal'.
          if (dynamicProgTable[rowIdx][colIdx - 1][sumVal]) {
            // Update current cell's DP table with new possible sums.
            // Add the current cell's value.
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal + gridValues[rowIdx][colIdx])] = true;
            // Subtract the current cell's value.
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal - gridValues[rowIdx][colIdx])] = true;
          }
        }
      }
      // Handle the first column (movement only from top).
      else if (colIdx === 0) {
        for (var sumVal = 0; sumVal < maxPossibleSum; sumVal++) {
          // If the previous cell (top) had a path leading to 'sumVal'.
          if (dynamicProgTable[rowIdx - 1][colIdx][sumVal]) {
            // Update current cell's DP table with new possible sums.
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal + gridValues[rowIdx][colIdx])] = true;
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal - gridValues[rowIdx][colIdx])] = true;
          }
        }
      }
      // Handle general cells (movement from top or left).
      else {
        for (var sumVal = 0; sumVal < maxPossibleSum; sumVal++) {
          // Check path from top cell.
          if (dynamicProgTable[rowIdx - 1][colIdx][sumVal]) {
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal + gridValues[rowIdx][colIdx])] = true;
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal - gridValues[rowIdx][colIdx])] = true;
          }
          // Check path from left cell.
          if (dynamicProgTable[rowIdx][colIdx - 1][sumVal]) {
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal + gridValues[rowIdx][colIdx])] = true;
            dynamicProgTable[rowIdx][colIdx][Math.abs(sumVal - gridValues[rowIdx][colIdx])] = true;
          }
        }
      }
    }
  }

  // Find the smallest absolute sum at the bottom-right cell.
  for (var sumVal = 0; sumVal < maxPossibleSum; sumVal++) {
    if (dynamicProgTable[heightVal - 1][widthVal - 1][sumVal]) {
      printResult(sumVal); // Output the first found sum.
      return; // Exit after finding the minimum sum.
    }
  }
}
