"use strict"

function ProcessInput(rawData) {
  const trimmedInputString = rawData.trim();
  const stringValueArray = trimmedInputString.split(' ');
  const numericValueArray = stringValueArray.map(Number);

  const firstElement = numericValueArray[0];
  const secondElement = numericValueArray[1];

  let calculatedResult;

  if (firstElement <= 10) {
    const differenceFromTen = 10 - firstElement;
    const penaltyFactor = 100;
    const additionalValue = penaltyFactor * differenceFromTen;
    calculatedResult = secondElement + additionalValue;
  } else {
    calculatedResult = secondElement;
  }

  console.log(calculatedResult);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
