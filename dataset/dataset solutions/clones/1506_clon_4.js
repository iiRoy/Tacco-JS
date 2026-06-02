"use strict";

function processInputData(rawData) {
  const allLines = rawData.trim().split('\n');
  const entryCount = Number(allLines[0]);

  let currentConsecutiveMatches = 0;

  const hasThreeConsecutive = Array.from({ length: entryCount }, (_, i) => i + 1)
    .some(idx => {
      const lineContent = allLines[idx];
      const [valA, valB] = lineContent.split(' ');

      if (valA === valB) {
        currentConsecutiveMatches++;
      } else {
        currentConsecutiveMatches = 0;
      }

      return currentConsecutiveMatches >= 3;
    });

  if (hasThreeConsecutive) {
    console.log("Yes");
  } else {
    console.log("No");
  }
}

const numericOrder = (first, second) => first - second;

function arrangeNumbers(collection) {
  collection.sort(numericOrder);
  return collection;
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf-8"));
