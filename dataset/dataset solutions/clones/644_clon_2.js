var fs = require('fs');

// A utility class for reading input from standard input
function InputReader() {
  this._dataBuffer = null; // Stores the entire input content
  this._lineCache = [];    // Stores individual lines after splitting
  this._currentLineIndex = 0; // Tracks the current line being read
}

// Initializes or re-initializes the input reader by reading from /dev/stdin
InputReader.prototype.initializeReader = function() {
  this._dataBuffer = fs.readFileSync('/dev/stdin', 'utf-8'); // Read all data
  this._lineCache = this._dataBuffer.split("\n");           // Split into lines
  this._currentLineIndex = 0;                                // Reset line pointer
};

// Reads a single line from the input
InputReader.prototype.fetchLine = function() {
  // If all lines have been read, re-initialize the reader
  if (this._currentLineIndex === this._lineCache.length) {
    this.initializeReader();
  }
  // Return the current line and advance the pointer
  return this._lineCache[this._currentLineIndex++];
};

// Reads all remaining lines from the input
InputReader.prototype.fetchRemainingLines = function() {
  // If all lines have been read, re-initialize the reader
  if (this._currentLineIndex === this._lineCache.length) {
    this.initializeReader();
  }
  // Store the current index, then advance to the end to mark all as read
  let startIdx = this._currentLineIndex;
  this._currentLineIndex = this._lineCache.length;
  // Return a slice containing all lines from startIdx to the end
  return this._lineCache.slice(startIdx);
};

// Create a global instance of the input reader
var inputSource = new InputReader();

// Extend Array prototype with custom mapping functions
Array.prototype.toIntegerArray = function() {
  return this.map((itemValue) => parseInt(itemValue));
};
Array.prototype.toFloatArray = function() {
  return this.map((elementVal) => parseFloat(elementVal));
};
Array.prototype.toStringArray = function() {
  return this.map((valItem) => String(valItem));
};

// Custom array fill function using a callback
Array.prototype.fillWithCallback = function(fillFunction) {
  for (let idx = 0; idx < this.length; ++idx) {
    this[idx] = fillFunction(idx);
  }
  return this;
};

// Custom array max function, optionally using a callback for value extraction
Array.prototype.findMaximum = function(valueExtractor) {
  if (this.length === 0) return undefined;
  let maxValue = valueExtractor ? valueExtractor(this[0], 0) : this[0];
  for (let loopIndex = 1; loopIndex < this.length; ++loopIndex) {
    let currentValue = valueExtractor ? valueExtractor(this[loopIndex], loopIndex) : this[loopIndex];
    if (maxValue < currentValue) maxValue = currentValue;
  }
  return maxValue;
};

// Custom array min function, optionally using a callback for value processing
Array.prototype.findMinimum = function(valueProcessor) {
  if (this.length === 0) return undefined;
  let minValue = valueProcessor ? valueProcessor(this[0], 0) : this[0];
  for (let iterIndex = 1; iterIndex < this.length; ++iterIndex) {
    let processedValue = valueProcessor ? valueProcessor(this[iterIndex], iterIndex) : this[iterIndex];
    if (processedValue < minValue) minValue = processedValue;
  }
  return minValue;
};

// Custom array sum function, optionally using a callback for value summing
Array.prototype.calculateSum = function(summingFunction) {
  if (this.length === 0) return undefined;
  let totalSum = summingFunction ? summingFunction(this[0], 0) : this[0];
  for (let counter = 1; counter < this.length; ++counter) {
    totalSum += summingFunction ? summingFunction(this[counter], counter) : this[counter];
  }
  return totalSum;
};

// Extend Number prototype to repeat an action a specified number of times
Number.prototype.repeatAction = function(actionCallback) {
  let resultArray = [];
  for (let iterationCount = 0; iterationCount < this; ++iterationCount) {
    resultArray.push(actionCallback ? actionCallback(iterationCount) : iterationCount);
  }
  return resultArray;
};

// Extend Object prototype with custom iteration functions
Object.prototype.iterateKeys = function(callbackFunction) {
  Object.keys(this).forEach(callbackFunction);
};
Object.prototype.mapKeys = function(mappingFunction) {
  Object.keys(this).map(mappingFunction);
};

// --- Main program logic starts here ---

// Read the first line, split by space, and convert to integers
var inputDimensions = inputSource.fetchLine().split(' ').toIntegerArray();
var numRows = inputDimensions[0]; // N
var numCols = inputDimensions[1]; // M

// Read N lines to form the grid data
var gridData = numRows.repeatAction((rowIdx) => inputSource.fetchLine());

// Cache for memoization of color count calculations
var calculationCache = {};

// Function to calculate the number of cells that are NOT the target color in a given row
function calculateColorCount(rowIndex, targetColor) {
  // Check if result is already in cache
  if ([rowIndex, targetColor] in calculationCache) {
    return calculationCache[[rowIndex, targetColor]];
  }

  let colorOccurrences = 0;
  // Iterate through columns of the specified row
  for (let colIndex = 0; colIndex < numCols; ++colIndex) {
    // If the cell's color matches the target color, increment count
    if (gridData[rowIndex][colIndex] == targetColor) {
      colorOccurrences++;
    }
  }
  // The cost is the total columns minus occurrences of the target color
  // Store and return the result
  return calculationCache[[rowIndex, targetColor]] = numCols - colorOccurrences;
}

// Initialize current white cost and overall minimum total cost
var currentWhiteCost = 0;
var minimumTotalCost = numRows * numCols; // Max possible cost initially

// Iterate through all possible split points for the white section (firstSplitRow)
for (let firstSplitRow = 0; firstSplitRow < numRows; ++firstSplitRow) {
  // Add the cost for the current row to be white
  currentWhiteCost += calculateColorCount(firstSplitRow, 'W');

  let currentBlueCost = 0; // Reset blue cost for each new white section

  // Iterate through all possible split points for the blue section (secondSplitRow)
  // The blue section must start after the white section and leave at least one row for red
  for (let secondSplitRow = firstSplitRow + 1; secondSplitRow < numRows - 1; ++secondSplitRow) {
    // Add the cost for the current row to be blue
    currentBlueCost += calculateColorCount(secondSplitRow, 'B');

    let currentRedCost = 0; // Reset red cost for each new blue section

    // Iterate through all remaining rows for the red section (thirdSplitRow)
    for (let thirdSplitRow = secondSplitRow + 1; thirdSplitRow < numRows; ++thirdSplitRow) {
      // Add the cost for the current row to be red
      currentRedCost += calculateColorCount(thirdSplitRow, 'R');
    }
    // Update the minimum total cost found so far
    minimumTotalCost = [minimumTotalCost, currentWhiteCost + currentBlueCost + currentRedCost].findMinimum();
  }
}

// Output the final minimum total cost
console.log(minimumTotalCost);
