'use strict';

const parseTwoIntsFromString = (lineContent) => {
  const parts = lineContent.split(' ');
  const firstValue = parseInt(parts[0], 10);
  const secondValue = parseInt(parts[1], 10);
  return { first: firstValue, second: secondValue };
};

const processData = (inputLines) => {
  const initialParams = parseTwoIntsFromString(inputLines[0]);
  const itemCount = initialParams.first;
  const timeLimit = initialParams.second;

  let lowestValidCost = Number.MAX_SAFE_INTEGER;
  let foundSuitableOption = false;

  for (let currentIndex = 0; currentIndex < itemCount; currentIndex++) {
    const itemData = parseTwoIntsFromString(inputLines[currentIndex + 1]);
    const currentCost = itemData.first;
    const currentTime = itemData.second;

    if (currentTime <= timeLimit) {
      foundSuitableOption = true;
      if (currentCost < lowestValidCost) {
        lowestValidCost = currentCost;
      }
    }
  }

  if (foundSuitableOption) {
    console.log(lowestValidCost);
  } else {
    console.log('TLE');
  }
};

processData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
