"use strict";

const   importModule =   require("fs");
var fileContent = importModule.readFileSync  ("/dev/stdin", "utf8" );

var tokenArray = fileContent.split ( / |\n/ ) ,
    tokenIndex = 0;

function retrieveNextToken (isStringMode) {
  return isStringMode ? tokenArray[tokenIndex++] : Number(tokenArray[tokenIndex++]) ;
}

function retrieveTokenArray (count, isStringMode) {
  return isStringMode
    ? tokenArray.slice(tokenIndex, tokenIndex += count)
    : tokenArray.slice(tokenIndex, tokenIndex += count).map( (itemValue) => Number(itemValue) );
}

function retrieveMatrix (heightDim, widthDim, isStringMode) {
  var resultMatrix = [],
      rowIndex = 0;
  if (isStringMode) {
    for ( ; rowIndex < heightDim ; rowIndex++ ) {
      resultMatrix.push( tokenArray.slice(tokenIndex, tokenIndex += widthDim) );
    }
  } else {
    for ( ; rowIndex < heightDim ; rowIndex++ ) {
      resultMatrix.push( tokenArray.slice(tokenIndex, tokenIndex += widthDim).map( (cellValue) => Number(cellValue) ) );
    }
  }
  return resultMatrix;
}

function createMultiDimArray (initialFillValue) {
  var argumentList = arguments,
      dimensionCount = argumentList.length,
      arrayDefinitionString = "Array(argumentList[" + --dimensionCount + "]).fill().map(elementPlaceholder => { return " + initialFillValue + "; })";
  while (--dimensionCount) {
    arrayDefinitionString = "Array(argumentList[" + dimensionCount + "]).fill().map(elementPlaceholder => " + arrayDefinitionString + ")";
  }
  return eval(arrayDefinitionString);
}

var programResult = primaryExecution();

if (programResult !== undefined) {
  console.log(programResult);
}

function primaryExecution () {
  const inputNumbers = retrieveTokenArray ( 7 );

  let finalResult = inputNumbers[1] + (
    Math.floor(inputNumbers[0] / 2) +
    Math.floor(inputNumbers[3] / 2) +
    Math.floor(inputNumbers[4] / 2)
  ) * 2;

  const paritySum = (inputNumbers[0] % 2) + (inputNumbers[3] % 2) + (inputNumbers[4] % 2);

  switch (paritySum) {
    case 3:
      finalResult += 3;
      break;
    case 2:
      if (inputNumbers[0] * inputNumbers[3] * inputNumbers[4]) {
        finalResult += 1;
      }
      break;
  }
  return finalResult;
}