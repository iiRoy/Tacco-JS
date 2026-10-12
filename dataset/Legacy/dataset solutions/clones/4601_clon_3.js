'use strict'

function processInputAndSolve(inputDataString) {
  const firstLineContent = inputDataString.split('\n')[0];
  const spaceSeparatedNumbers = firstLineContent.split(' ');
  const parsedNumericValues = spaceSeparatedNumbers.map(strNum => Number(strNum));

  const firstOperand = parsedNumericValues[0];
  const secondOperand = parsedNumericValues[1];
  const targetRemainder = parsedNumericValues[2];

  let calculatedRemainders = new Set();

  const iterationLimit = firstOperand * secondOperand;

  for (let loopIndex = 0; loopIndex <= iterationLimit; loopIndex++) {
    const currentProduct = firstOperand * loopIndex;
    const currentModuloResult = currentProduct % secondOperand;
    calculatedRemainders.add(currentModuloResult);
  }

  let finalVerdictMessage;
  if (calculatedRemainders.has(targetRemainder)) {
    finalVerdictMessage = 'YES';
  } else {
    finalVerdictMessage = 'NO';
  }

  console.log(finalVerdictMessage);
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
