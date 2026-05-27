"use strict";

const STDIN_FILE_PATH = "/dev/stdin";

const fileContent = require("fs").readFileSync(STDIN_FILE_PATH, "utf8");
const inputTokens = fileContent.split(/ |\n/);
let currentTokenPointer = 0;

const parseNumber = (value) => Number(value);

function retrieveNextToken(returnAsString) {
  const tokenValue = inputTokens[currentTokenPointer++];
  return returnAsString ? tokenValue : parseNumber(tokenValue);
}

function retrieveTokensArray(count, returnAsString) {
  const segment = inputTokens.slice(currentTokenPointer, currentTokenPointer + count);
  currentTokenPointer += count;
  return returnAsString ? segment : segment.map(parseNumber);
}

function retrieveMatrix(height, width, returnAsString) {
  const matrixResult = [];
  for (let rowIdx = 0; rowIdx < height; rowIdx++) {
    const rowSegment = inputTokens.slice(currentTokenPointer, currentTokenPointer + width);
    currentTokenPointer += width;
    matrixResult.push(returnAsString ? rowSegment : rowSegment.map(parseNumber));
  }
  return matrixResult;
}

function generateMultiDimArray(initialFillValue) {
  const functionArguments = arguments;
  let argLength = functionArguments.length;
  let evalString = `Array(functionArguments[${--argLength}]).fill().map(item => { return ${initialFillValue}; })`;
  while (--argLength) {
    evalString = `Array(functionArguments[${argLength}]).fill().map(item => ${evalString})`;
  }
  return eval(evalString);
}

const SEQUENCE_VALUES = [
  1, 1, 1, 2, 1, 2, 1, 5, 2, 2, 1, 5, 1, 2, 1, 14, 1, 5, 1, 5, 2, 2, 1, 15, 2, 2, 5, 4, 1, 4, 1, 51
];

function executeMainLogic() {
  const requestedIndex = retrieveNextToken();
  const zeroBasedIndex = requestedIndex - 1;
  return SEQUENCE_VALUES[zeroBasedIndex];
}

const finalOutput = executeMainLogic();
if (finalOutput !== undefined) {
  console.log(finalOutput);
}
