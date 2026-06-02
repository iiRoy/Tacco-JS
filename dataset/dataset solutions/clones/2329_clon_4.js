"use strict";

const findNextSequentialValue = (currentExpectedNumber, remainingSequence) => {
  if (remainingSequence.length === 0) {
    return currentExpectedNumber;
  }

  const occurrenceIndex = remainingSequence.indexOf(currentExpectedNumber);

  if (occurrenceIndex !== -1) {
    return findNextSequentialValue(currentExpectedNumber + 1, remainingSequence.slice(occurrenceIndex + 1));
  } else {
    return currentExpectedNumber;
  }
};

const processInputData = (inputLines) => {
  const totalCount = Number.parseInt(inputLines[0]);
  const numberCollection = inputLines[1].split(" ").map(Number.parseInt);

  const finalSequentialCount = findNextSequentialValue(1, numberCollection);

  return finalSequentialCount === 1 ? -1 : totalCount - finalSequentialCount + 1;
};

console.log(processInputData(require("fs").readFileSync("/dev/stdin", "utf-8")
  .trim().split("\n")));
