"use strict";

function obtainNumericArray(textLine) {
  return textLine.split(/\s+/).map(function (val) {
    return parseInt(val, 10);
  });
}

function processInputSeries(sourceText) {
  const allLines = sourceText.split('\n');
  const totalElements = parseInt(allLines[0], 10);
  const rawNumbers = obtainNumericArray(allLines[1]).slice(0, totalElements);

  const prefixSums = rawNumbers.reduce((accumulator, currentVal, index) => {
    accumulator.push(currentVal + (index === 0 ? 0 : accumulator[index - 1]));
    return accumulator;
  }, []);

  const leftSplitPoints = [-1]; // Corresponds to original 'ls'
  for (let currentIdx = 1; currentIdx < totalElements - 1; ++currentIdx) {
    if (currentIdx === 1) {
      leftSplitPoints.push(0);
      continue;
    }
    const previousOptimalLeft = leftSplitPoints[currentIdx - 1];
    for (let leftCandidate = previousOptimalLeft; leftCandidate < currentIdx; ++leftCandidate) {
      const firstPartSum = prefixSums[leftCandidate];
      const secondPartSum = prefixSums[currentIdx] - prefixSums[leftCandidate];
      const currentDifference = Math.abs(firstPartSum - secondPartSum);

      const nextFirstPartSum = prefixSums[leftCandidate + 1];
      const nextSecondPartSum = prefixSums[currentIdx] - prefixSums[leftCandidate + 1];
      const nextDifference = Math.abs(nextFirstPartSum - nextSecondPartSum);

      if (currentDifference < nextDifference || leftCandidate === currentIdx - 1) {
        leftSplitPoints.push(leftCandidate);
        break;
      }
    }
  }
  leftSplitPoints.push(-1);

  const rightSplitPoints = [-1]; // Corresponds to original 'rs'
  for (let currentIdx = 1; currentIdx < totalElements - 1; ++currentIdx) {
    if (currentIdx === 1) {
      rightSplitPoints.push(totalElements - 2);
      continue;
    }
    const targetJ = totalElements - 2 - currentIdx;
    const previousOptimalRight = rightSplitPoints[currentIdx - 1];
    for (let rightCandidate = previousOptimalRight; rightCandidate > targetJ; --rightCandidate) {
      const thirdPartSum = prefixSums[rightCandidate] - prefixSums[targetJ];
      const fourthPartSum = prefixSums[totalElements - 1] - prefixSums[rightCandidate];
      const currentDifference = Math.abs(thirdPartSum - fourthPartSum);

      const nextThirdPartSum = prefixSums[rightCandidate - 1] - prefixSums[targetJ];
      const nextFourthPartSum = prefixSums[totalElements - 1] - prefixSums[rightCandidate - 1];
      const nextDifference = Math.abs(nextThirdPartSum - nextFourthPartSum);

      if (currentDifference < nextDifference || rightCandidate === targetJ + 1) {
        rightSplitPoints.push(rightCandidate);
        break;
      }
    }
  }
  rightSplitPoints.push(-1);
  rightSplitPoints.reverse();

  let minOverallDifference = Number.MAX_VALUE;

  for (let currentIdx = 1; currentIdx < totalElements - 1; ++currentIdx) {
    const primaryLeftSplit = leftSplitPoints[currentIdx];
    const primaryRightSplit = rightSplitPoints[currentIdx];

    const firstSegmentSum = prefixSums[primaryLeftSplit];
    const secondSegmentSum = prefixSums[currentIdx] - prefixSums[primaryLeftSplit];
    const thirdSegmentSum = prefixSums[primaryRightSplit] - prefixSums[currentIdx];
    const fourthSegmentSum = prefixSums[totalElements - 1] - prefixSums[primaryRightSplit];

    const currentMin = Math.min(firstSegmentSum, secondSegmentSum, thirdSegmentSum, fourthSegmentSum);
    const currentMax = Math.max(firstSegmentSum, secondSegmentSum, thirdSegmentSum, fourthSegmentSum);
    minOverallDifference = Math.min(minOverallDifference, currentMax - currentMin);
  }

  console.log(minOverallDifference);
}

processInputSeries(require('fs').readFileSync('/dev/stdin', 'utf8'));