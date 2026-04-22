'use strict'
const dataStream = require('fs').readFileSync(0, 'utf8');
const inputLine = dataStream.split('\n')[0];

const segmentCombinations = (digitSequence) => {
  const segmentCollection = [];
  const sequenceLength = digitSequence.length;

  if (sequenceLength === 0) {
    return [[]];
  }

  for (let firstSegmentEnd = 1; firstSegmentEnd <= sequenceLength; firstSegmentEnd++) {
    const currentSegmentString = digitSequence.substring(0, firstSegmentEnd);
    const currentSegmentValue = Number(currentSegmentString);
    const remainingSequence = digitSequence.substring(firstSegmentEnd);

    const subSegmentations = segmentCombinations(remainingSequence);

    for (const subSet of subSegmentations) {
      segmentCollection.push([currentSegmentValue, ...subSet]);
    }
  }
  return segmentCollection;
};

const allNumerationSets = segmentCombinations(inputLine);

const setTotals = allNumerationSets.map(numeralSet =>
  numeralSet.reduce((accumulator, currentVal) => accumulator + currentVal, 0)
);

const grandTotal = setTotals.reduce((accumulator, currentTotal) => accumulator + currentTotal, 0);

console.log(grandTotal);