'use strict';

function determineCharacterDifference(charOne, charTwo) {
  return charOne !== charTwo;
}

function executeComparison(sourceData) {
  const LINE_BREAK_PATTERN = /\r?\n/g;
  const cleanedSourceData = sourceData.trim();
  const dataLines = cleanedSourceData.split(LINE_BREAK_PATTERN);

  const stringA = dataLines[0];
  const stringB = dataLines[1];

  let differingCharacterCount = 0;
  const commonLength = stringA.length;

  let currentPosition = 0;
  while (currentPosition < commonLength) {
    const charFromA = stringA[currentPosition];
    const charFromB = stringB[currentPosition];

    if (determineCharacterDifference(charFromA, charFromB)) {
      differingCharacterCount++;
    }
    currentPosition++;
  }
  console.log(differingCharacterCount);
}

executeComparison(require("fs").readFileSync("/dev/stdin", "utf8"));
