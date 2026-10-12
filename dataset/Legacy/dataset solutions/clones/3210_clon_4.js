"use strict";

const parseInputData = (rawText) => {
  const lines = rawText.split("\n");
  const lengthIndicator = Number(lines[0]);
  const numberSequence = lines.slice(1, lengthIndicator + 1).map(Number);
  return { lengthIndicator, numberSequence };
};

const calculateElementCosts = (value) => ({
  evenParityCost: value === 0 ? 2 : value % 2,
  oddParityCost: (value + 1) % 2,
});

const processInputData = (rawInput) => {
  const { lengthIndicator: seqLen, numberSequence: elements } = parseInputData(rawInput);

  const initialCostMatrix = [[0, 0, 0, 0, 0]];

  const findMinPrefix = (arr, count) => {
    let minVal = Infinity;
    for (let k = 0; k < count; k++) {
      if (arr[k] < minVal) {
        minVal = arr[k];
      }
    }
    return minVal;
  };

  const buildCostMatrixReducer = (accumulatedMatrix, currentElementValue) => {
    const previousRow = accumulatedMatrix[accumulatedMatrix.length - 1];
    const { evenParityCost, oddParityCost } = calculateElementCosts(currentElementValue);

    const newRow = Array(5);

    newRow[0] = previousRow[0] + currentElementValue;
    newRow[1] = findMinPrefix(previousRow, 2) + evenParityCost;
    newRow[2] = findMinPrefix(previousRow, 3) + oddParityCost;
    newRow[3] = findMinPrefix(previousRow, 4) + evenParityCost;
    newRow[4] = findMinPrefix(previousRow, 5) + currentElementValue;

    accumulatedMatrix.push(newRow);
    return accumulatedMatrix;
  };

  const finalCostMatrix = elements.reduce(buildCostMatrixReducer, initialCostMatrix);

  const resultRow = finalCostMatrix[seqLen];
  return Math.min(...resultRow);
};

const executeProgram = (inputSource) => {
  const fileContent = inputSource.readFileSync("/dev/stdin", "utf8");
  const finalResult = processInputData(fileContent);
  console.log(finalResult);
};

executeProgram(require("fs"));
