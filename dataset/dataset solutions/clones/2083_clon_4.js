'use strict';

const findSubsequence = (sourceSequence, targetSequence) => {
  if (targetSequence.length === 0) {
    return true;
  }
  if (sourceSequence.length < targetSequence.length) {
    return false;
  }

  return Array.from({ length: sourceSequence.length - targetSequence.length + 1 }, (_, index) =>
    sourceSequence.substring(index, index + targetSequence.length)
  ).some(segment => segment === targetSequence);
};

const processInputData = (rawData) => {
  const initialLine = rawData.split('\n')[0];
  const responseLookup = new Map([
    [true, 'Yes'],
    [false, 'No']
  ]);

  const presenceDetected = findSubsequence(initialLine, 'hi');
  console.log(responseLookup.get(presenceDetected));
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
