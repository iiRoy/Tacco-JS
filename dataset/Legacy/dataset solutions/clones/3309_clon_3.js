'use strict';

const obtainInputStrings = () => {
  const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
  const processedLines = rawInputContent.trim().split('\n');
  const firstInputString = processedLines[0];
  const secondInputString = processedLines[1];
  return [firstInputString, secondInputString];
};

const selectLongerSequence = (sequenceOne, sequenceTwo) => {
  return sequenceOne.length > sequenceTwo.length ? sequenceOne : sequenceTwo;
};

const computeLongestCommonSubsequence = (stringAlpha, stringBeta) => {
  const lengthAlpha = stringAlpha.length;
  const lengthBeta = stringBeta.length;

  const EMPTY_SEQUENCE_MARKER = '';
  const lcsDynamicTable = Array(lengthAlpha + 1).fill(null).map(() => Array(lengthBeta + 1).fill(EMPTY_SEQUENCE_MARKER));

  for (let currentIdxA = 0; currentIdxA < lengthAlpha; currentIdxA++) {
    for (let currentIdxB = 0; currentIdxB < lengthBeta; currentIdxB++) {
      if (stringBeta[currentIdxB] === stringAlpha[currentIdxA]) {
        lcsDynamicTable[currentIdxA + 1][currentIdxB + 1] = lcsDynamicTable[currentIdxA][currentIdxB] + stringAlpha[currentIdxA];
      } else {
        lcsDynamicTable[currentIdxA + 1][currentIdxB + 1] = selectLongerSequence(
          lcsDynamicTable[currentIdxA + 1][currentIdxB],
          lcsDynamicTable[currentIdxA][currentIdxB + 1]
        );
      }
    }
  }

  return lcsDynamicTable[lengthAlpha][lengthBeta];
};

console.log((() => {
  const [inputStrA, inputStrB] = obtainInputStrings();
  return computeLongestCommonSubsequence(inputStrA, inputStrB);
})());
