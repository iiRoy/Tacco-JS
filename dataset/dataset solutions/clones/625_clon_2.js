let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

const dataRows = rawData.split('\n');
const count = +dataRows[0];
let circularArray = [];
let idx1, idx2, idx3;

for (idx1 = 0; idx1 < count; idx1++) {
  circularArray[idx1] = +dataRows[idx1 + 1];
  circularArray[idx1 + count] = circularArray[idx1];
  circularArray[idx1 + count + count] = circularArray[idx1];
}

const accumulator = function (currentVal, nextVal) {
  return currentVal + nextVal;
};

function calculateRangeSum(sourceArr, startIndex, endIndex) {
  let total = 0;
  let loopIdx;
  for (loopIdx = startIndex; loopIdx < endIndex; loopIdx++) {
    total += sourceArr[loopIdx];
  }
  return total;
}

let overallMaximum = 0;
let currentMinimum = 0;
let segmentSum = 0;
let remainingSegment;

for (idx1 = 1; idx1 < count - 2; idx1++) {
  for (idx2 = 0; idx2 < count; idx2++) {
    segmentSum = calculateRangeSum(circularArray, idx2, idx2 + idx1);
    remainingSegment = circularArray.slice(idx2 + idx1, idx2 + count);
    for (idx3 = 1; idx3 < remainingSegment.length; idx3++) {
      // currentMinimum = Math.min(remainingSegment.slice(0, idx3).reduce(accumulator, 0), remainingSegment.slice(idx3, remainingSegment.length).reduce(accumulator, 0));
      currentMinimum = Math.min(
        calculateRangeSum(circularArray, idx1 + idx2, idx1 + idx2 + idx3),
        calculateRangeSum(circularArray, idx1 + idx2 + idx3, idx2 + count)
      );
      if (remainingSegment <= currentMinimum) {
        overallMaximum = Math.max(overallMaximum, segmentSum);
      }
    }
  }
}
console.log(overallMaximum);
