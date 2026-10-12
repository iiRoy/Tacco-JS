const configuration = { input: '/dev/stdin', newline: '\n' };

const fileContent = require('fs').readFileSync(configuration.input, 'ascii');
const processedLines = fileContent.trim().split(configuration.newline);

const matrixDimensions = processedLines.map(line => line.split(' ').map(Number));

const totalMatrices = matrixDimensions[0][0];

const memoizationTable = Array(totalMatrices + 1).fill(null).map(() => Array(totalMatrices + 1).fill(null));

const calculateOptimalCost = (startMatrix, endMatrix) => {
  if (startMatrix === endMatrix) {
    return 0;
  }

  if (memoizationTable[startMatrix][endMatrix] !== null) {
    return memoizationTable[startMatrix][endMatrix];
  }

  let minimumCurrentCost = Number.MAX_VALUE;

  for (let splitPoint = startMatrix; splitPoint < endMatrix; splitPoint++) {
    const costLeft = calculateOptimalCost(startMatrix, splitPoint);
    const costRight = calculateOptimalCost(splitPoint + 1, endMatrix);

    const multiplicationCost = matrixDimensions[startMatrix][0] * matrixDimensions[splitPoint][1] * matrixDimensions[endMatrix][1];

    const totalCurrentCost = costLeft + costRight + multiplicationCost;

    minimumCurrentCost = Math.min(minimumCurrentCost, totalCurrentCost);
  }

  memoizationTable[startMatrix][endMatrix] = minimumCurrentCost;
  return minimumCurrentCost;
};

const finalResult = calculateOptimalCost(1, totalMatrices);

console.log(finalResult);
