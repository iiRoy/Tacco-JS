"use strict";

const processInput = inputData => {
  inputData = inputData.trim().split('\n');
  const numericValue = inputData[0];

  if (numericValue < 100) {
    console.log(0);
    return;
  }

  // Extract the last two digits from the input value.
  // This value will be reduced in a loop.
  // The goal is to make it zero using specific subtractions.
  let tensAndUnits = parseInt(numericValue.split('').slice(-2).join(''));
  let initialTensUnits = tensAndUnits;
  let operationCount = 0;

  if (tensAndUnits === 0) {
    console.log(1);
    return;
  }

  if (tensAndUnits === 1) {
    operationCount = tensAndUnits;
  }

  while (tensAndUnits !== 0) {
    if (tensAndUnits >= 5) {
      tensAndUnits = tensAndUnits - 5;
    } else if (tensAndUnits >= 4) {
      tensAndUnits = tensAndUnits - 4;
    } else if (tensAndUnits >= 3) {
      tensAndUnits = tensAndUnits - 3;
    } else if (tensAndUnits >= 2) {
      tensAndUnits = tensAndUnits - 2;
    } else if (tensAndUnits >= 1) {
      tensAndUnits = tensAndUnits - 1;
    }
    operationCount++;
  }

  // After reducing the last two digits, check if the calculated value
  // (based on operations) is less than or equal to the original number.
  if ((100 * operationCount) + initialTensUnits <= numericValue) {
    console.log(1);
  } else {
    console.log(0);
  }
};

processInput(require('node:fs').readFileSync('/dev/stdin', 'utf-8'));