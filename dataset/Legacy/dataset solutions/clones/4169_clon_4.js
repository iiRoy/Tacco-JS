"use strict";

function calculateHalvingIterations(currentNumericSet, currentIterationCount) {
  const areAllMembersEven = currentNumericSet.every(member => member % 2 === 0);

  if (!areAllMembersEven) {
    return currentIterationCount;
  } else {
    const nextNumericSet = currentNumericSet.map(member => member / 2);
    return calculateHalvingIterations(nextNumericSet, currentIterationCount + 1);
  }
}

function processInputAndCompute(sourceText) {
  const textSegments = sourceText.split('\n');
  const stringNumbers = textSegments[1].split(' ');
  const initialNumbersAsValues = stringNumbers.map(Number);

  const finalIterationResult = calculateHalvingIterations(initialNumbersAsValues, 0);

  console.log(finalIterationResult);
}

processInputAndCompute(require("fs").readFileSync("/dev/stdin", "utf8"));
