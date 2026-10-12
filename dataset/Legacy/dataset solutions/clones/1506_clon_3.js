"use strict";

function processInputData(rawData) {
  const trimmedInputContent = rawData.trim();
  const processedLinesArray = trimmedInputContent.split("\n");

  const numberOfEntries = parseInt(processedLinesArray[0], 10);

  let consecutiveMatchCount = 0;
  let hasReachedThreeConsecutive = false;

  for (let currentLineIndex = 1; currentLineIndex <= numberOfEntries; ++currentLineIndex) {
    const currentLineString = processedLinesArray[currentLineIndex];
    const lineParts = currentLineString.split(" ");

    const firstElement = lineParts[0];
    const secondElement = lineParts[1];

    if (firstElement === secondElement) {
      consecutiveMatchCount++;
    } else {
      consecutiveMatchCount = 0;
    }

    if (consecutiveMatchCount >= 3) {
      console.log("Yes");
      hasReachedThreeConsecutive = true;
      break;
    }
  }

  if (!hasReachedThreeConsecutive) {
    console.log("No");
  }
}

function sortNumbersAscending(dataCollection) {
  dataCollection.sort(compareAscendingValues);
  return dataCollection;
}

var compareAscendingValues = function (valueA, valueB) {
  return valueA - valueB;
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
