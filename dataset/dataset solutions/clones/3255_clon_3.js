'use strict';

const computeNextValue = (currentNumber) => {
  let nextCalculatedValue;
  const isEven = (currentNumber % 2 === 0);
  if (isEven) {
    nextCalculatedValue = currentNumber / 2;
  } else {
    nextCalculatedValue = currentNumber * 3 + 1;
  }
  return nextCalculatedValue;
};

const findCycleLength = (initialValueString) => {
  const START_STEP_COUNT = 2;
  const parsedInitialValue = parseInt(initialValueString, 10);
  let currentSequenceNumber = parsedInitialValue;

  let visitedNumbersTracker = new Set();
  visitedNumbersTracker.add(currentSequenceNumber);

  let sequenceStepCount = START_STEP_COUNT;

  while (true) {
    const nextNumberInSequence = computeNextValue(currentSequenceNumber);
    if (visitedNumbersTracker.has(nextNumberInSequence)) {
      return sequenceStepCount;
    }
    visitedNumbersTracker.add(nextNumberInSequence);
    currentSequenceNumber = nextNumberInSequence;
    sequenceStepCount++;
  }
};

function ApplicationEntry(fileContent) {
  const trimmedContent = fileContent.trim();
  console.log(findCycleLength(trimmedContent));
}

ApplicationEntry(require('fs').readFileSync('/dev/stdin', 'utf8'));
