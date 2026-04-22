"use strict";

const processInputData = (rawTextContent) => {
  const linesOfText = rawTextContent.split('\n');
  const numericalSequence = linesOfText[1].split(' ').map(Number);

  let totalSum = 0;
  let sumOfSquares = 0;

  for (const currentNumber of numericalSequence) {
    totalSum += currentNumber;
    sumOfSquares += currentNumber * currentNumber;
  }

  const computedProductSum = (Math.pow(totalSum, 2) - sumOfSquares) / 2;

  console.log(computedProductSum);
};

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));