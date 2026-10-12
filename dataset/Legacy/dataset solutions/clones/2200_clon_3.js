"use strict";

function calculateRecursiveValue(currentNumber) {
  let accumulatedResult = 1;
  let processingNumber = currentNumber;

  while (processingNumber > 1) {
    accumulatedResult = (accumulatedResult * 2) + 1;
    processingNumber = processingNumber / 2;
  }
  return accumulatedResult;
}

function processApplication(rawInputData) {
  const cleanedInputString = rawInputData.trim();
  let numericInputVal = Number(cleanedInputString);
  let finalComputedResult = calculateRecursiveValue(numericInputVal);
  console.log(finalComputedResult);
}

const STD_IN_FILE_PATH = "/dev/stdin";
const FILE_SYSTEM_HANDLER = require("fs");
const inputContentBuffer = FILE_SYSTEM_HANDLER.readFileSync(STD_IN_FILE_PATH, "utf8");

processApplication(inputContentBuffer);
