'use strict';
const nextTerm = (numeral) => {
  if ((numeral & 1) === 0) {
    return numeral >>> 1;
  } else {
    return (numeral * 3) + 1;
  }
};

const findRecurrencePoint = (initialValue) => {
  const pathIndices = new Map();
  let iterationIndex = 1;

  const tracePath = (currentNumeral) => {
    if (pathIndices.has(currentNumeral)) {
      return iterationIndex;
    }

    pathIndices.set(currentNumeral, iterationIndex);

    const subsequentNumeral = nextTerm(currentNumeral);

    iterationIndex++;

    return tracePath(subsequentNumeral);
  };

  return tracePath(+initialValue);
};

const ProgramEntry = (inputString) => {
  console.log(findRecurrencePoint(inputString));
};

ProgramEntry(require('node:fs').readFileSync('/dev/stdin', 'utf8'));