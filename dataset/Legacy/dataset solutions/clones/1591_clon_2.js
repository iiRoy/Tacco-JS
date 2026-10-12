"use strict";

// Standard input reading utilities
var tokenArray = require("fs").readFileSync("/dev/stdin", "utf8").split(/ |\n/);
var tokenIndex = 0x0;

function getNextNum() {
  return +tokenArray[tokenIndex++];
}

function getNextStr() {
  return tokenArray[tokenIndex++];
}

function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

function getNumsSlice(count, isRaw) {
  // If isRaw is true, return strings; otherwise, parse to numbers
  return isRaw ? tokenArray.slice(tokenIndex, tokenIndex += count) : tokenArray.slice(tokenIndex, tokenIndex += count).map(valStr => +valStr);
}

function getMatrix(height, width, rawMode) {
  var matrixRows = [];
  var rowIndex = 0x0;
  if (rawMode) {
    for (; rowIndex < height; rowIndex++) {
      matrixRows.push(tokenArray.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowIndex < height; rowIndex++) {
      matrixRows.push(tokenArray.slice(tokenIndex, tokenIndex += width).map(elemStr => +elemStr));
    }
  }
  return matrixRows;
}

// Function to create multi-dimensional arrays with an initial value
function createMultiDimArray(initialValue) {
  var dimArgs = arguments;
  var dimCount = dimArgs.length;
  var arrayInitStr = "Array(dimArgs[" + --dimCount + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--dimCount) {
    arrayInitStr = "Array(dimArgs[" + dimCount + "]).fill().map(x=>" + arrayInitStr + ")";
  }
  return eval(arrayInitStr);
}


// Execute the main program logic
var programResult = executeProgram();

// Output the result if it's not undefined
if (programResult !== undefined) {
  console.log(String(programResult));
}


function executeProgram() {
  var dimensionSize = getNextNum();
  // Initialize DP table, max value found, and offset counter
  var dynamicProgTable = createMultiDimArray(-0x1, dimensionSize, dimensionSize);
  var maxValFound = 0x0;
  var offsetCount = 0x0;

  // Read the initial pair of numbers and sort them
  var currentPair = getNumsSlice(0x2).sort((valA, valB) => valA - valB);

  var updateQueue = [];

  // Set initial DP state based on the first pair
  dynamicProgTable[currentPair[0x0] - 0x1][currentPair[0x1] - 0x1] = 0x0;

  // Iterate through subsequent inputs to update DP table
  for (var iterationIdx = 0x1; iterationIdx < dimensionSize; iterationIdx++) {
    // Read the triple, sort, and adjust indices by subtracting one
    var currentTriple = getNumsSlice(0x3).sort((elemA, elemB) => elemA - elemB).map(mappedVal => mappedVal - 0x1);

    // If the first and third elements of the triple are identical, increment offset and skip
    if (currentTriple[0x0] === currentTriple[0x2]) {
      offsetCount++;
      continue;
    }

    // Clear the queue for this iteration's updates
    updateQueue = [];

    // Process various state transitions based on the current triple
    processState(currentTriple[0x0], currentTriple[0x0], currentTriple[0x1], currentTriple[0x2]);

    if (currentTriple[0x0] !== currentTriple[0x1]) {
      processState(currentTriple[0x1], currentTriple[0x1], currentTriple[0x0], currentTriple[0x2]);
    } else {
      for (var loopVarJ = 0x0; loopVarJ < currentTriple[0x0]; loopVarJ++) {
        processState(loopVarJ, currentTriple[0x0], loopVarJ, currentTriple[0x2]);
      }
      for (var loopVarJ = currentTriple[0x0] + 0x1; loopVarJ < currentTriple[0x2]; loopVarJ++) {
        processState(currentTriple[0x0], loopVarJ, loopVarJ, currentTriple[0x2]);
      }
      for (var loopVarJ = currentTriple[0x2]; loopVarJ < dimensionSize; loopVarJ++) {
        processState(currentTriple[0x0], loopVarJ, currentTriple[0x2], loopVarJ);
      }
    }

    if (currentTriple[0x1] !== currentTriple[0x2]) {
      processState(currentTriple[0x2], currentTriple[0x2], currentTriple[0x0], currentTriple[0x1]);
    } else {
      for (var loopVarJ = 0x0; loopVarJ < currentTriple[0x0]; loopVarJ++) {
        processState(loopVarJ, currentTriple[0x1], loopVarJ, currentTriple[0x0]);
      }
      for (var loopVarJ = currentTriple[0x0]; loopVarJ < currentTriple[0x2]; loopVarJ++) {
        processState(loopVarJ, currentTriple[0x2], currentTriple[0x0], loopVarJ);
      }
      for (var loopVarJ = currentTriple[0x2] + 0x1; loopVarJ < dimensionSize; loopVarJ++) {
        processState(currentTriple[0x2], loopVarJ, currentTriple[0x0], loopVarJ);
      }
    }

    // Apply all collected updates from the queue to the DP table
    while (updateQueue.length) {
      var weightVal = updateQueue.pop();
      var colIdx = updateQueue.pop();
      var rowIdx = updateQueue.pop();
      dynamicProgTable[rowIdx][colIdx] = Math.max(dynamicProgTable[rowIdx][colIdx], weightVal);
    }
  }

  // Perform a final processing step with the last input
  var finalIndex = getNextNum() - 0x1;
  processState(finalIndex, finalIndex, finalIndex, finalIndex);

  // Return the maximum value found plus the accumulated offset
  return maxValFound + offsetCount;

  // Helper function to update DP states and track the overall maximum value
  function processState(paramT, paramU, paramV, paramW) {
    var calculatedValue = Math.max(dynamicProgTable[paramV][paramW], dynamicProgTable[paramT][paramU] + 0x1);
    updateQueue.push(paramV, paramW, calculatedValue);
    maxValFound = Math.max(maxValFound, calculatedValue);
  }
}
