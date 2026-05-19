'use strict';

function processInputData(rawText) {
  const lines = rawText.split('\r\n');
  const numericStrings = lines.slice(1);

  const frequencyMap = numericStrings.reduce((accumulator, currentNumberString) => {
    accumulator.set(currentNumberString, (accumulator.get(currentNumberString) || 0) + 1);
    return accumulator;
  }, new Map());

  const finalCount = Array.from(frequencyMap.values()).reduce((totalOdd, currentFrequency) => {
    return totalOdd + (currentFrequency % 2 === 1 ? 1 : 0);
  }, 0);

  console.log(finalCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
