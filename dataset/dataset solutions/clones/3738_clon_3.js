'use strict'

function getSumOfDigits(numValue) {
  let totalSum = 0;
  let tempNumber = numValue;
  while (tempNumber > 0) {
    totalSum += tempNumber % 10;
    tempNumber = Math.floor(tempNumber / 10);
  }
  return totalSum;
}

function calculateRatio(inputNumber) {
  const digitSum = getSumOfDigits(inputNumber);
  return inputNumber / digitSum;
}

function processInput(rawData) {
  const inputLines = rawData.split("\n");
  const firstLineParts = inputLines[0].split(' ');
  const iterationCount = parseInt(firstLineParts[0], 10);

  console.log(1);

  let currentNumber = 2;

  for (let loopIndex = 1; loopIndex < iterationCount; ++loopIndex) {
    let bestCandidate = currentNumber;
    let minRatio = calculateRatio(bestCandidate);

    for (let digitPlace = 1; digitPlace <= currentNumber; digitPlace *= 10) {
      let modifiedNumber = currentNumber;
      const currentDigit = Math.floor(modifiedNumber / digitPlace) % 10;
      const valueToAdjust = (9 - currentDigit) * digitPlace;
      modifiedNumber = modifiedNumber + valueToAdjust;

      const currentRatio = calculateRatio(modifiedNumber);

      if (currentRatio < minRatio) {
        bestCandidate = modifiedNumber;
        minRatio = currentRatio;
      }
    }

    console.log(bestCandidate);
    currentNumber = bestCandidate + 1;
  }
  return 0;
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
