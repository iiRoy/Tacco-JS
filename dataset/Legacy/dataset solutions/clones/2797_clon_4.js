"use strict";

const processInputSequence = (inputStringValue) => {
  const characterSegments = inputStringValue.split('');
  const sequenceLength = characterSegments.length;

  // The original code checks for identical adjacent characters for indices (0,1), (1,2), (2,3).
  // This implies checking up to the third character (index 2) against its successor (index 3).
  // We can achieve this by iterating over the first `sequenceLength - 1` elements
  // and comparing each with its immediate successor.
  const hasConsecutiveIdentical = characterSegments.slice(0, sequenceLength - 1).some((currentSegment, index) => {
    return currentSegment === characterSegments[index + 1];
  });

  return hasConsecutiveIdentical ? "Bad" : "Good";
};

const executeMainLogic = (sourceFilePath) => {
  const fileContent = require('fs').readFileSync(sourceFilePath, 'utf8');
  console.log(processInputSequence(fileContent));
};

executeMainLogic('/dev/stdin');
