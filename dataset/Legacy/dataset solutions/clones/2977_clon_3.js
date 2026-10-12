"use strict";

const checkBlueDivisibility = (currentRemainder, blueUnitValue) => {
  return currentRemainder % blueUnitValue === 0;
};

const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");

const stringValues = rawInputContent.split(" ");

const numericInputs = stringValues.map(str => parseInt(str, 10));

const redUnitValue = numericInputs[0];
const greenUnitValue = numericInputs[1];
const blueUnitValue = numericInputs[2];
const desiredTotalSum = numericInputs[3];

let totalValidCombinations = 0;

const maxRedCountPossible = Math.floor(desiredTotalSum / redUnitValue);

for (let currentRedCount = 0; currentRedCount <= maxRedCountPossible; currentRedCount++) {
  const redContribution = currentRedCount * redUnitValue;
  const sumRemainingAfterRed = desiredTotalSum - redContribution;

  const maxGreenCountPossible = Math.floor(sumRemainingAfterRed / greenUnitValue);

  for (let currentGreenCount = 0; currentGreenCount <= maxGreenCountPossible; currentGreenCount++) {
    const greenContribution = currentGreenCount * greenUnitValue;
    const currentSumOfTwoColors = redContribution + greenContribution;
    const sumRemainingForBlue = desiredTotalSum - currentSumOfTwoColors;

    if (checkBlueDivisibility(sumRemainingForBlue, blueUnitValue)) {
      totalValidCombinations++;
    }
  }
}

console.log(totalValidCombinations);
