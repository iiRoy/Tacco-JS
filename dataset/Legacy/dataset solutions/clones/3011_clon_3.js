'use strict';

function calculateGCD(valueA, valueB) {
  let currentA = valueA;
  let currentB = valueB;
  while (currentB !== 0) {
    const remainder = currentA % currentB;
    currentA = currentB;
    currentB = remainder;
  }
  return currentA;
}

const parseNumericValue = (inputString) => {
  return +inputString;
};

const processInputData = (rawInputLines) => {
  const totalNumbers = parseNumericValue(rawInputLines[0]);
  const numberArray = rawInputLines[1].split(' ').map(parseNumericValue);

  let maxOverallGCD = 0;

  for (let excludedElementIndex = 0; excludedElementIndex < totalNumbers; excludedElementIndex++) {
    const subsetForGCD = [];
    for (let currentElementIndex = 0; currentElementIndex < totalNumbers; currentElementIndex++) {
      if (excludedElementIndex !== currentElementIndex) {
        subsetForGCD.push(numberArray[currentElementIndex]);
      }
    }

    let currentSubsetGCD = 0;

    if (subsetForGCD.length > 0) {
      currentSubsetGCD = subsetForGCD.reduce((accumulator, currentValue) => {
        return calculateGCD(accumulator, currentValue);
      });
    }

    maxOverallGCD = Math.max(maxOverallGCD, currentSubsetGCD);
  }

  console.log(maxOverallGCD);
};

const fileSystemModule = require("fs");
const standardInputPath = "/dev/stdin";
const rawInputContent = fileSystemModule.readFileSync(standardInputPath, "utf8");
const cleanedInputLines = rawInputContent.trim().split(/\n/);

processInputData(cleanedInputLines);
