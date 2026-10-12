"use strict";

const calculateSubsetSumsAndQueries = (arrayLength, inputNumbers, queryCount, queryValues) => {
  const generatedSums = new Set();

  const totalCombinations = 1 << arrayLength;

  for (let subsetMask = 0; subsetMask < totalCombinations; subsetMask++) {
    let currentSum = 0;
    for (let elementIndex = 0; elementIndex < arrayLength; elementIndex++) {
      const currentBit = 1 << elementIndex;
      if ((subsetMask & currentBit) !== 0) {
        currentSum += inputNumbers[elementIndex];
      }
    }
    if (currentSum !== 0) {
      generatedSums.add(currentSum);
    }
  }

  const queryResults = [];
  for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
    const targetValue = queryValues[queryIndex];
    if (generatedSums.has(targetValue)) {
      queryResults.push("yes");
    } else {
      queryResults.push("no");
    }
  }
  return queryResults;
};

let lineCounter = 0;
let arrayLength = 0;
let inputNumbers = null;
let queryCount = 0;
let queryValues = null;

const parseNumberArray = (lineString) => {
  return lineString.trim().split(" ").map(numStr => Number(numStr));
};

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const LINE_N_INDEX = 1;
const LINE_AS_INDEX = 2;
const LINE_Q_INDEX = 3;
const LINE_MS_INDEX = 4;

inputReader.on("line", (currentLine) => {
  lineCounter++;

  switch (lineCounter) {
    case LINE_N_INDEX:
      arrayLength = Number(currentLine);
      break;
    case LINE_AS_INDEX:
      inputNumbers = parseNumberArray(currentLine);
      break;
    case LINE_Q_INDEX:
      queryCount = Number(currentLine);
      break;
    case LINE_MS_INDEX:
      queryValues = parseNumberArray(currentLine);
      const finalResults = calculateSubsetSumsAndQueries(arrayLength, inputNumbers, queryCount, queryValues);
      finalResults.forEach(outputItem => console.log(outputItem));
      process.exit(0);
      break;
    default:
      break;
  }
});
