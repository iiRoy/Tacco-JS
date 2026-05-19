"use strict";
function InputParser(sourceString, valueParseFn) {
  this.sourceLines = sourceString.split("\n");
  this.currentColumnIndex = 0;
  this.currentLineIndex = 0;
  this.parseFunction = valueParseFn || Number;
}

InputParser.prototype.readNextValue = function() {
  const currentLineContent = this.sourceLines[this.currentLineIndex];
  if (!currentLineContent) {
    return;
  }

  const lineTokens = currentLineContent.trim().split(" ");
  const valueToParse = lineTokens[this.currentColumnIndex];

  this.currentColumnIndex++;

  if (lineTokens.length === this.currentColumnIndex) {
    this.currentColumnIndex = 0;
    this.currentLineIndex++;
  }
  return this.parseFunction(valueToParse);
};

InputParser.prototype.readCurrentLine = function() {
  const lineData = this.sourceLines[this.currentLineIndex];
  if (!lineData) {
    return;
  }
  this.currentColumnIndex = 0;
  this.currentLineIndex++;
  return lineData.split(" ").map(this.parseFunction);
};

module.exports = InputParser;

function processInput(inputData) {
  const parserInstance = new InputParser(inputData);
  
  const numElements = parserInstance.readNextValue();

  const inputNumbers = Array.from({ length: numElements }, () => parserInstance.readNextValue());

  const dynamicProgrammingTable = Array.from({ length: numElements + 1 }, () => new Array(5).fill(0));
  dynamicProgrammingTable[0] = [0, 0, 0, 0, 0];

  const getMinFromPrevious = (prevRow, indices) => Math.min(...indices.map(idx => prevRow[idx]));

  for (let i = 1; i <= numElements; i++) {
    const currentNumber = inputNumbers[i - 1];
    const costIfEven = (currentNumber === 0) ? 2 : (currentNumber % 2);
    const costIfOdd = (currentNumber + 1) % 2;

    const previousRow = dynamicProgrammingTable[i - 1];

    dynamicProgrammingTable[i][0] = previousRow[0] + currentNumber;
    dynamicProgrammingTable[i][1] = getMinFromPrevious(previousRow, [0, 1]) + costIfEven;
    dynamicProgrammingTable[i][2] = getMinFromPrevious(previousRow, [0, 1, 2]) + costIfOdd;
    dynamicProgrammingTable[i][3] = getMinFromPrevious(previousRow, [2, 3]) + costIfEven;
    dynamicProgrammingTable[i][4] = getMinFromPrevious(previousRow, [0, 1, 2, 3, 4]) + currentNumber;
  }

  console.log(Math.min(...dynamicProgrammingTable[numElements]));
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
