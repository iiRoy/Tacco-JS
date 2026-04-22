"use strict";

const fileSystemModule = require("fs");

const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");

let inputTokens = rawInputContent.split(/ |\n/);
let currentTokenIndex = 0;

const retrieveNextNumber = () => {
  return +inputTokens[currentTokenIndex++];
};

const retrieveNextText = () => {
  return inputTokens[currentTokenIndex++];
};

const retrieveNextLargeInteger = () => {
  return BigInt(inputTokens[currentTokenIndex++]);
};

const getArrayFromInput = (quantity, asStrings) => {
  if (asStrings) {
    const stringSlice = inputTokens.slice(currentTokenIndex, currentTokenIndex + quantity);
    currentTokenIndex += quantity;
    return stringSlice;
  } else {
    const numberSlice = inputTokens.slice(currentTokenIndex, currentTokenIndex + quantity).map(val => +val);
    currentTokenIndex += quantity;
    return numberSlice;
  }
};

const getMatrixFromInput = (rowCount, colCount, asStrings) => {
  let resultingMatrix = [];
  let currentMatrixRow = 0;

  while (currentMatrixRow < rowCount) {
    if (asStrings) {
      resultingMatrix.push(inputTokens.slice(currentTokenIndex, currentTokenIndex + colCount));
    } else {
      resultingMatrix.push(inputTokens.slice(currentTokenIndex, currentTokenIndex + colCount).map(elementValue => +elementValue));
    }
    currentTokenIndex += colCount;
    currentMatrixRow++;
  }
  return resultingMatrix;
};

const generateMultiDimensionalArray = (initialFillerValue, ...arrayDimensions) => {
  let dimensionCount = arrayDimensions.length;
  let arrayConstructionString = `Array(arrayDimensions[${--dimensionCount}]).fill().map(item => {return ${initialFillerValue};})`;

  while (--dimensionCount >= 0) {
    arrayConstructionString = `Array(arrayDimensions[${dimensionCount}]).fill().map(item => ${arrayConstructionString})`;
  }
  return eval(arrayConstructionString);
};

const programResult = executeMainLogic();

if (programResult !== undefined) {
  console.log(String(programResult));
}

function executeMainLogic() {
  const totalItems = retrieveNextNumber();
  const maxIterations = retrieveNextNumber();

  const permutationPath = getArrayFromInput(totalItems).map(originalIdx => originalIdx - 1);
  const itemCosts = getArrayFromInput(totalItems);

  let overallMaximumScore = BigInt('-2000000000000000000');
  let cycleAccumulatedScores = Array(totalItems);

  for (let startNodeIndex = 0; startNodeIndex < totalItems; ++startNodeIndex) {
    let currentCycleLength = 1;
    cycleAccumulatedScores.fill(0);

    let currentElementPointer = permutationPath[startNodeIndex];
    cycleAccumulatedScores[0] = itemCosts[currentElementPointer];

    while (currentCycleLength < maxIterations && currentElementPointer !== startNodeIndex) {
      currentElementPointer = permutationPath[currentElementPointer];
      cycleAccumulatedScores[currentCycleLength] = cycleAccumulatedScores[currentCycleLength - 1] + itemCosts[currentElementPointer];
      currentCycleLength++;
    }
    currentCycleLength;

    if (cycleAccumulatedScores[currentCycleLength - 1] > 0) {
      for (let stepsTaken = 0; stepsTaken < currentCycleLength; ++stepsTaken) {
        const currentPathScore = BigInt(cycleAccumulatedScores[stepsTaken]) +
                                 BigInt(Math.floor((maxIterations - stepsTaken - 1) / currentCycleLength)) *
                                 BigInt(cycleAccumulatedScores[currentCycleLength - 1]);
        if (overallMaximumScore < currentPathScore) {
          overallMaximumScore = currentPathScore;
        }
      }
    } else {
      for (let stepsTaken = 0; stepsTaken < currentCycleLength; ++stepsTaken) {
        const currentPathScore = cycleAccumulatedScores[stepsTaken];
        if (overallMaximumScore < currentPathScore) {
          overallMaximumScore = currentPathScore;
        }
      }
    }
  }

  return overallMaximumScore;
}