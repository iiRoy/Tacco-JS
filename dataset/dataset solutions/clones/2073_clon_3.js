"use strict";
var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenizedInput = rawInputData.split(/ |\n/);
var currentTokenIndex = 0;

function getNextToken(isStringFlag) {
  const currentVal = tokenizedInput[currentTokenIndex];
  currentTokenIndex++;
  return isStringFlag ? currentVal : +currentVal;
}

function getMultipleTokens(count, isStringFlag) {
  const startIndex = currentTokenIndex;
  const endIndex = currentTokenIndex + count;
  currentTokenIndex = endIndex;
  const segment = tokenizedInput.slice(startIndex, endIndex);
  if (isStringFlag) {
    return segment;
  } else {
    return segment.map(item => +item);
  }
}

function getMatrixTokens(height, width, isStringFlag) {
  const resultMatrix = [];
  let rowCounter = 0;
  while (rowCounter < height) {
    const rowStartIndex = currentTokenIndex;
    const rowEndIndex = currentTokenIndex + width;
    currentTokenIndex = rowEndIndex;
    const currentRow = tokenizedInput.slice(rowStartIndex, rowEndIndex);
    if (isStringFlag) {
      resultMatrix.push(currentRow);
    } else {
      resultMatrix.push(currentRow.map(item => +item));
    }
    rowCounter++;
  }
  return resultMatrix;
}

function createMultiDimArray(initialValue) {
  var args = arguments, argCount = args.length, evalString;
  var lastArgIndex = argCount - 1;
  evalString = "Array(args[" + lastArgIndex + "]).fill().map(x=>{return " + initialValue + ";})";
  var currentArgIndex = lastArgIndex;
  while (--currentArgIndex) {
    evalString = "Array(args[" + currentArgIndex + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

var programResult = executeLogic();
if (programResult !== undefined) {
  console.log(programResult);
}

function executeLogic() {
  const valA = getNextToken(false);
  const valB = getNextToken(false);
  const valC = getNextToken(false);

  const sqrtA = Math.sqrt(valA);
  const sqrtB = Math.sqrt(valB);
  const sqrtC = Math.sqrt(valC);

  const sumOfRoots = sqrtA + sqrtB;
  const isConditionMet = sumOfRoots < sqrtC;

  if (isConditionMet) {
    return "Yes";
  } else {
    return "No";
  }
}
