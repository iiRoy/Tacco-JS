"use strict";

const IS_DEBUG_ENABLED = false;
const initialInputString = IS_DEBUG_ENABLED
  ? "-9"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const BASE_NEG_TWO = -2;

// Helper function to calculate one digit and update the value for base -2 conversion
const getNextDigitAndUpdateValue = (currentNum) => {
    let rem = currentNum % BASE_NEG_TWO;
    let nextNum = Math.trunc(currentNum / BASE_NEG_TWO);

    if (rem < 0) {
        rem = Math.abs(rem);
        nextNum += 1;
    }
    return { digit: rem, updatedValue: nextNum };
};

const convertBaseNegTwo = inputStr => {
  let currentValue = parseInt(inputStr);
  let outputString = "";

  while (currentValue !== 0) {
    const { digit: currentRemainder, updatedValue: nextValue } = getNextDigitAndUpdateValue(currentValue);
    currentValue = nextValue;
    outputString = currentRemainder.toString() + outputString;
  }

  console.log(outputString);
};

convertBaseNegTwo(initialInputString);
