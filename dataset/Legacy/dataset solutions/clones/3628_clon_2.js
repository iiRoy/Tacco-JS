// This program converts a decimal number to its base -2 representation.
"use strict";

const IS_DEBUGGING = false;
const initialInputString = IS_DEBUGGING
  ? "-9"
  : require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim();

const convertAndDisplay = (inputData) => {
  let currentValue = parseInt(inputData);
  let binaryRepresentation = "";

  while (currentValue !== 0) {
    let currentRemainder = currentValue % -2;
    currentValue = ~~(currentValue / -2);

    if (currentRemainder < 0) {
      currentRemainder *= -1;
      currentValue += 1;
    }

    binaryRepresentation = Number(currentRemainder).toString() + binaryRepresentation;
  }

  console.log(binaryRepresentation);
};

convertAndDisplay(initialInputString);
