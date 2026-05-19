"use strict";

function processInputData(sourceText) {
  const numericSequence = sourceText.split(/\n/).map(val => ~~val);

  const relevantNumbers = numericSequence.slice(1);

  const frequencyRegister = relevantNumbers.reduce((accumulatorMap, currentNumber) => {
    accumulatorMap.set(currentNumber, (accumulatorMap.get(currentNumber) || 0) + 1);
    return accumulatorMap;
  }, new Map());

  let oddOccurrenceCount = 0;
  for (const countValue of frequencyRegister.values()) {
    if (countValue % 2 !== 0) {
      oddOccurrenceCount++;
    }
  }

  console.log(oddOccurrenceCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
