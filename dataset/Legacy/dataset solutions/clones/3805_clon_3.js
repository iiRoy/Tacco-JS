function ProcessInput(rawData) {
  const processedLines = rawData.split("\n").filter(lineContent => lineContent !== '');

  const countElements = parseInt(processedLines[0].split(' ')[0], 10);
  const dataArray = processedLines[1].split(' ').map(numericString => parseInt(numericString, 10));

  let resultIndices = [];
  let currentSum = 0;
  let rightPtr = 0;

  const checkXorSumProperty = (valA, valB) => (valA ^ valB) === (valA + valB);

  while (rightPtr < countElements && checkXorSumProperty(currentSum, dataArray[rightPtr])) {
    currentSum += dataArray[rightPtr];
    rightPtr++;
  }
  const initialWindowEndIndex = rightPtr - 1;
  resultIndices.push(initialWindowEndIndex);

  for (let leftIdx = 1; leftIdx < countElements; leftIdx++) {
    currentSum = currentSum ^ dataArray[leftIdx - 1];

    while (rightPtr < countElements && checkXorSumProperty(currentSum, dataArray[rightPtr])) {
      currentSum += dataArray[rightPtr];
      rightPtr++;
    }
    const currentWindowEndIndex = rightPtr - 1;
    resultIndices.push(currentWindowEndIndex);
  }

  let totalCount = resultIndices.reduce((accumulator, currentRightBound, currentLeftBound) => {
    const validSubarrayCount = currentRightBound - currentLeftBound + 1;
    return accumulator + validSubarrayCount;
  }, 0);

  console.log(totalCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
