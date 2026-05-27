let comparisonTally = 0;

const combineSegments = (dataArr, startIdx, middleIdx, endIdx) => {
  const leftSegmentSize = middleIdx - startIdx;
  const rightSegmentSize = endIdx - middleIdx;

  const leftBuffer = new Array(leftSegmentSize);
  for (let k = 0; k < leftSegmentSize; k++) {
    leftBuffer[k] = dataArr[startIdx + k];
  }

  const rightBuffer = new Array(rightSegmentSize);
  for (let k = 0; k < rightSegmentSize; k++) {
    rightBuffer[k] = dataArr[middleIdx + k];
  }

  let leftPtr = 0;
  let rightPtr = 0;

  for (let currentIdx = startIdx; currentIdx < endIdx; currentIdx++) {
    comparisonTally++;
    if (leftPtr < leftSegmentSize && (rightPtr >= rightSegmentSize || leftBuffer[leftPtr] <= rightBuffer[rightPtr])) {
      dataArr[currentIdx] = leftBuffer[leftPtr];
      leftPtr++;
    } else {
      dataArr[currentIdx] = rightBuffer[rightPtr];
      rightPtr++;
    }
  }
};

const processArray = (totalElements, targetArray) => {
  comparisonTally = 0;

  for (let segmentLength = 1; segmentLength < totalElements; segmentLength *= 2) {
    for (let currentStart = 0; currentStart < totalElements - segmentLength; currentStart += 2 * segmentLength) {
      const midPoint = currentStart + segmentLength;
      const endPoint = Math.min(currentStart + 2 * segmentLength, totalElements);
      combineSegments(targetArray, currentStart, midPoint, endPoint);
    }
  }
  return targetArray;
};

let lineCount = 0;
let arraySize = 0;
const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

inputReader.on("line", (inputLine) => {
  lineCount++;
  if (lineCount === 1) {
    arraySize = Number(inputLine.trim());
  } else {
    const inputNumbers = inputLine.trim().split(" ").map((val) => Number(val));
    const sortedNumbers = processArray(arraySize, inputNumbers);
    console.log(sortedNumbers.reduce((accumulator, num) => `${accumulator} ${num}`));
    console.log(comparisonTally);
    process.exit(0);
  }
});
