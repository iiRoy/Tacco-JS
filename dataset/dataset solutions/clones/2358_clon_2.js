// This section handles input processing and utility functions, not directly related to the core problem.
var dataStreamHandler = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});
var inputContent;
var receivedLines = [];
dataStreamHandler.on('line', function(currentInputLine) {
  receivedLines.push(currentInputLine);
});
dataStreamHandler.on('close', function() {
  inputContent = configureInputProcessor(receivedLines);
  console.error('\n↑Input ↓Output');
  executeSolution();
});

// A utility function to create a deep copy of an object or Set.
function replicateObject(sourceObject) {
  return (sourceObject instanceof Set) ? new Set(Array.from(sourceObject)) : JSON.parse(JSON.stringify(sourceObject));
}

// Functions to retrieve and convert different types of input from the processor.
function obtainNextInteger() {
  return performDataConversion(fetchNextSegment(), 1);
}

function obtainNextStringSequence() {
  return performDataConversion(fetchNextSegment(), 2);
}

function obtainNextIntegerSequence() {
  return performDataConversion(fetchNextSegment(), 4);
}

function obtainNextCharacterSequence() {
  return performDataConversion(fetchNextSegment(), 6);
}

// Core functions for interacting with the input content processor.
function fetchNextSegment() {
  return inputContent.fetchNext();
}

function hasMoreSegments() {
  return inputContent.hasMoreItems();
}

// Initializes the input content processor with the collected lines.
function configureInputProcessor(collectedInput) {
  return {
    sourceSegmentList: collectedInput,
    currentReadIndex: 0,
    totalSegments: collectedInput.length,
    hasMoreItems: function() {
      return (this.currentReadIndex < this.totalSegments);
    },
    fetchNext: function() {
      if (this.hasMoreItems()) {
        return this.sourceSegmentList[this.currentReadIndex++];
      } else {
        throw 'InputOutOfBoundsException: No more data available for processing.';
      }
    }
  };
}

// Function to print the final computed result to standard output.
function outputFinalResult(outputValue) {
  console.log(outputValue);
}

// Function for logging debug messages to standard error.
function debugLogMessage(debugData) {
  console.error('DEBUG INFO: ' + require('util').inspect(debugData, false, null));
}

// Description of conversion options for the data transformation utility.
// conversionOption values:
//  - 1: Parse string to integer.
//  - 2: Split string by space into an array of strings.
//  - 4: Split string by space and convert parts to numbers.
//  - 6: Split string into an array of individual characters.
//  - 7: Split string into characters and convert parts to numbers.
//  - 8: Join array elements with spaces.
//  - 9: Join array elements with newlines.
//  - 0: Join array elements without any separator.
//  - default: Return input as is.
function performDataConversion(valueToConvert, conversionOption) {
  try {
    switch (conversionOption) {
      case 1:
        return parseInt(valueToConvert);
      case 2:
        return valueToConvert.split(' ');
      case 4:
        return valueToConvert.split(' ').map(Number);
      case 6:
        return valueToConvert.split('');
      case 7:
        return valueToConvert.split('').map(Number);
      case 8:
        return valueToConvert.join(' ');
      case 9:
        return valueToConvert.join('\n');
      case 0:
        return valueToConvert.join('');
      default:
        return valueToConvert; // In case of unknown option, return original value.
    }
  } catch (error) {
    return valueToConvert; // In case of conversion error, return original value.
  }
}

// End of utility and input handling functions.
function executeSolution() {
  var gridDimensions = obtainNextIntegerSequence(); // Read grid height and width from input
  var numRows = gridDimensions[0];
  var numCols = gridDimensions[1];

  var firstGridMatrix = new Array(numRows); // Initialize the first matrix based on height
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    firstGridMatrix[rowIndex] = obtainNextIntegerSequence(); // Populate rows of the first matrix with integer sequences
  }

  // Process the second set of input rows to modify the first matrix by calculating absolute differences
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    var secondGridRowData = obtainNextIntegerSequence(); // Get a row from the second conceptual matrix
    for (var colIndex = 0; colIndex < numCols; colIndex++) {
      // Update cell value in the first matrix with the absolute difference between corresponding elements
      firstGridMatrix[rowIndex][colIndex] = Math.abs(firstGridMatrix[rowIndex][colIndex] - secondGridRowData[colIndex]);
    }
  }

  // Define the maximum possible sum/difference value for the DP table's third dimension
  var maxPossibleValue = 90;
  var reachableSumsTable = new Array(numRows); // Initialize the dynamic programming table for reachable sums

  // Allocate memory for the 3D DP table: numRows x numCols x maxPossibleValue
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    reachableSumsTable[rowIndex] = new Array(numCols);
    for (var colIndex = 0; colIndex < numCols; colIndex++) {
      reachableSumsTable[rowIndex][colIndex] = new Array(maxPossibleValue).fill(false); // Initialize all possible sums as not reachable
    }
  }

  // Set the base case for the dynamic programming: the sum at the very first cell (0,0) is reachable
  reachableSumsTable[0][0][firstGridMatrix[0][0]] = true;

  // Iterate through the grid cells to fill the dynamic programming table
  for (var rowIndex = 0; rowIndex < numRows; rowIndex++) {
    for (var colIndex = 0; colIndex < numCols; colIndex++) {
      // Skip the initial cell as its base case is already established
      if (rowIndex === 0 && colIndex === 0) {
        continue;
      }

      // Handle cells located in the first row (movement is only possible from the left)
      if (rowIndex === 0) {
        for (var sumValue = 0; sumValue < maxPossibleValue; sumValue++) {
          // If the cell immediately to the left could reach 'sumValue'
          if (reachableSumsTable[rowIndex][colIndex - 1][sumValue]) {
            // Mark new sums as reachable: (previous_sum + current_cell_value) and (previous_sum - current_cell_value)
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue + firstGridMatrix[rowIndex][colIndex])] = true;
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue - firstGridMatrix[rowIndex][colIndex])] = true;
          }
        }
      }
      // Handle cells located in the first column (movement is only possible from above)
      else if (colIndex === 0) {
        for (var sumValue = 0; sumValue < maxPossibleValue; sumValue++) {
          // If the cell directly above could reach 'sumValue'
          if (reachableSumsTable[rowIndex - 1][colIndex][sumValue]) {
            // Mark new sums as reachable
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue + firstGridMatrix[rowIndex][colIndex])] = true;
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue - firstGridMatrix[rowIndex][colIndex])] = true;
          }
        }
      }
      // Handle general cells within the grid (movement is possible from above or from the left)
      else {
        for (var sumValue = 0; sumValue < maxPossibleValue; sumValue++) {
          // Check paths originating from the cell directly above
          if (reachableSumsTable[rowIndex - 1][colIndex][sumValue]) {
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue + firstGridMatrix[rowIndex][colIndex])] = true;
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue - firstGridMatrix[rowIndex][colIndex])] = true;
          }
          // Check paths originating from the cell immediately to the left
          if (reachableSumsTable[rowIndex][colIndex - 1][sumValue]) {
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue + firstGridMatrix[rowIndex][colIndex])] = true;
            reachableSumsTable[rowIndex][colIndex][Math.abs(sumValue - firstGridMatrix[rowIndex][colIndex])] = true;
          }
        }
      }
    }
  }

  // After filling the DP table, find the smallest absolute sum reachable at the bottom-right cell
  for (var sumValue = 0; sumValue < maxPossibleValue; sumValue++) {
    if (reachableSumsTable[numRows - 1][numCols - 1][sumValue]) {
      outputFinalResult(sumValue); // Print the first reachable sum found (which will be the smallest due to iteration order)
      return; // Exit the function immediately after finding the result
    }
  }
}