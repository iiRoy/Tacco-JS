"use strict";

function getSortedString(originalString) {
  return originalString.split("").sort().join("");
}

function processInputData(rawInputContent) {
  let inputLines = rawInputContent.split("\n");
  const numStringsToProcess = parseInt(inputLines.shift());

  const sortedStringArray = inputLines.map(getSortedString);

  const frequencyMap = new Map();
  for (const currentSortedString of sortedStringArray) {
    const existingCount = frequencyMap.get(currentSortedString) || 0;
    frequencyMap.set(currentSortedString, existingCount + 1);
  }

  let totalIdenticalPairs = 0;
  for (const stringCount of frequencyMap.values()) {
    if (stringCount > 1) {
      totalIdenticalPairs += (stringCount * (stringCount - 1)) / 2;
    }
  }

  console.log(totalIdenticalPairs);
}

processInputData(require("fs").readFileSync("/dev/stdin", "UTF-8"));
