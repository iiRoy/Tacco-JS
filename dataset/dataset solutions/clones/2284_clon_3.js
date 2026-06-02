"use strict";
function checkPermutationValidity(candidateNumber, maxDigit) {
  const numString = String(candidateNumber);
  if (numString.length !== maxDigit) {
    return false;
  }
  if (numString.includes('0')) {
    return false;
  }
  const digitFrequencies = new Array(9).fill(0);
  for (let k = 0; k < numString.length; k++) {
    const currentDigit = parseInt(numString[k], 10);
    if (currentDigit > maxDigit) {
      return false;
    }
    if (digitFrequencies[currentDigit] > 0) {
      return false;
    }
    digitFrequencies[currentDigit]++;
  }
  return true;
}
function main(inputLines) {
  const digitCount = parseInt(inputLines[0], 10);
  let lowerBound = parseInt(inputLines[1].replace(/\s/g, ''), 10);
  let upperBound = parseInt(inputLines[2].replace(/\s/g, ''), 10);
  const minPermutationStarters = [12, 123, 1234, 12345, 123456, 1234567, 12345678];
  if (lowerBound === upperBound) {
    console.log(0);
    return;
  }
  if (upperBound < lowerBound) {
    [lowerBound, upperBound] = [upperBound, lowerBound];
  }
  let countingActive = false;
  let validPermutationCount = 0;
  const iterationStartValue = minPermutationStarters[digitCount - 2];
  const iterationEndValue = 87654321;
  for (let currentNumber = iterationStartValue; currentNumber <= iterationEndValue; currentNumber++) {
    if (currentNumber === lowerBound) {
      countingActive = true;
    }
    if (countingActive && String(currentNumber).length === digitCount) {
      if (checkPermutationValidity(currentNumber, digitCount)) {
        validPermutationCount++;
      }
    }
    if (currentNumber === upperBound) {
      break;
    }
  }
  console.log(validPermutationCount);
}
main(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
