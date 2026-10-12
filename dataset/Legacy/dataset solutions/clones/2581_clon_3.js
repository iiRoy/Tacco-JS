const getAbsoluteValue = (val) => Math.abs(val);

function calculateSegmentSum(startIndex, segmentValues) {
  let currentSegmentTotal = 0;
  const maxIndex = Math.min(startIndex + 3, segmentValues.length);
  for (let k = startIndex; k < maxIndex; k++) {
    currentSegmentTotal += getAbsoluteValue(segmentValues[k]);
  }
  return currentSegmentTotal;
}

function computeHappinessScore(valueArray) {
  let accumulatedSum = 0;
  for (let idx = 0; idx < valueArray.length; idx++) {
    accumulatedSum += valueArray[idx];
  }
  const finalScore = accumulatedSum - valueArray.length;
  return finalScore;
}

function processInputData(rawData) {
  const lines = rawData.split("\n");

  const firstLineParts = lines[0].split(" ");
  const totalLength = Number.parseInt(firstLineParts[0]);
  const operationCount = Number.parseInt(firstLineParts[1]);

  const inputSequence = lines[1].split(" ")[0];

  let processedSegments = [];
  let charIndex = 0;

  while (charIndex < totalLength) {
    const startChar = inputSequence[charIndex];
    let currentCount = 0;
    let lookaheadIndex = charIndex;

    while (lookaheadIndex < totalLength && inputSequence[lookaheadIndex] === startChar) {
      currentCount++;
      lookaheadIndex++;
    }
    processedSegments.push(currentCount);
    charIndex = lookaheadIndex;
  }

  let finalResult = 0;

  if (processedSegments.length <= 2) {
    finalResult = totalLength - 1;
  } else {
    const targetHappiness = totalLength - 1;

    for (let iterationNum = 0; iterationNum < operationCount; iterationNum++) {
      let maxSegmentSum = calculateSegmentSum(0, processedSegments);
      let maxSumIndex = 0;

      const fixedComparisonSum = calculateSegmentSum(1, processedSegments);
      for (let i = 1; i < processedSegments.length; i++) {
        if (maxSegmentSum < fixedComparisonSum) {
          maxSegmentSum = fixedComparisonSum;
          maxSumIndex = i;
        }
      }

      const elementsToRemove = 3;
      processedSegments.splice(maxSumIndex, elementsToRemove, maxSegmentSum);

      if (computeHappinessScore(processedSegments) === targetHappiness) {
        break;
      }
    }
    finalResult = computeHappinessScore(processedSegments);
  }

  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
