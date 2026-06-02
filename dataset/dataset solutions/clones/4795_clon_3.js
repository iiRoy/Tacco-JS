"use strict";
var rawData = require("fs").readFileSync("/dev/stdin","utf8");
var tokenBuffer = rawData.split(/ |\n/), tokenIndex = 0;

function readNextToken(isStringRequested){
  return isStringRequested ? tokenBuffer[tokenIndex++] : +tokenBuffer[tokenIndex++];
}

function readTokensArray(count, returnStrings){
  return returnStrings ? tokenBuffer.slice(tokenIndex, tokenIndex += count) : tokenBuffer.slice(tokenIndex, tokenIndex += count).map(value => +value);
}

function readMatrix(height, width, returnStrings){
  var resultMatrix = [], rowCounter = 0;
  if(returnStrings) {
    for(; rowCounter < height; rowCounter++) resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width));
  } else {
    for(; rowCounter < height; rowCounter++) resultMatrix.push(tokenBuffer.slice(tokenIndex, tokenIndex += width).map(value => +value));
  }
  return resultMatrix;
}

function createMultiDimArray(initialFillValue){
  var dimensionArgs = arguments, argCount = dimensionArgs.length, expressionString = "Array(dimensionArgs[" + --argCount + "]).fill().map(x=>{return " + initialFillValue + ";})";
  while(--argCount) expressionString = "Array(dimensionArgs[" + argCount + "]).fill().map(x=>" + expressionString + ")";
  return eval(expressionString);
}

var programResult = executeLogic();
if(programResult !== undefined) console.log(programResult);

function executeLogic(){
  var inputNumbers = readTokensArray(7);

  var sumOfHalvedValues = Math.floor(inputNumbers[0] / 2) + Math.floor(inputNumbers[3] / 2) + Math.floor(inputNumbers[4] / 2);
  var finalResult = inputNumbers[1] + sumOfHalvedValues * 2;

  var paritySum = (inputNumbers[0] % 2) + (inputNumbers[3] % 2) + (inputNumbers[4] % 2);

  if (paritySum === 3) {
    finalResult += 3;
  } else if (paritySum === 2) {
    var allPositive = inputNumbers[0] > 0 && inputNumbers[3] > 0 && inputNumbers[4] > 0;
    if (allPositive) {
      finalResult += 1;
    }
  }
  return finalResult;
}
