var fs = require('fs');

// Helper function for array prototype methods to get the initial value
function getInitialAggregateValue(dataArray, callbackFn) {
  return callbackFn ? callbackFn(dataArray[0], 0) : dataArray[0];
}

// Class for reading input from stdin
class InputReader {
  constructor() {
    this._rawData = null;
    this._lineBuffer = [];
    this._currentLineIndex = 0;
  }

  // Ensures the input buffer is initialized or re-initialized if all lines have been read
  _ensureInputBufferReady() {
    if (this._currentLineIndex >= this._lineBuffer.length) {
      this._initializeInputBuffer();
    }
  }

  // Initializes the input buffer by reading from /dev/stdin
  _initializeInputBuffer() {
    this._rawData = fs.readFileSync('/dev/stdin', 'utf-8');
    this._lineBuffer = this._rawData.split("\n");
    this._currentLineIndex = 0;
  }

  // Reads a single line from the input
  readSingleLine() {
    this._ensureInputBufferReady();
    return this._lineBuffer[this._currentLineIndex++];
  }

  // Reads all remaining lines from the input
  readAllRemainingLines() {
    this._ensureInputBufferReady();
    const startIndex = this._currentLineIndex;
    this._currentLineIndex = this._lineBuffer.length;
    return this._lineBuffer.slice(startIndex);
  }
}

const inputSource = new InputReader();

// Extend Array prototype with utility mapping functions
Array.prototype.mapToInt = function() { return this.map((item) => parseInt(item, 10)); };
Array.prototype.mapToFloat = function() { return this.map((item) => parseFloat(item)); };
Array.prototype.mapToString = function() { return this.map((item) => String(item)); };

// Extend Array prototype to fill with a callback
Array.prototype.fillWithCallback = function(callbackFn) {
  for (let i = 0; i < this.length; ++i) {
    this[i] = callbackFn(i);
  }
  return this;
};

// Extend Array prototype for aggregate functions
Array.prototype.findMaximum = function(callbackFn) {
  if (this.length === 0) return undefined;
  let result = getInitialAggregateValue(this, callbackFn);
  for (let i = 1; i < this.length; ++i) {
    const currentValue = callbackFn ? callbackFn(this[i], i) : this[i];
    if (result < currentValue) {
      result = currentValue;
    }
  }
  return result;
};

Array.prototype.findMinimum = function(callbackFn) {
  if (this.length === 0) return undefined;
  let result = getInitialAggregateValue(this, callbackFn);
  for (let i = 1; i < this.length; ++i) {
    const currentValue = callbackFn ? callbackFn(this[i], i) : this[i];
    if (currentValue < result) {
      result = currentValue;
    }
  }
  return result;
};

Array.prototype.calculateSum = function(callbackFn) {
  if (this.length === 0) return undefined;
  let totalSum = getInitialAggregateValue(this, callbackFn);
  for (let i = 1; i < this.length; ++i) {
    totalSum += callbackFn ? callbackFn(this[i], i) : this[i];
  }
  return totalSum;
};

// Extend Number prototype to generate a sequence
Number.prototype.generateSequence = function(callbackFn) {
  const sequenceLimit = this.valueOf();
  return Array.from({ length: sequenceLimit }, (_, index) => callbackFn ? callbackFn(index) : index);
};

// Extend Object prototype for key iteration
Object.prototype.iterateKeys = function(callbackFn) { Object.keys(this).forEach(callbackFn); };
Object.prototype.mapKeys = function(callbackFn) { Object.keys(this).map(callbackFn); };

// --- Main program logic starts here ---

const firstLineParts = inputSource.readSingleLine().split(' ').mapToInt();
const numRows = firstLineParts[0];
const numCols = firstLineParts[1];

// Read grid data using Array.from for a more modern approach
const gridData = Array.from({ length: numRows }, () => inputSource.readSingleLine());

const memoizationCache = {};

// Calculates the number of characters in a row that do NOT match the target color
function calculateMismatchCost(rowIndex, targetColor) {
  const cacheKey = `${rowIndex}_${targetColor}`;
  if (cacheKey in memoizationCache) {
    return memoizationCache[cacheKey];
  }

  let mismatchCount = 0;
  const currentRow = gridData[rowIndex];
  for (let charIndex = 0; charIndex < numCols; ++charIndex) {
    if (currentRow[charIndex] !== targetColor) {
      mismatchCount++;
    }
  }
  return memoizationCache[cacheKey] = mismatchCount;
}

let costForWhiteSection = 0;
let minTotalCost = numRows * numCols;

// Iterate through all possible split points for the 'W' section (top part)
for (let rowIndex = 0; rowIndex < numRows; ++rowIndex) {
  costForWhiteSection += calculateMismatchCost(rowIndex, 'W');

  let costForBlueSection = 0;
  // Iterate through all possible split points for the 'B' section (middle part)
  for (let middleRowIndex = rowIndex + 1; middleRowIndex < numRows - 1; ++middleRowIndex) {
    costForBlueSection += calculateMismatchCost(middleRowIndex, 'B');

    let costForRedSection = 0;
    // Iterate through all rows for the 'R' section (bottom part)
    for (let bottomRowIndex = middleRowIndex + 1; bottomRowIndex < numRows; ++bottomRowIndex) {
      costForRedSection += calculateMismatchCost(bottomRowIndex, 'R');
    }
    minTotalCost = [minTotalCost, costForWhiteSection + costForBlueSection + costForRedSection].findMinimum();
  }
}

console.log(minTotalCost);
