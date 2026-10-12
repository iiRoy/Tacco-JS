"use strict";

function incrementCount(counterObject, keyToIncrement) {
  const currentCount = counterObject[keyToIncrement] || 0;
  counterObject[keyToIncrement] = currentCount + 1;
}

function processInputData(rawInputString) {
  const inputLines = rawInputString.trim().split('\n');

  const sequenceLength = Number(inputLines[0]);

  const sequenceString = inputLines[1].trim();
  const numericSequence = sequenceString.split(' ').map(Number);

  const PARITY_KEY_EVEN = 'even';
  const PARITY_KEY_ODD = 'odd';

  let parityTally = {};

  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const currentValue = numericSequence[currentIndex];
    if (currentValue % 2 === 0) {
      incrementCount(parityTally, PARITY_KEY_EVEN);
    } else {
      incrementCount(parityTally, PARITY_KEY_ODD);
    }
  }

  const actualOddCount = parityTally[PARITY_KEY_ODD];

  const isOddCountValueOdd = (actualOddCount % 2 !== 0);

  if (isOddCountValueOdd) {
    console.log('NO');
  } else {
    console.log('YES');
  }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
