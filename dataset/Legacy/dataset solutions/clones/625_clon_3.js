const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataLines = fileContent.split('\n');
const baseCount = Number(dataLines[0]);
const circularArray = [];

for (let idx1 = 0; idx1 < baseCount; idx1++) {
  const currentValue = Number(dataLines[idx1 + 1]);
  circularArray[idx1] = currentValue;
}

for (let idx1 = 0; idx1 < baseCount; idx1++) {
  circularArray[idx1 + baseCount] = circularArray[idx1];
}

for (let idx1 = 0; idx1 < baseCount; idx1++) {
  circularArray[idx1 + baseCount + baseCount] = circularArray[idx1];
}

function calculateRangeSum(sourceArray, startIndex, endIndex) {
  let currentSum = 0;
  for (let loopIndex = startIndex; loopIndex < endIndex; loopIndex++) {
    currentSum += sourceArray[loopIndex];
  }
  return currentSum;
}

let overallMax = 0;
let currentMinSum = 0;
let segmentSum = 0;

for (let idx1 = 1; idx1 < baseCount - 2; idx1++) {
  for (let idx2 = 0; idx2 < baseCount; idx2++) {
    segmentSum = calculateRangeSum(circularArray, idx2, idx2 + idx1);

    const remainingSegment = circularArray.slice(idx2 + idx1, idx2 + baseCount);

    for (let idx3 = 1; idx3 < remainingSegment.length; idx3++) {
      const firstSubsegmentSum = calculateRangeSum(circularArray, idx1 + idx2, idx1 + idx2 + idx3);
      const secondSubsegmentSum = calculateRangeSum(circularArray, idx1 + idx2 + idx3, idx2 + baseCount);
      currentMinSum = Math.min(firstSubsegmentSum, secondSubsegmentSum);

      const isRemainingSegmentLengthOne = (remainingSegment.length === 1);
      const isRemainingSegmentValueLessThanMin = (isRemainingSegmentLengthOne && remainingSegment[0] <= currentMinSum);

      if (isRemainingSegmentValueLessThanMin) {
        overallMax = Math.max(overallMax, segmentSum);
      }
    }
  }
}
console.log(overallMax);
