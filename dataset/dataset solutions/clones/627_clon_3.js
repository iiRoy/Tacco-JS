const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const contentLines = fileContent.split('\n');
const initialSegmentCount = parseInt(contentLines[0], 10);

const circularArray = [];
const doubleCount = initialSegmentCount * 2;
const tripleCount = initialSegmentCount * 3;

for (let outerLoopIdx = 0; outerLoopIdx < initialSegmentCount; outerLoopIdx++) {
  const value = parseInt(contentLines[outerLoopIdx + 1], 10);
  circularArray[outerLoopIdx] = value;
  circularArray[outerLoopIdx + initialSegmentCount] = value;
  circularArray[outerLoopIdx + doubleCount] = value;
}

function computeSubarrayTotal(sourceArray, startIndex, endIndex) {
  let currentTotal = 0;
  for (let idx = startIndex; idx < endIndex; idx++) {
    currentTotal += sourceArray[idx];
  }
  return currentTotal;
}

let maximumAchievedSum = 0;
let minimumPartitionSum = 0;
let currentWindowSum = 0;

const outerLoopLimit = initialSegmentCount - 2;
for (let outerLoopIdx = 1; outerLoopIdx < outerLoopLimit; outerLoopIdx++) {
  for (let middleLoopIdx = 0; middleLoopIdx < initialSegmentCount; middleLoopIdx++) {
    const firstSegmentEnd = middleLoopIdx + outerLoopIdx;
    currentWindowSum = computeSubarrayTotal(circularArray, middleLoopIdx, firstSegmentEnd);

    const innerLoopLimit = initialSegmentCount - outerLoopIdx;
    for (let innerLoopIdx = 1; innerLoopIdx < innerLoopLimit; innerLoopIdx++) {
      const secondSegmentStart = firstSegmentEnd;
      const secondSegmentEnd = firstSegmentEnd + innerLoopIdx;
      const thirdSegmentStart = secondSegmentEnd;
      const thirdSegmentEnd = middleLoopIdx + initialSegmentCount;

      const sumOfSecondSegment = computeSubarrayTotal(circularArray, secondSegmentStart, secondSegmentEnd);
      const sumOfThirdSegment = computeSubarrayTotal(circularArray, thirdSegmentStart, thirdSegmentEnd);

      minimumPartitionSum = Math.min(sumOfSecondSegment, sumOfThirdSegment);

      if (currentWindowSum <= minimumPartitionSum) {
        maximumAchievedSum = Math.max(maximumAchievedSum, currentWindowSum);
      }
    }
  }
}
console.log(maximumAchievedSum);
