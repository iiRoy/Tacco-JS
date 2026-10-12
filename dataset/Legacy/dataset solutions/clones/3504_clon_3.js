'use strict'

function getSwappedDigit(originalDigit) {
  const DIGIT_ONE_CHAR = '1';
  const DIGIT_NINE_CHAR = '9';
  let resultingDigit;

  if (originalDigit === DIGIT_ONE_CHAR) {
    resultingDigit = DIGIT_NINE_CHAR;
  } else {
    resultingDigit = DIGIT_ONE_CHAR;
  }
  return resultingDigit;
}

function processInput(rawData) {
  let finalOutput = '';
  const charSequence = rawData.split('');
  const sequenceLength = charSequence.length;

  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const currentDigit = charSequence[currentIndex];
    finalOutput += getSwappedDigit(currentDigit);
  }
  console.log(finalOutput);
}

const fileSystemModule = require('fs');
const standardInputPath = '/dev/stdin';
const encodingFormat = 'utf8';

const inputContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
processInput(inputContent);
