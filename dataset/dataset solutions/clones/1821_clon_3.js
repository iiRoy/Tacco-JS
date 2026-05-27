const fileSystem = require('fs');
const rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputTokens = rawInputString.trim().split(/\s+/);

const parseInteger = (str) => parseInt(str, 10);

const numPairs = parseInteger(inputTokens[0]);
const arrOne = new Array(numPairs);
const arrTwo = new Array(numPairs);

let currentTokenIndex = 1;
for (let loopCounter = 0; loopCounter < numPairs; loopCounter += 1) {
  arrOne[loopCounter] = parseInteger(inputTokens[currentTokenIndex]);
  currentTokenIndex += 1;
  arrTwo[loopCounter] = parseInteger(inputTokens[currentTokenIndex]);
  currentTokenIndex += 1;
}

const numericSortAsc = (valA, valB) => valA - valB;
arrOne.sort(numericSortAsc);
arrTwo.sort(numericSortAsc);

const ONE_UNIT = 1;
const DIVISOR_TWO = 2;

let finalCalculatedRange;

const isEvenCount = (numPairs % DIVISOR_TWO === 0);

if (isEvenCount) {
  const midIdx1 = (numPairs / DIVISOR_TWO) - ONE_UNIT;
  const midIdx2 = numPairs / DIVISOR_TWO;

  const upperMedianBound = arrTwo[midIdx1] + arrTwo[midIdx2];
  const lowerMedianBound = arrOne[midIdx1] + arrOne[midIdx2];
  finalCalculatedRange = upperMedianBound - lowerMedianBound + ONE_UNIT;
} else {
  const centralIndex = Math.floor(numPairs / DIVISOR_TWO);

  const upperMedianBound = arrTwo[centralIndex];
  const lowerMedianBound = arrOne[centralIndex];
  finalCalculatedRange = upperMedianBound - lowerMedianBound + ONE_UNIT;
}

console.log(finalCalculatedRange);
