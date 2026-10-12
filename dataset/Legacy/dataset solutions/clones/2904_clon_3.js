'use strict'

const parseNumericLine = (lineContent) => {
  return lineContent.split(' ').map(Number);
};

const processInputAndCalculate = (inputDataString) => {
  const trimmedAndSplitLines = inputDataString.trim().split('\n');

  const firstLineValues = parseNumericLine(trimmedAndSplitLines[0]);

  const initialValueA = firstLineValues[0];
  const initialValueB = firstLineValues[1];

  const multiplierForA = 3;

  const calculatedProduct = multiplierForA * initialValueA;
  const combinedSum = calculatedProduct + initialValueB;

  const finalResult = Math.floor(combinedSum / 2);

  console.log(finalResult);
}

processInputAndCalculate(require("fs").readFileSync("/dev/stdin", "utf8"));
