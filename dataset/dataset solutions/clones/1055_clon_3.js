let mergeOperationCount = 0;

const MERGE_SENTINEL_VALUE = 1000000000;

const recursiveSort = (dataArray, startIndex, endIndex) => {
  if (endIndex - startIndex > 1) {
    const middleIndex = Math.floor((startIndex + endIndex) / 2);
    recursiveSort(dataArray, startIndex, middleIndex);
    recursiveSort(dataArray, middleIndex, endIndex);
    combineSortedHalves(dataArray, startIndex, middleIndex, endIndex);
  }
};

const combineSortedHalves = (targetArr, leftBound, middlePoint, rightBound) => {
  const leftSubLength = middlePoint - leftBound;
  const rightSubLength = rightBound - middlePoint;

  const tempLeft = new Array(leftSubLength);
  for (let i = 0; i < leftSubLength; i++) {
    tempLeft[i] = targetArr[leftBound + i];
  }
  tempLeft[leftSubLength] = MERGE_SENTINEL_VALUE;

  const tempRight = new Array(rightSubLength);
  for (let i = 0; i < rightSubLength; i++) {
    tempRight[i] = targetArr[middlePoint + i];
  }
  tempRight[rightSubLength] = MERGE_SENTINEL_VALUE;

  let leftCursor = 0;
  let rightCursor = 0;

  for (let mainCursor = leftBound; mainCursor < rightBound; mainCursor++) {
    mergeOperationCount++;
    if (tempLeft[leftCursor] < tempRight[rightCursor]) {
      targetArr[mainCursor] = tempLeft[leftCursor];
      leftCursor++;
    } else {
      targetArr[mainCursor] = tempRight[rightCursor];
      rightCursor++;
    }
  }
};

const processAndSort = (size, inputData) => {
  recursiveSort(inputData, 0, size);
  return inputData;
};

let currentLineNumber = 0;
let totalElements = 0;

const parseNumericLine = (lineText) => {
  return lineText.trim().split(" ").map(Number);
};

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

inputReader.on("line", (currentLineText) => {
  currentLineNumber++;
  if (currentLineNumber === 1) {
    totalElements = Number(currentLineText.trim());
  } else {
    const dataValues = parseNumericLine(currentLineText);
    const sortedResult = processAndSort(totalElements, dataValues);
    console.log(sortedResult.join(" "));
    console.log(mergeOperationCount);
    process.exit(0);
  }
});
