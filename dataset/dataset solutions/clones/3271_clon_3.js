"use strict";

function processInput(rawData) {
  const inputLines = rawData.split('\n');
  const targetString = inputLines[0];
  const stringLength = targetString.length;

  const REQUIRED_SEQUENCE = 'keyence';
  let sequenceFound = false;

  for (let startIndex = 0; startIndex < stringLength; startIndex++) {
    for (let endIndex = startIndex; endIndex <= stringLength; endIndex++) {
      const prefixSegment = targetString.slice(0, startIndex);
      const suffixSegment = targetString.slice(endIndex);

      const currentCombination = prefixSegment + suffixSegment;

      if (currentCombination === REQUIRED_SEQUENCE) {
        sequenceFound = true;
        break;
      }
    }
    if (sequenceFound) {
      break;
    }
  }

  if (sequenceFound) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbersFromString(textLine) {
  return textLine.split(/\s+/).map(function (numStr) {
    return Number.parseInt(numStr, 10);
  });
}
