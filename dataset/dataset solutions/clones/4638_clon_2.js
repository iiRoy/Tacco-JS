var lineReader = require('readline').createInterface(
  {
    input: process.stdin,
    output: process.stdout
  }
);
var dataHandler;
var capturedInputLines = [];

lineReader.on('line', function(incomingString) {
  capturedInputLines.push(incomingString);
});

lineReader.on('close', function() {
  dataHandler = setupParser(capturedInputLines);
  console.error(" \n"); // Extra newlines for different whitespace
  var executionStart = new Date();
  runProblemSolver();
  var executionEnd = new Date() - executionStart;

  logDiagnostic("Time spent: " + (executionEnd) + "ms");
  logDiagnostic("Memory allocated: " + Math.round(process.memoryUsage().heapTotal / 1024) + "KB");
});


function replicateObject(sourceObject) {
  return JSON.parse(JSON.stringify(sourceObject));
}

function fetchIntegerVal() { return transformValue(retrieveNext(), 1); }
function fetchStringArray() { return transformValue(retrieveNext(), 2); }
function fetchIntegerArray() { return transformValue(retrieveNext(), 4); }
function fetchCharacterArray() { return transformValue(retrieveNext(), 6); }
function retrieveNext() { return dataHandler.accessNext(); }
function hasMoreData() { return dataHandler.checkMore(); }

function setupParser(sourceData) {
  var processingUnit = {
    lineContents: sourceData,
    currentIdx: 0,
    totalLines: sourceData.length,

    checkMore: function() {
      return (this.currentIdx < this.totalLines);
    },

    accessNext: function() {
      if (!this.checkMore()) {
        throw "InputBoundaryException: No more input lines.";
      } else {
        var retrievedLine = this.lineContents[this.currentIdx];
        this.currentIdx++;
        return retrievedLine;
      }
    }
  };
  return processingUnit;
}

function printSolution(message) {
  console.log(message);
}

function logDiagnostic(diagnosticMessage) {
  console.error("trace: " + require("util").inspect(diagnosticMessage, false, null));
}

// Utility for converting diverse input types.
// `valueToProcess`: The raw input value (string or array).
// `conversionMode`: Numeric code indicating the desired transformation:
//   - 1: Converts string to an integer.
//   - 2: Splits string by spaces into an array of strings.
//   - 4: Splits string by spaces, then maps to an array of numbers.
//   - 6: Splits string into an array of individual characters.
//   - 7: Splits string into an array of single-digit numbers.
//   - 8: Joins array elements with a space.
//   - 9: Joins array elements with a newline character.
//   - 0: Joins array elements without any separator.
//   - Default: Returns the input value unchanged.
// Robustness: If conversion fails, the original input is returned.
function transformValue(valueToProcess, conversionMode) {
  try {
    switch(conversionMode) {
      case 1:
        return parseInt(valueToProcess, 10);
      case 2:
        return valueToProcess.split(" ");
      case 4:
        return valueToProcess.split(" ").map(Number);
      case 6:
        return valueToProcess.split("");
      case 7:
        return valueToProcess.split("").map(Number);
      case 8:
        return valueToProcess.join(" ");
      case 9:
        return valueToProcess.join("\n");
      case 0:
        return valueToProcess.join("");
      default:
        return valueToProcess;
    }
  } catch (errorDetails) {
    return valueToProcess;
  }
}

// The core algorithm implementation for solving the current challenge.
function runProblemSolver() {
  var initialConfiguration = fetchIntegerArray();
  var totalElements = initialConfiguration[0];
  var minimumRequired = initialConfiguration[1];
  var buildingHeights = fetchIntegerArray();
  var leastCost = Math.pow(10, 16);

  if (minimumRequired === 1) {
    printSolution(0);
    return;
  }

  // Iterate through all possible combinations using bit manipulation.
  for (var outerLoopCounter = 0; outerLoopCounter < (1 << totalElements); outerLoopCounter++) {
    var accumulatedCost = 0;
    var currentMaximumHeight = 0;
    var elementsChosen = 0;

    // Examine each element in the current combination.
    for (var innerLoopCounter = 0; innerLoopCounter < totalElements; innerLoopCounter++) {
      // Check if the element at innerLoopCounter index is part of the current combination.
      if ((outerLoopCounter & (1 << innerLoopCounter)) !== 0) {
        elementsChosen++;
        // If the current element's height is not strictly taller than the highest seen so far,
        // it must be increased, incurring a cost.
        if (currentMaximumHeight >= buildingHeights[innerLoopCounter]) {
          accumulatedCost += (currentMaximumHeight - buildingHeights[innerLoopCounter] + 1);
          currentMaximumHeight++; // The new highest point is now one unit above the old maximum.
        }
      }
      // Update the overall maximum height encountered up to this point,
      // considering the original height of the current element.
      currentMaximumHeight = Math.max(buildingHeights[innerLoopCounter], currentMaximumHeight);
    }

    // If the number of chosen elements meets the minimum requirement,
    // update the overall least cost if the current combination's cost is lower.
    if (elementsChosen >= minimumRequired) {
      leastCost = Math.min(leastCost, accumulatedCost);
    }
  }
  printSolution(leastCost);
}