function findLowerBoundIndex(searchArray, startIndex, endIndex, targetValue) {
  if (startIndex > endIndex) {
    return startIndex;
  }

  let low = startIndex;
  let high = endIndex;
  let resultIndex = endIndex + 1;

  while (low <= high) {
    const mid = (low + high) >>> 1;

    if (searchArray[mid] >= targetValue) {
      resultIndex = mid;
      high = mid - 1;
    } else {
      low = mid + 1;
    }
  }
  return resultIndex;
}

function calculatePartitionRange(cumulativeSums, middleCut, firstBoundary, secondBoundary, totalElementsIndex) {
  if (firstBoundary < 0 || firstBoundary >= middleCut ||
      secondBoundary <= middleCut || secondBoundary >= totalElementsIndex) {
    return Number.POSITIVE_INFINITY;
  }

  const segmentA = cumulativeSums[firstBoundary];
  const segmentB = cumulativeSums[middleCut] - cumulativeSums[firstBoundary];
  const segmentC = cumulativeSums[secondBoundary] - cumulativeSums[middleCut];
  const segmentD = cumulativeSums[totalElementsIndex] - cumulativeSums[secondBoundary];

  const currentSegments = [segmentA, segmentB, segmentC, segmentD];

  currentSegments.sort((val1, val2) => val1 - val2);

  return currentSegments[3] - currentSegments[0];
}

function ProcessInputData(inputRawText) {
  const LARGE_INITIAL_DIFFERENCE = Number.MAX_SAFE_INTEGER;

  if (typeof inputRawText !== 'string' || inputRawText.trim() === '') {
    console.error("Error: Input must be a non-empty string.");
    return;
  }

  const inputLines = inputRawText.split("\n");

  if (inputLines.length < 2) {
    console.error("Error: Insufficient input lines. Expected at least 2.");
    return;
  }

  const effectiveElementCount = parseInt(inputLines[0].trim(), 10) - 1;

  const numericalDataPoints = inputLines[1].trim().split(" ").filter(Boolean).map(val => Number(val));

  const cumulativeSums = [];
  let currentRunningTotal = 0;
  for (let idx = 0; idx < numericalDataPoints.length; ++idx) {
    currentRunningTotal += numericalDataPoints[idx];
    cumulativeSums[idx] = currentRunningTotal;
  }
  cumulativeSums[effectiveElementCount] = currentRunningTotal;

  let optimalSplitDelta = LARGE_INITIAL_DIFFERENCE;

  for (let midPointIndex = 1; midPointIndex <= effectiveElementCount - 2; ++midPointIndex) {
    const idealLeftTarget = cumulativeSums[midPointIndex] / 2;
    const idealRightTarget = (cumulativeSums[effectiveElementCount] + cumulativeSums[midPointIndex]) / 2;

    let firstBoundaryCandidate = findLowerBoundIndex(cumulativeSums, 0, midPointIndex - 1, idealLeftTarget);
    let secondBoundaryCandidate = findLowerBoundIndex(cumulativeSums, midPointIndex + 1, effectiveElementCount - 1, idealRightTarget);

    let currentMidPointMinDiff = LARGE_INITIAL_DIFFERENCE;

    currentMidPointMinDiff = Math.min(
      currentMidPointMinDiff,
      calculatePartitionRange(cumulativeSums, midPointIndex, firstBoundaryCandidate, secondBoundaryCandidate, effectiveElementCount)
    );

    if (firstBoundaryCandidate > 0) {
      currentMidPointMinDiff = Math.min(
        currentMidPointMinDiff,
        calculatePartitionRange(cumulativeSums, midPointIndex, firstBoundaryCandidate - 1, secondBoundaryCandidate, effectiveElementCount)
      );
    }

    if (secondBoundaryCandidate > midPointIndex + 1) {
      currentMidPointMinDiff = Math.min(
        currentMidPointMinDiff,
        calculatePartitionRange(cumulativeSums, midPointIndex, firstBoundaryCandidate, secondBoundaryCandidate - 1, effectiveElementCount)
      );
    }

    if (firstBoundaryCandidate > 0 && secondBoundaryCandidate > midPointIndex + 1) {
      currentMidPointMinDiff = Math.min(
        currentMidPointMinDiff,
        calculatePartitionRange(cumulativeSums, midPointIndex, firstBoundaryCandidate - 1, secondBoundaryCandidate - 1, effectiveElementCount)
      );
    }

    optimalSplitDelta = Math.min(optimalSplitDelta, currentMidPointMinDiff);
  }

  console.log(optimalSplitDelta);
}

(function() {
  try {
    const fileSystem = require("fs");
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    ProcessInputData(inputContent);
  } catch (error) {
    console.error("Failed to read input or process data:", error.message);
  }
})();