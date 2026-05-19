"use strict"

function isIndexValidAndWithinLimit(foundIndex, upperLimit) {
  const effectiveUpperBound = upperLimit - 1;
  const isFound = foundIndex !== -1;
  const isWithinRange = foundIndex <= effectiveUpperBound;
  return isFound && isWithinRange;
}

function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const targetString = inputLines[0];

  const limitString = inputLines[1];
  const limitValue = parseInt(limitString, 10);

  const searchPattern = /[^1]+/;
  const foundCharIndex = targetString.search(searchPattern);

  if (isIndexValidAndWithinLimit(foundCharIndex, limitValue)) {
    console.log(targetString[foundCharIndex]);
  } else {
    console.log(1);
  }
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
processInput(fileContent);
