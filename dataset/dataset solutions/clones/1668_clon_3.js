"use strict";

function processInputData(rawInputString) {
  const inputComponents = rawInputString.trim().split(" ");

  const minRange = parseInt(inputComponents[0], 10);
  const maxRange = parseInt(inputComponents[1], 10);
  const targetDivisor = parseInt(inputComponents[2], 10);

  let validMultipleCount = 0;

  const absoluteSearchUpperLimit = 100;

  for (let currentCandidateMultiple = targetDivisor;
       currentCandidateMultiple <= absoluteSearchUpperLimit;
       currentCandidateMultiple += targetDivisor) {

    const isWithinLowerBound = currentCandidateMultiple >= minRange;
    const isWithinUpperBound = currentCandidateMultiple <= maxRange;

    if (isWithinLowerBound && isWithinUpperBound) {
      validMultipleCount++;
    }
  }

  console.log(validMultipleCount);
}

function sortNumericArrayAsc(numericArray) {
  numericArray.sort(compareNumbersForAsc);
  return numericArray;
}

const compareNumbersForAsc = (valueA, valueB) => valueA - valueB;

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
