"use strict";

function InputReader(sourceText, defaultParseFn) {
  this.lines = sourceText.split("\n");
  this.currentWordIndex = 0;
  this.currentLineIndex = 0;
  this.defaultParser = defaultParseFn || Number;
}

InputReader.prototype._getTokensForCurrentLine = function() {
  const currentLineContent = this.lines[this.currentLineIndex];
  // Return null if the line itself is undefined (end of input)
  return currentLineContent !== undefined ? currentLineContent.trim().split(" ") : null;
};

InputReader.prototype.readToken = function(customParser) {
  const currentLineTokens = this._getTokensForCurrentLine();

  // If currentLineTokens is null, it means currentLineContent was undefined.
  // The original function would implicitly return undefined in this case.
  if (currentLineTokens === null) {
      return undefined;
  }

  const tokenValue = currentLineTokens[this.currentWordIndex];
  this.currentWordIndex++;

  // Advance to the next line if all tokens on the current line have been processed
  if (this.currentWordIndex === currentLineTokens.length) {
    this.currentWordIndex = 0;
    this.currentLineIndex++;
  }

  return customParser ? customParser(tokenValue) : this.defaultParser(tokenValue);
};

InputReader.prototype.readLine = function(customParser) {
  const rawLine = this.lines[this.currentLineIndex];
  // If rawLine is undefined, it means no more lines. Original returns undefined.
  if (rawLine === undefined) {
      return undefined;
  }
  this.currentWordIndex = 0; // Reset word index as we're reading a new line
  this.currentLineIndex++;
  const tokensOnLine = rawLine.split(" ");
  return tokensOnLine.map(customParser || this.defaultParser);
};

module.exports = InputReader;

// --- Main logic and helper functions ---

const ADD_POINT_OPERATION = 1;
const QUERY_STATS_OPERATION = 2; // Assuming the other operation type is 2

function handlePointAddition(readerInstance, pointsCollection, currentCostOffset) {
  const pointValue = readerInstance.readToken();
  const costIncrement = readerInstance.readToken();

  pointsCollection.push(pointValue); // Modifies the array in place
  return currentCostOffset + costIncrement; // Returns the updated cost offset
}

function computeAndLogStatistics(pointsCollection, currentCostOffset) {
  // Sort the collection in place as per original logic
  pointsCollection.sort((a, b) => a - b);

  const collectionLength = pointsCollection.length;
  // Calculate the median index for a 0-indexed array
  const medianIndex = Math.floor((collectionLength - 1) / 2);
  const medianValue = pointsCollection[medianIndex];

  // Calculate the sum of absolute deviations from the median
  let totalDeviationSum = 0;
  for (let k = 0; k < collectionLength; k++) {
      totalDeviationSum += Math.abs(pointsCollection[k] - medianValue);
  }

  // The final result is the sum of deviations plus the accumulated cost offset
  const finalResult = totalDeviationSum + currentCostOffset;
  console.log(medianValue, finalResult);
}

function main(inputContent) {
  const inputProcessor = new InputReader(inputContent);

  const numOperations = inputProcessor.readToken();

  let dataPoints = []; // Stores the 'a' values, renamed from 'sorted'
  let totalCostOffset = 0; // Accumulates 'b' values, renamed from 'c'

  for (let opCounter = 0; opCounter < numOperations; opCounter++) {
    const operationType = inputProcessor.readToken();

    if (operationType === ADD_POINT_OPERATION) {
      // Delegate to helper function for adding a point and updating cost
      totalCostOffset = handlePointAddition(inputProcessor, dataPoints, totalCostOffset);
    } else if (operationType === QUERY_STATS_OPERATION) { // Explicitly check for the query operation
      // Delegate to helper function for computing and logging statistics
      computeAndLogStatistics(dataPoints, totalCostOffset);
    }
    // No 'else' needed, as problem implies only two operation types.
  }
}

main(require("fs").readFileSync("/dev/stdin", "utf8"));
