"use strict" ;
const dataContent = require("fs").readFileSync("/app/input.txt", "utf-8");
let inputTokens = dataContent.split(/ |\n/), tokenCursor = 0;

function getNextInt() { return Number(inputTokens[tokenCursor++]); }

function getNextString() { return inputTokens[tokenCursor++]; }

function getNextBigInt() { return BigInt(inputTokens[tokenCursor++]); }

function getSequence(numElements, asNumbers) {
  return asNumbers ? inputTokens.slice(tokenCursor, tokenCursor += numElements) : inputTokens.slice(tokenCursor, tokenCursor += numElements).map(itemValue => Number(itemValue));
}

function getMatrix(numRows, numCols, asNumbers) {
  let matrixResult = [], rowIndex = 0;
  if (asNumbers) {
    for (; rowIndex < numRows; rowIndex++) {
      matrixResult.push(inputTokens.slice(tokenCursor, tokenCursor += numCols));
    }
  } else {
    for (; rowIndex < numRows; rowIndex++) {
      matrixResult.push(inputTokens.slice(tokenCursor, tokenCursor += numCols).map(itemValue => Number(itemValue)));
    }
  }
  return matrixResult;
}

function createDynamicArray(defaultValue) {
  const arrayDimensions = arguments;
  let dimCount = arrayDimensions.length;
  let arrayCodeString = "Array(arrayDimensions[" + --dimCount + "]).fill().map(arrayElement => { return " + defaultValue + "; })";
  while (--dimCount) {
    arrayCodeString = "Array(arrayDimensions[" + dimCount + "]).fill().map(arrayElement => " + arrayCodeString + ")";
  }
  return eval(arrayCodeString);
}

let programOutput = executeLogic();
if (programOutput !== undefined) console.log(String(programOutput));

function executeLogic() {
  const stringLength = getNextInt();
  const binaryStringVal = getNextString();
  let popcountModulo = 1;

  for (let loopIterator = 0; loopIterator < stringLength; loopIterator++) {
    if (binaryStringVal[loopIterator] === "1") {
      popcountModulo++;
    }
  }

  const resultArray = createDynamicArray(0, stringLength);
  let currentModSum = 0;

  for (let loopIterator = 0; loopIterator < stringLength; loopIterator++) {
    currentModSum *= 2;
    currentModSum += Number(binaryStringVal[loopIterator]);
    currentModSum %= popcountModulo;
  }

  let powerTerm = 1;

  for (let loopIterator = stringLength; loopIterator--;) {
    if (binaryStringVal[loopIterator] === "0") {
      resultArray[loopIterator] = 1;
      let tempCalculation = currentModSum + powerTerm;
      tempCalculation %= popcountModulo;
      while (tempCalculation) {
        tempCalculation %= countSetBits(tempCalculation);
        resultArray[loopIterator]++;
      }
    }
    powerTerm = (powerTerm * 2) % popcountModulo;
  }

  popcountModulo -= 2;
  if (popcountModulo < 1) {
    return resultArray.join("\n");
  }

  currentModSum = 0;
  for (let loopIterator = 0; loopIterator < stringLength; loopIterator++) {
    currentModSum *= 2;
    currentModSum += Number(binaryStringVal[loopIterator]);
    currentModSum %= popcountModulo;
  }

  powerTerm = popcountModulo - 1;
  for (let loopIterator = stringLength; loopIterator--;) {
    if (binaryStringVal[loopIterator] === "1") {
      resultArray[loopIterator] = 1;
      let tempCalculation = currentModSum + powerTerm;
      tempCalculation %= popcountModulo;
      while (tempCalculation) {
        tempCalculation %= countSetBits(tempCalculation);
        resultArray[loopIterator]++;
      }
    }
    powerTerm = (powerTerm * 2) % popcountModulo;
  }

  return resultArray.join("\n");
}

function countSetBits(inputNumber) {
  inputNumber = (inputNumber & 0x55555555) + (inputNumber >>> 1 & 0x55555555);
  inputNumber = (inputNumber & 0x33333333) + (inputNumber >>> 2 & 0x33333333);
  inputNumber = (inputNumber & 0x0F0F0F0F) + (inputNumber >>> 4 & 0x0F0F0F0F);
  inputNumber = (inputNumber & 0x00FF00FF) + (inputNumber >>> 8 & 0x00FF00FF);
  return (inputNumber & 0x0000FFFF) + (inputNumber >>> 16 & 0x0000FFFF);
}