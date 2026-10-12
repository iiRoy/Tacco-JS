"use strict";

function displayOutcome(message) {
  console.log(message);
}

function getAdjustedInteger(stringValue) {
  return parseInt(stringValue, 10) - 1;
}

function swapArrayElements(targetArray, indexA, indexB) {
  let temporaryHolder = targetArray[indexA];
  targetArray[indexA] = targetArray[indexB];
  targetArray[indexB] = temporaryHolder;
}

function processPermutationData(inputString) {
  const inputLines = inputString.split("\n");
  const elementCount = parseInt(inputLines[0], 10);

  const permutationValues = inputLines.slice(1).map(getAdjustedInteger);

  for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
    const currentElementParity = permutationValues[currentIdx] % 2;
    const currentIndexParity = currentIdx % 2;
    if (currentElementParity !== currentIndexParity) {
      displayOutcome("No");
      return;
    }
  }

  for (let swapIdx = elementCount - 1; swapIdx > 1; swapIdx--) {
    const valueAtCurrent = permutationValues[swapIdx];
    const valueAtPrevious = permutationValues[swapIdx - 1];
    const valueAtTwoPrevious = permutationValues[swapIdx - 2];

    const isCurrentSmallerThanPrevious = valueAtCurrent < valueAtPrevious;
    const isPreviousSmallerThanTwoPrevious = valueAtPrevious < valueAtTwoPrevious;

    if (isCurrentSmallerThanPrevious && isPreviousSmallerThanTwoPrevious) {
      swapArrayElements(permutationValues, swapIdx, swapIdx - 2);
    }
  }

  for (let validationIdx = elementCount - 1; validationIdx > 1; validationIdx--) {
    const currentVal = permutationValues[validationIdx];
    const prevVal = permutationValues[validationIdx - 1];
    const twoPrevVal = permutationValues[validationIdx - 2];

    const conditionA = currentVal < twoPrevVal;
    const conditionB = currentVal > prevVal;
    const conditionC = prevVal > twoPrevVal;

    if (conditionA && (conditionB || conditionC)) {
      displayOutcome("No");
      return;
    }
  }

  displayOutcome("Yes");
  return;
}

processPermutationData(require("fs").readFileSync("/dev/stdin", "utf8"));
