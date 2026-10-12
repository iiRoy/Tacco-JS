const appConfig = { input: '/dev/stdin', newline: '\n' };

const parseLineToNumbers = (lineString) => {
  return lineString.split(' ').map(Number);
};

const fileContentsBuffer = require('fs').readFileSync(appConfig.input, 'ascii');
const processedFileContents = fileContentsBuffer.trim();
const contentLines = processedFileContents.split(appConfig.newline);

const matrixDimensionsData = contentLines.map(parseLineToNumbers);

const totalMatricesCount = matrixDimensionsData[0][0];

const minMultiplicationCostTable = {};

for (let matrixIndex = 1; matrixIndex <= totalMatricesCount; matrixIndex++) {
  minMultiplicationCostTable[matrixIndex] = {};
  minMultiplicationCostTable[matrixIndex][matrixIndex] = 0;
}

const INITIAL_MAX_COST = Number.MAX_VALUE;

for (let chainLength = 1; chainLength < totalMatricesCount; chainLength++) {
  for (let chainStartIdx = 1; chainStartIdx <= totalMatricesCount - chainLength; chainStartIdx++) {
    const chainEndIdx = chainStartIdx + chainLength;

    minMultiplicationCostTable[chainStartIdx][chainEndIdx] = INITIAL_MAX_COST;

    for (let splitPointIdx = chainStartIdx; splitPointIdx < chainEndIdx; splitPointIdx++) {
      const firstMatrixRowDim = matrixDimensionsData[chainStartIdx][0];
      const splitMatrixColDim = matrixDimensionsData[splitPointIdx][1];
      const lastMatrixColDim = matrixDimensionsData[chainEndIdx][1];

      const costOfCurrentMultiplication = firstMatrixRowDim * splitMatrixColDim * lastMatrixColDim;

      const costOfLeftSubchain = minMultiplicationCostTable[chainStartIdx][splitPointIdx];
      const costOfRightSubchain = minMultiplicationCostTable[splitPointIdx + 1][chainEndIdx];

      const combinedCostForSplit = costOfCurrentMultiplication + costOfLeftSubchain + costOfRightSubchain;

      minMultiplicationCostTable[chainStartIdx][chainEndIdx] = Math.min(
        minMultiplicationCostTable[chainStartIdx][chainEndIdx],
        combinedCostForSplit
      );
    }
  }
}

console.log(minMultiplicationCostTable[1][totalMatricesCount]);
