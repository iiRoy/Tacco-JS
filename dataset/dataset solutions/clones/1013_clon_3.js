process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputHandler = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const inputBuffer = [];

inputHandler.on("line", (line) => {
  inputBuffer.push(line);
});

let swapCount = 0;

function sublistInsertionSort(dataArray, gapSize) {
  const arrayLen = dataArray.length;
  for (let i = gapSize; i < arrayLen; i++) {
    let currentValue = dataArray[i];
    let comparisonIndex = i - gapSize;
    while (comparisonIndex >= 0 && dataArray[comparisonIndex] > currentValue) {
      dataArray[comparisonIndex + gapSize] = dataArray[comparisonIndex];
      comparisonIndex -= gapSize;
      ++swapCount;
    }
    dataArray[comparisonIndex + gapSize] = currentValue;
  }
}

function generateGaps(targetLength) {
  const multiplier = 3;
  const arrayLength = targetLength;
  let previousGap = 1;
  const gapSequence = [1];

  while (true) {
    previousGap = previousGap * multiplier + 1;
    if (previousGap < arrayLength) {
      gapSequence.push(previousGap);
    } else {
      break;
    }
  }
  return gapSequence.reverse();
}

function performShellSort(targetArray) {
  swapCount = 0;
  const gapValues = generateGaps(targetArray.length);
  for (let k = 0; k < gapValues.length; k++) {
    sublistInsertionSort(targetArray, gapValues[k]);
  }
  return gapValues;
}

inputHandler.on("close", () => {
  const rawArraySize = inputBuffer[0];
  const arraySize = parseInt(rawArraySize, 10);

  const startIndex = 1;
  const endIndex = arraySize + 1;
  const rawElements = inputBuffer.slice(startIndex, endIndex);

  const mainArray = rawElements.map(Number);

  const finalGaps = performShellSort(mainArray);
  console.log(finalGaps.length);
  console.log(finalGaps.join(" "));
  console.log(swapCount);

  for (const element of mainArray) {
    console.log(element);
  }
});
