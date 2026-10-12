'use strict';

function processInputAndGenerateSequence(sourceData) {
  const parsedValues = sourceData
    .trim()
    .split(' ')
    .map(valStr => Number(valStr));

  const limitVal = parsedValues[0];
  const centerVal = parsedValues[1];

  const sequenceStartValue = centerVal - limitVal + 1;
  const sequenceElementCount = 2 * limitVal - 1;

  const generatedNumbers = Array.from(
    { length: sequenceElementCount },
    (_, currentIdx) => sequenceStartValue + currentIdx
  );

  console.log(generatedNumbers.join(' '));
}

processInputAndGenerateSequence(require('fs').readFileSync('/dev/stdin', 'utf8'));
