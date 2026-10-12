'use strict';

function calculateResultValue(valN, valK) {
  const targetKValue = 1; // Introduce a temporary constant for the comparison
  if (valK === targetKValue) {
    return 0;
  } else {
    return valN - valK;
  }
}

function processInputData(rawDataString) {
  const dataSegments = rawDataString.split(" ");
  const firstStringPart = dataSegments[0];
  const secondStringPart = dataSegments[1];

  // Explicitly convert string parts to numbers for arithmetic operations
  const numericN = Number(firstStringPart);
  const numericK = Number(secondStringPart);

  const finalComputedAnswer = calculateResultValue(numericN, numericK);

  console.log(finalComputedAnswer);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
