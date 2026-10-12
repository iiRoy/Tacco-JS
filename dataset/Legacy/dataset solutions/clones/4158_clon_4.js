"use strict";

const processInput = (inputData) => {
  const lines = inputData.trim().split("\n");
  const elementCount = parseInt(lines[0]);
  const rawValues = lines[1].split(" ").map(valStr => parseInt(valStr));

  const relevantValues = rawValues.slice(0, elementCount);

  const comparisonLimit = 100000;

  const hasInvalidNumber = relevantValues.some(val => isNaN(val) || val < 0);

  let finalTally;

  if (hasInvalidNumber) {
    finalTally = NaN;
  } else {
    finalTally = relevantValues.reduce((accumulator, currentVal) => {
      return accumulator + (currentVal > comparisonLimit ? 1 : 0);
    }, 0);
  }

  console.log(finalTally);
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
