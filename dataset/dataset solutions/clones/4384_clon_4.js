"use strict";

function processData(rawInputString) {
  const numericStrings = rawInputString.match(/-?\d+/g);
  const initialNumbers = numericStrings ? numericStrings.map(Number) : [];
  if (initialNumbers.length > 0) {
    initialNumbers.shift();
  }

  const expandedNumbers = initialNumbers.flatMap(val => [val - 1, val, val + 1]);

  const orderedNumbers = expandedNumbers.sort((a, b) => a - b);

  const frequencyCounter = orderedNumbers.reduce((accumulator, currentNumber) => {
    accumulator.set(currentNumber, (accumulator.get(currentNumber) || 0) + 1);
    return accumulator;
  }, new Map());

  let peakCount = 1;
  if (frequencyCounter.size > 0) {
    peakCount = Math.max(...frequencyCounter.values());
  }

  console.log(peakCount);
}

processData(require("fs").readFileSync("/dev/stdin", "utf8"));
