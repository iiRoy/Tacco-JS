"use strict";

function processInputAndCompare(rawData) {
  const firstSpacePosition = rawData.indexOf(' ');
  let firstSegment;
  let secondSegment;

  if (firstSpacePosition === -1) {
    firstSegment = rawData;
    secondSegment = "";
  } else {
    firstSegment = rawData.substring(0, firstSpacePosition);
    secondSegment = rawData.substring(firstSpacePosition + 1);
  }

  const firstCharacterValue = firstSegment.charCodeAt(0);
  const secondCharacterValue = secondSegment.charCodeAt(0);

  const comparisonOutcomeMap = new Map([
    [0, "="],
    [1, ">"],
    [-1, "<"]
  ]);

  const numericDifferenceSign = Math.sign(firstCharacterValue - secondCharacterValue);
  let finalSymbol;

  if (Number.isNaN(numericDifferenceSign)) {
    finalSymbol = "<";
  } else {
    finalSymbol = comparisonOutcomeMap.get(numericDifferenceSign);
  }

  console.log(finalSymbol);
}

processInputAndCompare(require("fs").readFileSync("/dev/stdin", "utf8"));
