let comparisonCounter = 0;

const divideAndConquerSort = (targetArray, startIdx, endIdx) => {
  if (startIdx + 1 < endIdx) {
    const middlePoint = Math.floor((startIdx + endIdx) / 2);
    divideAndConquerSort(targetArray, startIdx, middlePoint);
    divideAndConquerSort(targetArray, middlePoint, endIdx);
    interleaveSortedParts(targetArray, startIdx, middlePoint, endIdx);
  }
};

const interleaveSortedParts = (targetArray, lowBound, midPoint, highBound) => {
  const leftSubarrayLength = midPoint - lowBound;
  const rightSubarrayLength = highBound - midPoint;

  var tempLeftArr = new Array(leftSubarrayLength);
  for (var i = 0; i < leftSubarrayLength; i++) {
    tempLeftArr[i] = targetArray[lowBound + i];
  }
  tempLeftArr[leftSubarrayLength] = 1000000000;

  var tempRightArr = new Array(rightSubarrayLength);
  for (var j = 0; j < rightSubarrayLength; j++) {
    tempRightArr[j] = targetArray[midPoint + j];
  }
  tempRightArr[rightSubarrayLength] = 1000000000;

  var leftPtr = 0;
  var rightPtr = 0;

  for (var mainArrIdx = lowBound; mainArrIdx < highBound; mainArrIdx++) {
    comparisonCounter++;
    if (tempLeftArr[leftPtr] < tempRightArr[rightPtr]) {
      targetArray[mainArrIdx] = tempLeftArr[leftPtr];
      leftPtr++;
    } else {
      targetArray[mainArrIdx] = tempRightArr[rightPtr];
      rightPtr++;
    }
  }
};

const processAndSortArray = (totalElements, inputValues) => {
  divideAndConquerSort(inputValues, 0, totalElements);
  return inputValues;
};

let lineCount = 0;
let arraySize = 0;

const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

inputHandler.on("line", (currentInputLine) => {
  lineCount++;
  if (lineCount === 1) {
    arraySize = Number(currentInputLine.trim());
  } else {
    const parsedNumbers = currentInputLine.trim().split(" ").map(numericStr => Number(numericStr));
    const finalSortedArray = processAndSortArray(arraySize, parsedNumbers);
    console.log(finalSortedArray.reduce((accumulator, currentVal) => `${accumulator} ${currentVal}`));
    console.log(comparisonCounter);
    process.exit(0);
  }
});
