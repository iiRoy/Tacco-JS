function calculateSegmentSum(segmentIndex, segmentData) {
  let currentSum = 0;
  currentSum = Math.abs(segmentData[segmentIndex]);
  if (segmentIndex + 1 < segmentData.length) {
    currentSum += Math.abs(segmentData[segmentIndex + 1]);
  }
  if (segmentIndex + 2 < segmentData.length) {
    currentSum += Math.abs(segmentData[segmentIndex + 2]);
  }
  return currentSum;
}

function processInputData(rawData) {
  const lines = rawData.split("\n");
  const firstLineParts = lines[0].split(" ");
  const totalLength = Number.parseInt(firstLineParts[0]);
  const operationCount = Number.parseInt(firstLineParts[1]);

  const secondLineParts = lines[1].split(" ");
  const inputString = secondLineParts[0];

  let segmentLengths = [];

  if (totalLength > 0) {
    let previousChar = inputString[0];
    let currentSegmentLength = 1;

    for (let charIndex = 1; charIndex < totalLength; charIndex++) {
      const currentChar = inputString[charIndex];
      if (currentChar !== previousChar) {
        segmentLengths.push(currentSegmentLength);
        currentSegmentLength = 0;
      }
      currentSegmentLength++;
      previousChar = currentChar;
    }
    segmentLengths.push(currentSegmentLength);
  }

  let finalResult = 0;

  if (segmentLengths.length <= 2) {
    finalResult = totalLength - 1;
  } else {
    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
      let maxSegmentSum = calculateSegmentSum(0, segmentLengths);
      let maxSumPosition = 0;

      const fixedWindowSum = calculateSegmentSum(1, segmentLengths);

      for (let windowStartIdx = 1; windowStartIdx < segmentLengths.length; windowStartIdx++) {
        if (maxSegmentSum < fixedWindowSum) {
          maxSegmentSum = fixedWindowSum;
          maxSumPosition = windowStartIdx;
        }
      }
      segmentLengths.splice(maxSumPosition, 3, maxSegmentSum);
    }
    finalResult = segmentLengths.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
    finalResult -= segmentLengths.length;
  }
  console.log(finalResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
