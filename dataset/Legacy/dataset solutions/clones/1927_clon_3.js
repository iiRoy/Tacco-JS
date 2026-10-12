'use strict';
const logOutput = messageContent => console.log(messageContent);

function processInputData(inputLines) {
  const primaryInputLineIndex = 0;
  const rawValues = inputLines[primaryInputLineIndex].split(" ");

  const operandA = parseInt(rawValues[0], 10);
  const operandB = parseInt(rawValues[1], 10);
  const iterationLimitN = parseInt(rawValues[2], 10);

  let maximumCalculatedValue = 0;

  for (let currentIteration = 1; currentIteration <= iterationLimitN; ++currentIteration) {
    const productAI = operandA * currentIteration;
    const firstTermResult = Math.floor(productAI / operandB);

    const quotientIB = currentIteration / operandB;
    const secondTermFactor = Math.floor(quotientIB);
    const secondTermResult = operandA * secondTermFactor;

    const currentCalculatedValue = firstTermResult - secondTermResult;

    maximumCalculatedValue = Math.max(maximumCalculatedValue, currentCalculatedValue);
  }

  logOutput(maximumCalculatedValue);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
