"use strict";

function evaluateCondition(currentRemainder, limitFactor) {
  const comparisonThreshold = limitFactor * 5;
  return currentRemainder <= comparisonThreshold;
}

function processInputData(rawNumericInput) {
  const hundredsComponent = Math.floor(rawNumericInput / 100);
  const remainingValue = rawNumericInput % 100;

  const conditionMet = evaluateCondition(remainingValue, hundredsComponent);

  if (conditionMet) {
    console.log(1);
  } else {
    console.log(0);
  }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const numericInput = Number(fileContent);
processInputData(numericInput);
