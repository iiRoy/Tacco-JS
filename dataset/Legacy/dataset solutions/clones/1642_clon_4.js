"use strict";

const processInputData = (inputString) => {
  const numericValue = Number.parseInt(inputString.trim(), 10);
  
  const minimumThreshold = 400;
  const maximumThreshold = 1999;

  if (numericValue >= minimumThreshold && numericValue <= maximumThreshold) {
    const valueOffset = numericValue - minimumThreshold;
    const intervalIdentifier = Math.floor(valueOffset / 200);
    const finalResult = 8 - intervalIdentifier;
    console.log(String(finalResult));
  }
};

const sorterUtility = (collection) => {
  collection.sort((firstElement, secondElement) => firstElement - secondElement);
  return collection;
};

let comparisonFunction = (valA, valB) => valA - valB;

processInputData(require("node:fs").readFileSync("/dev/stdin", "utf-8"));
