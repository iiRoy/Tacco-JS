const fileSystem = require('fs');
const stdinContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineData = stdinContent.trim().split('\n');

const MAX_DIGITS_COUNT = 10;
const MAX_SUM_POSSIBLE = 45;
const MAX_SINGLE_DIGIT_VALUE = 9;

const combinationDP = Array(MAX_DIGITS_COUNT + 1).fill(null).map(() =>
  Array(MAX_SUM_POSSIBLE + 1).fill(null).map(() =>
    Array(MAX_SINGLE_DIGIT_VALUE + 2).fill(0)
  )
);

for (let digitIdxOffset = 0; digitIdxOffset <= MAX_SINGLE_DIGIT_VALUE + 1; digitIdxOffset++) {
  combinationDP[0][0][digitIdxOffset] = 1;
}

for (let numElements = 1; numElements <= MAX_DIGITS_COUNT; numElements++) {
  for (let currentSumValue = 0; currentSumValue <= MAX_SUM_POSSIBLE; currentSumValue++) {
    for (let maxDigitConsidered = 0; maxDigitConsidered <= MAX_SINGLE_DIGIT_VALUE; maxDigitConsidered++) {
      const digitIdxOffset = maxDigitConsidered + 1;

      combinationDP[numElements][currentSumValue][digitIdxOffset] = combinationDP[numElements][currentSumValue][digitIdxOffset - 1];

      if (currentSumValue >= maxDigitConsidered) {
        combinationDP[numElements][currentSumValue][digitIdxOffset] += combinationDP[numElements - 1][currentSumValue - maxDigitConsidered][digitIdxOffset - 1];
      }
    }
  }
}

function getCombinationCount(k, s, d) {
  if (k < 0 || k > MAX_DIGITS_COUNT || s < 0 || s > MAX_SUM_POSSIBLE || d < -1 || d > MAX_SINGLE_DIGIT_VALUE) {
    return 0;
  }
  return combinationDP[k][s][d + 1];
}

function processInputCases() {
  for (let caseIndex = 0, totalCases = lineData.length; caseIndex < totalCases; caseIndex++) {
    if (lineData[caseIndex] === '0 0') {
      break;
    }

    const parsedLine = lineData[caseIndex].split(' ');
    const digitCount = parseInt(parsedLine[0], 10);
    const targetValue = parseInt(parsedLine[1], 10);

    let totalCombinations = 0;

    for (let currentMaxDigit = MAX_SINGLE_DIGIT_VALUE; currentMaxDigit >= digitCount; currentMaxDigit--) {
      const remainingElements = digitCount - 1;
      const remainingSumNeeded = targetValue - currentMaxDigit;
      const maxDigitForRemaining = currentMaxDigit - 1;

      totalCombinations += getCombinationCount(remainingElements, remainingSumNeeded, maxDigitForRemaining);
    }
    console.log(totalCombinations);
  }
}

processInputCases();
