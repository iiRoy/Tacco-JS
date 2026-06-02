'use strict'

function computeReciprocalSum(numberArray) {
  let currentSum = 0;
  const RECIPROCAL_BASE = 1;
  numberArray.forEach(numElement => {
    currentSum += RECIPROCAL_BASE / numElement;
  });
  return currentSum;
}

function Main(rawData) {
  const allInputLines = rawData.split("\n");
  const numbersAsStringLine = allInputLines[1];
  const stringTokens = numbersAsStringLine.split(" ");
  const parsedNumbers = stringTokens.map(str => Number(str));

  const totalReciprocalSum = computeReciprocalSum(parsedNumbers);

  const finalResult = 1 / totalReciprocalSum;

  console.log(finalResult);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8").trim());
