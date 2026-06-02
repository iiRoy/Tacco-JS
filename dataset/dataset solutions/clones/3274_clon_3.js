"use strict";
process.stdin.resume();
process.stdin.setEncoding("utf8");

var inputLines = [];

var inputReader = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

inputReader.on("line", line => {
  inputLines.push(line.split(/\s/).map(val => parseInt(val, 10)));
});

const calculateArraySum = (arr) => {
  return arr.reduce((acc, currentVal) => acc + currentVal, 0);
};

inputReader.on("close", () => {
  let arraySize = inputLines.shift()[0]; // Assuming n is a single number in the first line
  let arrayA = inputLines.shift();
  let arrayB = inputLines.shift();

  let sumA = calculateArraySum(arrayA);
  let sumB = calculateArraySum(arrayB);

  if (sumA < sumB) {
    console.log(-1);
    return;
  }

  let allDifferences = [];
  for (let idx = 0; idx < arraySize; idx++) {
    allDifferences.push(arrayA[idx] - arrayB[idx]);
  }

  let negativeDiffCount = 0;
  let positiveDifferences = [];
  let totalNegativeSum = 0;

  for (let idx = 0; idx < arraySize; idx++) {
    let currentDiff = allDifferences[idx];
    if (currentDiff > 0) {
      positiveDifferences.push(currentDiff);
    } else {
      negativeDiffCount++;
      totalNegativeSum += currentDiff;
    }
  }

  positiveDifferences.sort((val1, val2) => val2 - val1);

  let currentPositiveSum = 0;
  let positiveDiffIndex = 0;

  while (true) {
    let combinedCurrentSum = currentPositiveSum + totalNegativeSum;
    if (combinedCurrentSum >= 0) {
      break;
    }
    currentPositiveSum += positiveDifferences[positiveDiffIndex];
    positiveDiffIndex++;
  }

  console.log(negativeDiffCount + positiveDiffIndex);
});
