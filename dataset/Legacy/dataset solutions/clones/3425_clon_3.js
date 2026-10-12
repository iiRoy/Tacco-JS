'use strict';

const inputDataRaw = require('fs')
  .readFileSync('/dev/stdin', 'utf8')
  .split(/\s/);

const processInput = dataSegments => {
  const TARGET_NUM = 753;

  const getAbsoluteDifference = (value) => {
    return Math.abs(value - TARGET_NUM);
  };

  const inputString = dataSegments[0];
  let threeDigitSubstrings = [];

  const limit = inputString.length - 2;
  for (let idx = 0; idx < limit; idx++) {
    const currentSubstring = inputString.substring(idx, idx + 3);
    const numericValue = Number(currentSubstring);
    threeDigitSubstrings.push(numericValue);
  }

  // If threeDigitSubstrings is empty, reduce will throw an error,
  // which matches the original behavior for inputString.length < 3.
  const closestSubstringValue = threeDigitSubstrings.reduce((currentMinVal, candidateVal) => {
    const diffCurrent = getAbsoluteDifference(currentMinVal);
    const diffCandidate = getAbsoluteDifference(candidateVal);
    return diffCurrent < diffCandidate ? currentMinVal : candidateVal;
  });

  const finalDifference = getAbsoluteDifference(closestSubstringValue);
  console.log(finalDifference);
};

processInput(inputDataRaw);
