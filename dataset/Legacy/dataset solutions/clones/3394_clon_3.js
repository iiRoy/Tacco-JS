"use strict";

function isPowerOfTwo(valueToCheck) {
  const binaryRepresentation = valueToCheck.toString(2);

  if (binaryRepresentation[0] !== "1") {
    return false;
  }

  const remainingDigitsAreZeros = Array.from(binaryRepresentation.substring(1)).every(
    (digitChar) => digitChar === "0"
  );

  return remainingDigitsAreZeros;
}

function attemptPairingAndRemoval(numberList, powerCheckFunction) {
  if (numberList.length === 0) {
    return false;
  }

  const headValue = numberList[0];
  let pairWasFound = false;

  for (let currentElementIndex = 1; currentElementIndex < numberList.length; currentElementIndex++) {
    const potentialSum = headValue + numberList[currentElementIndex];

    if (powerCheckFunction(potentialSum)) {
      numberList.splice(currentElementIndex, 1);
      numberList.splice(0, 1);
      pairWasFound = true;
      break;
    }
  }

  if (!pairWasFound) {
    numberList.splice(0, 1);
  }

  return pairWasFound;
}

function processInputData(rawInputString) {
  const inputLines = rawInputString.split("\n").filter((lineContent) => lineContent !== "");

  const initialNumbersString = inputLines[1];
  const initialNumbers = initialNumbersString.split(" ").map(Number);

  let remainingNumbers = initialNumbers.sort((valA, valB) => valB - valA);

  let successfulPairCount = 0;

  while (remainingNumbers.length > 0) {
    const didFindPair = attemptPairingAndRemoval(remainingNumbers, isPowerOfTwo);
    if (didFindPair) {
      successfulPairCount++;
    }
  }

  console.log(successfulPairCount);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
