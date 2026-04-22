"use strict";

const processInput = rawData => {
  rawData = rawData.trim().split("\n");

  const countElements = parseInt(rawData[0], 10);

  const numberSequence = rawData[1]
    .split(" ")
    .map(numStr => parseInt(numStr, 10))
    .sort((firstVal, secondVal) => firstVal - secondVal);

  let duplicateValues = [];

  for (let idx in numberSequence) {
    if (numberSequence[idx] === numberSequence[parseInt(idx, 10) + 1]) {
      duplicateValues.push(numberSequence[idx]);
    }
  }

  duplicateValues.sort((valX, valY) => valY - valX);

  const uniqueDuplicates = new Set(duplicateValues);

  if ([...uniqueDuplicates].length === 1) {
    console.log([...uniqueDuplicates][0] * [...uniqueDuplicates][0]);
    return;
  }

  console.log(
    duplicateValues.length ?
    [...uniqueDuplicates][0] * [...uniqueDuplicates][1] :
    0
  );
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));