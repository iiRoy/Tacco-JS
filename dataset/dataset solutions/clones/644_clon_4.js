const fileSystem = require('fs');

const retrieveAllInputData = () => fileSystem.readFileSync('/dev/stdin', 'utf-8').split('\n');

let currentInputBuffer = retrieveAllInputData();
let bufferPosition = 0;

const obtainNextInputLine = () => {
  if (bufferPosition >= currentInputBuffer.length) {
    currentInputBuffer = retrieveAllInputData();
    bufferPosition = 0;
  }
  return currentInputBuffer[bufferPosition++];
};

const obtainRemainingInputLines = () => {
  if (bufferPosition >= currentInputBuffer.length) {
    currentInputBuffer = retrieveAllInputData();
    bufferPosition = 0;
  }
  const leftover = currentInputBuffer.slice(bufferPosition);
  bufferPosition = currentInputBuffer.length;
  return leftover;
};

const transformToIntegers = (collection) => collection.map(Number.parseInt);
const transformToFloats = (collection) => collection.map(Number.parseFloat);
const transformToStrings = (collection) => collection.map(String);

const constructArrayWithGenerator = (length, generatorFunction) => Array.from({ length: length }, (unused, index) => generatorFunction(index));

const computeSumOfElements = (collection, valueExtractor = (val) => val) => {
  if (collection.length === 0) return undefined;
  return collection.reduce((accumulator, currentElement, index) => accumulator + valueExtractor(currentElement, index), 0);
};

const sequenceGenerator = (count, callbackFunction = (index) => index) => Array.from({ length: count }, (unused, index) => callbackFunction(index));

const initialLineParts = transformToIntegers(obtainNextInputLine().split(' '));
const numRows = initialLineParts[0];
const numCols = initialLineParts[1];

const gridData = sequenceGenerator(numRows, (rowId) => obtainNextInputLine());

const costCache = new Map();

const calculateRowConversionCost = (targetRowIndex, desiredColor, fullGridContents, totalColumns) => {
  const uniqueKey = `${targetRowIndex},${desiredColor}`;
  if (costCache.has(uniqueKey)) {
    return costCache.get(uniqueKey);
  }

  let characterMismatches = 0;
  const currentGridRow = fullGridContents[targetRowIndex];
  for (let charPosition = 0; charPosition < totalColumns; ++charPosition) {
    if (currentGridRow[charPosition] !== desiredColor) {
      characterMismatches++;
    }
  }
  costCache.set(uniqueKey, characterMismatches);
  return characterMismatches;
};

const perRowColorCosts = constructArrayWithGenerator(numRows, (rIdx) => ({
  W: calculateRowConversionCost(rIdx, 'W', gridData, numCols),
  B: calculateRowConversionCost(rIdx, 'B', gridData, numCols),
  R: calculateRowConversionCost(rIdx, 'R', gridData, numCols),
}));

const prefixSumCostsW = constructArrayWithGenerator(numRows + 1, () => 0);
const prefixSumCostsB = constructArrayWithGenerator(numRows + 1, () => 0);
const prefixSumCostsR = constructArrayWithGenerator(numRows + 1, () => 0);

for (let r = 0; r < numRows; ++r) {
  prefixSumCostsW[r + 1] = prefixSumCostsW[r] + perRowColorCosts[r].W;
  prefixSumCostsB[r + 1] = prefixSumCostsB[r] + perRowColorCosts[r].B;
  prefixSumCostsR[r + 1] = prefixSumCostsR[r] + perRowColorCosts[r].R;
}

const getCostForRange = (sumArray, startIdx, endIdx) => {
  if (startIdx > endIdx) return 0;
  return sumArray[endIdx + 1] - sumArray[startIdx];
};

let overallMinimumCost = numRows * numCols;

for (let firstSplitPoint = 0; firstSplitPoint <= numRows - 3; ++firstSplitPoint) {
  const currentWSectionCost = getCostForRange(prefixSumCostsW, 0, firstSplitPoint);

  for (let secondSplitPoint = firstSplitPoint + 1; secondSplitPoint <= numRows - 2; ++secondSplitPoint) {
    const currentBSectionCost = getCostForRange(prefixSumCostsB, firstSplitPoint + 1, secondSplitPoint);
    const currentRSectionCost = getCostForRange(prefixSumCostsR, secondSplitPoint + 1, numRows - 1);

    const totalCurrentConfigurationCost = currentWSectionCost + currentBSectionCost + currentRSectionCost;
    overallMinimumCost = Math.min(overallMinimumCost, totalCurrentConfigurationCost);
  }
}

console.log(overallMinimumCost);