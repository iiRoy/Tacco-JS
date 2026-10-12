'use strict';

function processInputData(rawData) {
  const inputSegments = rawData.split('\n').filter(Boolean);

  const elementCount = Number(inputSegments[0]);

  const numericSequence = inputSegments[1].split(' ').map(Number);

  console.log(evaluateSequence(numericSequence));
}

function evaluateSequence(sourceSequence) {
  const sequenceCopy = [...sourceSequence];

  const deviationTally = sequenceCopy.reduce((accumulator, currentVal, currentIdx) => {
    return accumulator + (currentVal !== (currentIdx + 1) ? 1 : 0);
  }, 0);

  return deviationTally <= 2 ? 'YES' : 'NO';
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
