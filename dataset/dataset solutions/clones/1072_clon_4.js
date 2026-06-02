const configurationObject = { inputSource: '/dev/stdin', lineSeparator: '\n' };

const inputLines = require('fs').readFileSync(configurationObject.inputSource, 'ascii')
  .split(configurationObject.lineSeparator, 2);

const numericArray = inputLines[1].split(' ').map(Number);

const pivotFinalIndex = performPartition(numericArray, 0, numericArray.length);
numericArray[pivotFinalIndex] = '[' + numericArray[pivotFinalIndex] + ']';
console.log(numericArray.join(' '));

function performPartition(dataArray, startIdx, endExclusiveIdx) {
  const pivotElementValue = dataArray[endExclusiveIdx - 1];
  let currentBoundaryPosition = startIdx;

  const scanIndices = Array.from(
    { length: (endExclusiveIdx - 1) - (startIdx + 1) },
    (_, indexOffset) => startIdx + 1 + indexOffset
  );

  currentBoundaryPosition = scanIndices.reduce((accumulatorBoundary, currentScanIndex) => {
    if (dataArray[currentScanIndex] <= pivotElementValue) {
      const transientStorage = dataArray[accumulatorBoundary];
      dataArray[accumulatorBoundary] = dataArray[currentScanIndex];
      dataArray[currentScanIndex] = transientStorage;
      return accumulatorBoundary + 1;
    }
    return accumulatorBoundary;
  }, startIdx);

  const transientStorage = dataArray[currentBoundaryPosition];
  dataArray[currentBoundaryPosition] = dataArray[endExclusiveIdx - 1];
  dataArray[endExclusiveIdx - 1] = transientStorage;

  return currentBoundaryPosition;
}
