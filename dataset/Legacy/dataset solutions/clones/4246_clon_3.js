"use strict";
var rawData = require("fs").readFileSync("/dev/stdin","utf8");
var tokenizedInput = rawData.split(/ |\n/), tokenIndex = 0;

function getNextInt(){ return +tokenizedInput[tokenIndex++]; }
function getNextString(){ return tokenizedInput[tokenIndex++]; }
function getNextBigInt(){ return BigInt(tokenizedInput[tokenIndex++]); }

function getNValues(count, shouldParseAsNumbers){
  const startIndex = tokenIndex;
  tokenIndex += count;
  const slicedTokens = tokenizedInput.slice(startIndex, tokenIndex);
  if (shouldParseAsNumbers) {
    return slicedTokens.map(val => +val);
  } else {
    return slicedTokens;
  }
}

function getMatrix(height, width, shouldParseAsNumbers){
  var resultMatrix = [];
  for (let rowCounter = 0; rowCounter < height; rowCounter++) {
    const startIndex = tokenIndex;
    tokenIndex += width;
    const rowTokens = tokenizedInput.slice(startIndex, tokenIndex);
    if (shouldParseAsNumbers) {
      resultMatrix.push(rowTokens.map(val => +val));
    } else {
      resultMatrix.push(rowTokens);
    }
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue){
  var args = arguments, len = args.length, currentDimIndex = args.length - 1,
      arrayCreationString = "Array(args[" + currentDimIndex + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--currentDimIndex >= 0) {
    arrayCreationString = "Array(args[" + currentDimIndex + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

var programResult = executeLogic();
if (programResult !== undefined) {
  console.log(String(programResult));
}

function executeLogic(){
  var arraySize = getNextInt();
  var dataArray = [0].concat(getNValues(arraySize, true));
  const maxValidIndex = arraySize;

  // Helper function to compute the sum of elements at multiples of a given step
  const calculateMultiplesSum = (startIdx, endIdx, stepValue, targetArray) => {
    let currentSum = 0;
    for (let k = startIdx; k <= endIdx; k += stepValue) {
      currentSum += targetArray[k];
    }
    return currentSum;
  };

  // Helper function to set elements at multiples of a given step to zero
  const zeroOutMultiples = (startIdx, endIdx, stepValue, targetArray) => {
    for (let k = startIdx; k <= endIdx; k += stepValue) {
      targetArray[k] = 0;
    }
  };

  for (var outerLoopIndex = maxValidIndex; outerLoopIndex >= 1; outerLoopIndex--) {
    // Guard clause: If the element at the current index is non-negative,
    // no further action is required for this specific index.
    if (dataArray[outerLoopIndex] >= 0) {
      continue;
    }

    // Calculate the sum of elements at indices that are multiples of outerLoopIndex
    var currentSegmentSum = calculateMultiplesSum(outerLoopIndex, maxValidIndex, outerLoopIndex, dataArray);

    // If the calculated sum is negative, perform the zeroing operation and restart the main loop.
    if (currentSegmentSum < 0) {
      zeroOutMultiples(outerLoopIndex, maxValidIndex, outerLoopIndex, dataArray);
      outerLoopIndex = maxValidIndex; // Reset the outer loop index to re-evaluate from the largest index
    }
  }

  // Calculate the final sum of all elements in the modified array
  let finalAccumulatedSum = 0;
  for (let k = 0; k < dataArray.length; k++) {
      finalAccumulatedSum += dataArray[k];
  }
  return finalAccumulatedSum;
}
