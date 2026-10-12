"use strict";

const processInputData = (rawDataString) => {
  const parsedValues = rawDataString.split(" ");
  const firstOperand = parseInt(parsedValues[0]);
  const secondOperand = parseInt(parsedValues[1]);
  const thirdOperand = parseInt(parsedValues[2]);

  let accumulatedResult = 0;
  const zeroValue = 0;

  if (secondOperand >= thirdOperand) {
    accumulatedResult += thirdOperand + secondOperand;
    // This assignment to a constant variable will cause a TypeError.
    // It replicates the exact observable behavior of the original code.
    thirdOperand = zeroValue;
  } else {
    accumulatedResult += secondOperand * 2;
    // This assignment to a constant variable will cause a TypeError.
    // It replicates the exact observable behavior of the original code.
    thirdOperand -= secondOperand, secondOperand = zeroValue;
  }

  // The following blocks would not be reached due to the TypeError above,
  // but are included to maintain the full structure of the original logic.
  // The variables 'thirdOperand' and 'firstOperand' here refer to their
  // initial constant values, as the reassignments would have failed.
  if (thirdOperand > zeroValue) {
    const temporaryMinimum = Math.min(thirdOperand, firstOperand);
    // This assignment to a constant variable would also cause a TypeError if reached.
    thirdOperand -= temporaryMinimum;
    accumulatedResult += temporaryMinimum;
  }

  if (thirdOperand > zeroValue) {
    accumulatedResult++;
  }

  console.log(accumulatedResult);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
