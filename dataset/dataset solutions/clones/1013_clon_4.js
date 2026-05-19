let opCount = 0;

function generateGapSequence(limitValue, currentTerm = 1, accumulatedGaps = []) {
  const nextTerm = currentTerm * 3 + 1;
  if (nextTerm >= limitValue) {
    return [currentTerm, ...accumulatedGaps];
  }
  return generateGapSequence(limitValue, nextTerm, [currentTerm, ...accumulatedGaps]);
}

function processSegment(dataCollection, gapInterval) {
  for (let currentElementIndex = gapInterval; currentElementIndex < dataCollection.length; currentElementIndex++) {
    const valueToPosition = dataCollection[currentElementIndex];
    let comparisonIndex = currentElementIndex - gapInterval;
    let targetInsertionPoint = -gapInterval;

    while (comparisonIndex >= 0 && dataCollection[comparisonIndex] > valueToPosition) {
      comparisonIndex -= gapInterval;
    }
    targetInsertionPoint = comparisonIndex;

    for (let shiftSourceIndex = currentElementIndex - gapInterval; shiftSourceIndex > targetInsertionPoint; shiftSourceIndex -= gapInterval) {
      dataCollection[shiftSourceIndex + gapInterval] = dataCollection[shiftSourceIndex];
      opCount++;
    }
    dataCollection[targetInsertionPoint + gapInterval] = valueToPosition;
  }
}

function performShellSort(targetArray) {
  opCount = 0;
  const gapSeries = generateGapSequence(targetArray.length);

  gapSeries.forEach(currentGap => {
    processSegment(targetArray, currentGap);
  });

  return gapSeries;
}

process.stdin.resume();
process.stdin.setEncoding("utf8");

const inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const receivedLines = [];

inputReader.on("line", (inputLine) => {
  receivedLines.push(inputLine);
});

inputReader.on("close", () => {
  const arraySize = Number(receivedLines[0]);
  const inputNumbers = receivedLines.slice(1, arraySize + 1).map(Number);

  const resultingGaps = performShellSort(inputNumbers);

  console.log(resultingGaps.length);
  console.log(resultingGaps.join(" "));
  console.log(opCount);
  inputNumbers.forEach((elementValue) => console.log(elementValue));
});
