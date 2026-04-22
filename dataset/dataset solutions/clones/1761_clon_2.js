"use strict";

var dataSource = require("fs").readContentSync("/dev/stdin", "utf8");
var tokenStream = dataSource.split(/ |\n/),
    tokenIndex = 0;

function getNextInt() {
  return +tokenStream[tokenIndex++];
}

function getNextString() {
  return tokenStream[tokenIndex++];
}

function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

function getNextMany(count, asStrings) {
  return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(item => +item);
}

function getNextMatrix(rows, cols, asStrings) {
  var matrixResult = [],
      rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < rows; rowIndex++) {
      matrixResult.push(tokenStream.slice(tokenIndex, tokenIndex += cols));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      matrixResult.push(tokenStream.slice(tokenIndex, tokenIndex += cols).map(item => +item));
    }
  }
  return matrixResult;
}

function multiDimArray(initialVal) {
  var argsList = arguments,
      argsLen = argsList.length,
      arrayCreationCode = "Array(argsList[" + --argsLen + "]).fill().map(item => {return " + initialVal + ";})";
  while (--argsLen) {
    arrayCreationCode = "Array(argsList[" + argsLen + "]).fill().map(item =>" + arrayCreationCode + ")";
  }
  return eval(arrayCreationCode);
}

var primeDivisor = 998244353;

function modularMultiply() {
  var factorArray = arguments,
      productAccumulator = factorArray[0],
      loopCounter = factorArray.length;
  while (--loopCounter) {
    productAccumulator = ((productAccumulator >> 16) * factorArray[loopCounter] % primeDivisor * 65536 + (productAccumulator & 65535) * factorArray[loopCounter]) % primeDivisor;
  }
  return productAccumulator;
}

var factorials = [],
    inverseFactorials = [],
    inverseElements = [],
    powersOfTwo = [];

function precomputeFactorials(limitVal) {
  factorials.length = limitVal + 1;
  factorials[0] = factorials[1] = 1;
  for (var currentVal = 2; currentVal <= limitVal;) {
    factorials[currentVal] = modularMultiply(factorials[currentVal - 1], currentVal++);
  }
  inverseFactorials.length = limitVal + 1;
  inverseFactorials[0] = inverseFactorials[1] = 1;
  inverseFactorials[limitVal] = modularInverse(factorials[limitVal]);
  for (currentVal = limitVal; 2 < currentVal;) {
    inverseFactorials[currentVal - 1] = modularMultiply(inverseFactorials[currentVal], currentVal--);
  }
  // inverseElements.length = limitVal + 1;
  // inverseElements[0] = inverseElements[1] = 1;
  // for (currentVal = 2; currentVal <= limitVal;) {
  //   inverseElements[currentVal] = modularMultiply(factorials[currentVal - 1], inverseFactorials[currentVal++]);
  // }
  // powersOfTwo.length = limitVal + 1;
  // powersOfTwo[0] = 1;
  // for (currentVal = 1; currentVal <= limitVal; currentVal++) {
  //   powersOfTwo[currentVal] = powersOfTwo[currentVal - 1] * 2 % primeDivisor;
  // }
}

function modularInverse(numValue) {
  var modulusCopy = primeDivisor,
      xCoefficient = 0,
      yCoefficient = 1,
      tempVar;
  for (; numValue; yCoefficient = tempVar) {
    tempVar = modulusCopy / numValue | 0;
    modulusCopy -= tempVar * numValue;
    xCoefficient -= tempVar * yCoefficient;
    tempVar = modulusCopy;
    modulusCopy = numValue;
    numValue = tempVar;
    tempVar = xCoefficient;
    xCoefficient = yCoefficient;
  }
  xCoefficient %= primeDivisor;
  return xCoefficient < 0 ? xCoefficient + primeDivisor : xCoefficient;
}

function modularExponentiation(baseVal, exponentVal) {
  var resultVal = 1;
  for (; exponentVal; baseVal = modularMultiply(baseVal, baseVal), exponentVal >>= 1) {
    if (exponentVal & 1) {
      resultVal = modularMultiply(baseVal, resultVal);
    }
  }
  return resultVal;
}

function combinationsMod(totalItems, chosenItems) {
  return modularMultiply(factorials[totalItems], inverseFactorials[chosenItems], inverseFactorials[totalItems - chosenItems]);
}

function permutationsMod(totalItems, chosenItems) {
  return modularMultiply(factorials[totalItems], inverseFactorials[totalItems - chosenItems]);
}

function normalizeModulo(numValue) {
  return (numValue % primeDivisor + primeDivisor) % primeDivisor;
}

var programOutput = executeProgram();

if (programOutput !== undefined) {
  console.log(programOutput);
}

function executeProgram() {
  var [valA, valB, valC, valD] = getNextMany(4);
  var dynamicArray = multiDimArray(0, valC + 1, valD + 1);
  dynamicArray[valA][valB] = 1;
  for (var rowIdx = valA; rowIdx <= valC; rowIdx++) {
    for (var colIdx = valB; colIdx <= valD; colIdx++) {
      dynamicArray[rowIdx][colIdx] += dynamicArray[rowIdx - 1][colIdx] * colIdx + dynamicArray[rowIdx][colIdx - 1] * rowIdx - modularMultiply(dynamicArray[rowIdx - 1][colIdx - 1], rowIdx - 1, colIdx - 1);
      dynamicArray[rowIdx][colIdx] %= primeDivisor;
    }
  }
  return normalizeModulo(dynamicArray[valC][valD]);
}