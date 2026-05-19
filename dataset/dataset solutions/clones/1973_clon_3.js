"use strict";

const InputReader = function(sourceContent) {
  let tokenBuffer = sourceContent.split(/ |\n/);
  let currentTokenPosition = 0;

  this.readNextValue = function(asString = false) {
    const token = tokenBuffer[currentTokenPosition++];
    return asString ? token : Number(token);
  };

  this.readMultipleValues = function(count, asString = false) {
    const segment = tokenBuffer.slice(currentTokenPosition, currentTokenPosition + count);
    currentTokenPosition += count;
    return asString ? segment : segment.map(Number);
  };

  this.readMatrixValues = function(rows, cols, asString = false) {
    const resultMatrix = [];
    for (let r = 0; r < rows; r++) {
      const rowTokens = tokenBuffer.slice(currentTokenPosition, currentTokenPosition + cols);
      currentTokenPosition += cols;
      resultMatrix.push(asString ? rowTokens : rowTokens.map(Number));
    }
    return resultMatrix;
  };
};

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const dataProcessor = new InputReader(fileData);

function generateMultiDimensionalArray(defaultValue, ...dimensions) {
  if (dimensions.length === 0) {
    return defaultValue;
  }

  let arrayConstructionString = `Array(dimensions[${dimensions.length - 1}]).fill().map(() => defaultValue)`;
  for (let dimIndex = dimensions.length - 2; dimIndex >= 0; dimIndex--) {
    arrayConstructionString = `Array(dimensions[${dimIndex}]).fill().map(() => ${arrayConstructionString})`;
  }
  return eval(arrayConstructionString);
}

const programOutput = executeMainAlgorithm();
if (programOutput !== undefined) {
  console.log(programOutput);
}

function executeMainAlgorithm() {
  const totalItems = dataProcessor.readNextValue();
  const itemsWithInitialOrder = [];

  const ITEM_VALUE_KEY = 0;
  const ORIGINAL_POSITION_KEY = 1;

  for (let itemIdx = 0; itemIdx < totalItems; itemIdx++) {
    const value = dataProcessor.readNextValue();
    itemsWithInitialOrder.push([value, itemIdx]);
  }

  itemsWithInitialOrder.sort((itemA, itemB) => itemB[ITEM_VALUE_KEY] - itemA[ITEM_VALUE_KEY]);

  const dpTable = generateMultiDimensionalArray(0, totalItems + 1);

  for (let currentProcessingIdx = 0; currentProcessingIdx < totalItems; currentProcessingIdx++) {
    const currentItemData = itemsWithInitialOrder[currentProcessingIdx];
    const currentItemVal = currentItemData[ITEM_VALUE_KEY];
    const currentItemOriginalPos = currentItemData[ORIGINAL_POSITION_KEY];

    const contributionForNextState = (totalItems - currentProcessingIdx - currentItemOriginalPos - 1) * currentItemVal;
    dpTable[currentProcessingIdx + 1] = dpTable[currentProcessingIdx] + contributionForNextState;

    for (let previousStateIdx = currentProcessingIdx; previousStateIdx > 0; previousStateIdx--) {
      const directContribution = (currentItemOriginalPos - (currentProcessingIdx - previousStateIdx)) * currentItemVal;
      dpTable[previousStateIdx] += directContribution;

      const alternativePathContribution = (totalItems - previousStateIdx - currentItemOriginalPos) * currentItemVal;
      const candidateValue = dpTable[previousStateIdx - 1] + alternativePathContribution;
      
      dpTable[previousStateIdx] = Math.max(dpTable[previousStateIdx], candidateValue);
    }

    const contributionForBaseState = (currentItemOriginalPos - currentProcessingIdx) * currentItemVal;
    dpTable[0] += contributionForBaseState;
  }

  return Math.max(...dpTable);
}
