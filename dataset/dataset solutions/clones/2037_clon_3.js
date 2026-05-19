"use strict";
const rawData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenBuffer = rawData.split(/\s+/).filter(Boolean);
let tokenIndex = 0;

const parseToken = (isStringRequested) => {
  const currentToken = tokenBuffer[tokenIndex++];
  return isStringRequested ? currentToken : Number(currentToken);
};

function getNextToken(isStringRequested) {
  return parseToken(isStringRequested);
}

function getMultipleTokens(count, isStringRequested) {
  const tokens = [];
  for (let i = 0; i < count; i++) {
    tokens.push(parseToken(isStringRequested));
  }
  return tokens;
}

function getMatrixTokens(height, width, isStringRequested) {
  const matrixRows = [];
  for (let i = 0; i < height; i++) {
    const row = [];
    for (let j = 0; j < width; j++) {
      row.push(parseToken(isStringRequested));
    }
    matrixRows.push(row);
  }
  return matrixRows;
}

function createMultiDimArray(initialValue) {
  const args = arguments;
  const argCount = args.length;
  let currentDimIndex = argCount - 1;
  let arrayCreationString = "Array(args[" + currentDimIndex + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--currentDimIndex) {
    arrayCreationString = "Array(args[" + currentDimIndex + "]).fill().map(x=>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

const calculateCombinations = (value) => {
  if (value <= 0) {
    return 0;
  }
  return value * (value - 1) / 2;
};

function executeProgram() {
  const firstVal = getNextToken();
  const secondVal = getNextToken();

  const combinationsN = calculateCombinations(firstVal);
  const combinationsM = calculateCombinations(secondVal);

  return combinationsN + combinationsM;
}

const programResult = executeProgram();
if (programResult !== undefined) {
  console.log(programResult);
}
