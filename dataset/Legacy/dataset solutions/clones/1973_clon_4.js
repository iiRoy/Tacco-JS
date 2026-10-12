"use strict";
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenBuffer = fileContent.split(/ |\n/);
let bufferPointer = 0;

function retrieveNextValue(asString) {
  return asString ? tokenBuffer[bufferPointer++] : Number(tokenBuffer[bufferPointer++]);
}

function retrieveValueSequence(count, asString) {
  const start = bufferPointer;
  bufferPointer += count;
  return asString ? tokenBuffer.slice(start, bufferPointer) : tokenBuffer.slice(start, bufferPointer).map(Number);
}

function retrieveMatrix(rows, columns, asString) {
  const resultMatrix = [];
  for (let r = 0; r < rows; r++) {
    const rowStart = bufferPointer;
    bufferPointer += columns;
    resultMatrix.push(asString ? tokenBuffer.slice(rowStart, bufferPointer) : tokenBuffer.slice(rowStart, bufferPointer).map(Number));
  }
  return resultMatrix;
}

function createInitializedArray(size, initialValue) {
  return Array.from({ length: size }, () => initialValue);
}

const computationResult = executeMainLogic();
if (computationResult !== undefined) {
  console.log(computationResult);
}

function executeMainLogic() {
  const totalCount = retrieveNextValue();
  const weightedItems = [];
  for (let idx = 0; idx < totalCount; idx++) {
    weightedItems.push([retrieveNextValue(), idx]);
  }

  weightedItems.sort((itemA, itemB) => itemB[0] - itemA[0]);

  let previousMaxValues = createInitializedArray(totalCount + 1, 0);
  let currentMaxValues = createInitializedArray(totalCount + 1, 0);

  for (let currentItemIndex = 0; currentItemIndex < totalCount; currentItemIndex++) {
    const [itemWeight, originalPosition] = weightedItems[currentItemIndex];

    currentMaxValues[0] = previousMaxValues[0] + (originalPosition - currentItemIndex) * itemWeight;

    currentMaxValues[currentItemIndex + 1] = previousMaxValues[currentItemIndex] + (totalCount - currentItemIndex - originalPosition - 1) * itemWeight;

    for (let subsetSize = 1; subsetSize <= currentItemIndex; subsetSize++) {
      const option1 = previousMaxValues[subsetSize] + (originalPosition - (currentItemIndex - subsetSize)) * itemWeight;
      const option2 = previousMaxValues[subsetSize - 1] + (totalCount - subsetSize - originalPosition) * itemWeight;
      currentMaxValues[subsetSize] = Math.max(option1, option2);
    }
    
    previousMaxValues = [...currentMaxValues];
  }

  return Math.max(...previousMaxValues);
}
