const fileSystem = require('fs');

const MAX_NUMBER_OF_PARTS = 10;
const MAX_ACCUMULATED_VALUE = 45;
const MAX_EXCLUSIVE_UPPER_BOUND = 11;

const countWaysMatrix = Array(MAX_NUMBER_OF_PARTS).fill(null).map(() =>
  Array(MAX_ACCUMULATED_VALUE + 1).fill(null).map(() =>
    Array(MAX_EXCLUSIVE_UPPER_BOUND).fill(0)
  )
);

for (let b = 0; b < MAX_EXCLUSIVE_UPPER_BOUND; b++) {
  countWaysMatrix[0][0][b] = 1;
}

for (let partsCount = 1; partsCount < MAX_NUMBER_OF_PARTS; partsCount++) {
  for (let currentSumTarget = 0; currentSumTarget <= MAX_ACCUMULATED_VALUE; currentSumTarget++) {
    for (let currentUpperBound = 1; currentUpperBound < MAX_EXCLUSIVE_UPPER_BOUND; currentUpperBound++) {
      countWaysMatrix[partsCount][currentSumTarget][currentUpperBound] = countWaysMatrix[partsCount][currentSumTarget][currentUpperBound - 1];

      const digitToInclude = currentUpperBound - 1;
      if (currentSumTarget >= digitToInclude) {
        countWaysMatrix[partsCount][currentSumTarget][currentUpperBound] += countWaysMatrix[partsCount - 1][currentSumTarget - digitToInclude][currentUpperBound - 1];
      }
    }
  }
}

function processInputLines() {
  const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const instructionEntries = rawInputData.trim().split('\n');

  for (const currentEntry of instructionEntries) {
    if (currentEntry === '0 0') {
      break;
    }

    const numericParts = currentEntry.split(' ');
    const requiredDigitCount = parseInt(numericParts[0], 10);
    const desiredTotalSum = parseInt(numericParts[1], 10);

    let totalCalculatedCombinations = 0;

    for (let largestDigit = 9; largestDigit >= requiredDigitCount; largestDigit--) {
      const remainingSumNeeded = desiredTotalSum - largestDigit;
      const remainingDigitsToFind = requiredDigitCount - 1;

      if (remainingDigitsToFind >= 0 && remainingSumNeeded >= 0 &&
          remainingDigitsToFind < MAX_NUMBER_OF_PARTS && remainingSumNeeded <= MAX_ACCUMULATED_VALUE &&
          largestDigit < MAX_EXCLUSIVE_UPPER_BOUND) {
        totalCalculatedCombinations += countWaysMatrix[remainingDigitsToFind][remainingSumNeeded][largestDigit];
      }
    }
    console.log(totalCalculatedCombinations);
  }
}

processInputLines();