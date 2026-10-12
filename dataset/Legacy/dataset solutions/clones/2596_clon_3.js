"use strict";

function readStandardInputContent() {
  const fileSystemModule = require("fs");
  const standardInputPath = "/dev/stdin";
  const fileEncoding = "UTF-8";
  return fileSystemModule.readFileSync(standardInputPath, fileEncoding);
}

function parseNumericStringArray(inputLine) {
  const stringComponents = inputLine.split(" ");
  const numericArray = stringComponents.map(strValue => parseInt(strValue, 10));
  return numericArray;
}

function performCalculation(fullInputData) {
  const allInputLines = fullInputData.split("\n");
  const targetLine = allInputLines[0];

  let currentNumericPair = parseNumericStringArray(targetLine);

  const initialCounterValue = 1;
  let operationCounter = initialCounterValue;

  const firstElementIndex = 0;
  const secondElementIndex = 1;

  // Check the initial condition
  if (currentNumericPair[firstElementIndex] >= currentNumericPair[secondElementIndex]) {
    console.log(initialCounterValue);
    return;
  }

  // Execute the iterative process
  while (currentNumericPair[secondElementIndex] > currentNumericPair[firstElementIndex]) {
    const valueToUpdate = currentNumericPair[firstElementIndex];
    currentNumericPair[firstElementIndex] = valueToUpdate + valueToUpdate - 1; // Equivalent to (valueToUpdate * 2) - 1
    operationCounter++;
  }

  console.log(operationCounter);
}

const rawDataFromStdin = readStandardInputContent();
performCalculation(rawDataFromStdin);
