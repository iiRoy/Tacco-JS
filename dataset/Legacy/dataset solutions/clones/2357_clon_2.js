// This section handles input processing and utility functions.
// It is generally boilerplate for competitive programming setups.
var inputReader = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

var inputProcessor; // Object to manage input lines
var inputLines = []; // Array to store all input lines from stdin

// Event listener for each line of input received
inputReader.on('line', function(currentLine) {
  inputLines.push(currentLine);
});

// Event listener when the input stream closes
inputReader.on('close', function() {
  inputProcessor = initializeInputProcessor(inputLines);
  console.error('\n↑入力 ↓出力'); // Debug message indicating input/output flow
  executeMainLogic(); // Invoke the primary program logic
});

// Function to create a deep copy of an object or a Set instance
function createDeepCopy(originalObject) {
  return (originalObject instanceof Set) ? new Set(Array.from(originalObject)) : JSON.parse(JSON.stringify(originalObject));
}

// Utility functions to read various types of input from the processor
function readInteger() {
  return convertInput(getNextInput(), 1);
}

function readStringArray() {
  return convertInput(getNextInput(), 2);
}

function readIntegerArray() {
  return convertInput(getNextInput(), 4);
}

function readCharacterArray() {
  return convertInput(getNextInput(), 6);
}

// Retrieves the next available input line
function getNextInput() {
  return inputProcessor.next();
}

// Checks if there are more input lines to process
function hasMoreInput() {
  return inputProcessor.hasNext();
}

// Initializes the input processor object with the collected lines
function initializeInputProcessor(linesCollection) {
  return {
    dataList: linesCollection, // The array containing all input lines
    currentIndex: 0, // The current index for reading from dataList
    maximumIndex: linesCollection.length, // The total number of input lines

    // Method to determine if more input is available
    hasNext: function() {
      return (this.currentIndex < this.maximumIndex);
    },

    // Method to retrieve the next input line and advance the index
    next: function() {
      if (this.hasNext()) {
        return this.dataList[this.currentIndex++];
      } else {
        throw 'ArrayIndexOutOfBoundsException ‚There is no more input'; // Error if no more input
      }
    }
  };
}

// Function to print a value to standard output
function printOutput(outputValue) {
  console.log(outputValue);
}

// Function to print debug information to standard error
function printDebugError(debugMessage) {
  console.error('debug:' + require('util').inspect(debugMessage, false, null));
}

// Helper function to convert input based on a specified type code
// Type 1: Parse as integer.
// Type 2: Split by space into a string array.
// Type 4: Split by space and map to an array of numbers.
// Type 6: Split into a character array.
// Type 7: Split into a character array and map to numbers.
// Type 8: Join array elements with a space.
// Type 9: Join array elements with a newline.
// Type 0: Join array elements without any separator.
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
        return inputValue; // Return input as-is if conversion type is unknown
    }
  } catch (error) {
    return inputValue; // Return original value in case of conversion error
  }
}

// End of boilerplate input/output handling.
// --------------------------------------------------------------------------

// Main program logic begins here.
function executeMainLogic() {
  // Read the first line of input, which contains the height (H) and width (W)
  var dimensionsInput = readIntegerArray();
  var heightVal = dimensionsInput[0];
  var widthVal = dimensionsInput[1];

  // Initialize a 2D array (gridData) to store the first set of grid values
  var gridData = new Array(heightVal);
  for (var r = 0; r < heightVal; r++) {
    gridData[r] = readIntegerArray(); // Populate each row with integer arrays
  }

  // Read the second set of grid values and update gridData by calculating absolute differences
  for (var r = 0; r < heightVal; r++) {
    var tempRow = readIntegerArray(); // Read a temporary row of integers
    for (var c = 0; c < widthVal; c++) {
      // Calculate the absolute difference between the current grid value and the temporary row value
      gridData[r][c] = Math.abs(gridData[r][c] - tempRow[c]);
    }
  }

  // Define the maximum possible sum for the dynamic programming table
  var maxPossibleSum = 13000;

  // Initialize a 3D dynamic programming table.
  // dynamicProgrammingTable[r][c][s] will be true if sum 's' is achievable at cell (r, c).
  var dynamicProgrammingTable = new Array(heightVal + 1);
  for (var r = 0; r < heightVal + 1; r++) {
    dynamicProgrammingTable[r] = new Array(widthVal + 1);
    for (var c = 0; c < widthVal + 1; c++) {
      dynamicProgrammingTable[r][c] = new Array(maxPossibleSum).fill(false);
    }
  }

  // Base case: The sum at the starting cell (0,0) is the absolute value of gridData[0][0]
  dynamicProgrammingTable[0][0][gridData[0][0]] = true;

  // Iterate through the grid to populate the dynamic programming table
  for (var r = 0; r < heightVal; r++) {
    for (var c = 0; c < widthVal; c++) {
      // Skip the initial cell (0,0) as its base case is already handled
      if (r === 0 && c === 0) {
        continue;
      }

      // If currently in the first row (r=0), movement is only from the left
      if (r === 0) {
        for (var s = 0; s < maxPossibleSum; s++) {
          if (dynamicProgrammingTable[r][c - 1][s]) {
            // If sum 's' was achievable at (r, c-1), then at (r, c)
            // we can achieve s + current_value or s - current_value (absolute)
            dynamicProgrammingTable[r][c][Math.abs(s + gridData[r][c])] = true;
            dynamicProgrammingTable[r][c][Math.abs(s - gridData[r][c])] = true;
          }
        }
      }
      // If currently in the first column (c=0), movement is only from the top
      else if (c === 0) {
        for (var s = 0; s < maxPossibleSum; s++) {
          if (dynamicProgrammingTable[r - 1][c][s]) {
            // If sum 's' was achievable at (r-1, c), then at (r, c)
            // we can achieve s + current_value or s - current_value (absolute)
            dynamicProgrammingTable[r][c][Math.abs(s + gridData[r][c])] = true;
            dynamicProgrammingTable[r][c][Math.abs(s - gridData[r][c])] = true;
          }
        }
      }
      // For general cells (not in the first row or column), movement can be from top or left
      else {
        for (var s = 0; s < maxPossibleSum; s++) {
          // Check paths coming from the cell above (r-1, c)
          if (dynamicProgrammingTable[r - 1][c][s]) {
            dynamicProgrammingTable[r][c][Math.abs(s + gridData[r][c])] = true;
            dynamicProgrammingTable[r][c][Math.abs(s - gridData[r][c])] = true;
          }
          // Check paths coming from the cell to the left (r, c-1)
          if (dynamicProgrammingTable[r][c - 1][s]) {
            dynamicProgrammingTable[r][c][Math.abs(s + gridData[r][c])] = true;
            dynamicProgrammingTable[r][c][Math.abs(s - gridData[r][c])] = true;
          }
        }
      }
    }
  }

  // After filling the DP table, find the smallest absolute sum achievable at the bottom-right cell (H-1, W-1)
  for (var s = 0; s < maxPossibleSum; s++) {
    if (dynamicProgrammingTable[heightVal - 1][widthVal - 1][s]) {
      printOutput(s); // Output the smallest achievable sum
      return; // Exit the function once the first (smallest) sum is found
    }
  }
}
