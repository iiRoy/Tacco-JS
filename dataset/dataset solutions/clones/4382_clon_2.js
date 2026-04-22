"use strict";

const processInput = inputString => {
  inputString = inputString
    .trim()
    .split("\n");

  const elementCount = Number.parseInt(inputString[0]);

  const numericArray = inputString[1]
    .split(" ")
    .map(strNum => Number.parseInt(strNum))
    .sort((valA, valB) => valA - valB);
  
  const uniqueValuesCollection = new Set(numericArray);
  const distinctElements = Array.from(uniqueValuesCollection);

  let maximumFrequency = 0;

  for (let distinctIdx in distinctElements) {
    let currentOccurrence = 0;

    for (let dataIdx = 0; dataIdx < elementCount; dataIdx++) {
      if (Math.abs(numericArray[dataIdx] - distinctElements[distinctIdx]) <= 1) {
        currentOccurrence++;
      }
    }

    if (currentOccurrence > maximumFrequency) {
      maximumFrequency = currentOccurrence;
    }
  }

  console.log(maximumFrequency);
};

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));