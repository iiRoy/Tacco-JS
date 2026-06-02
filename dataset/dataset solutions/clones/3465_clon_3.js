'use strict'

const getReversedString = (inputString) => {
  const characters = inputString.split('');
  const reversedCharacters = characters.reverse();
  const finalReversed = reversedCharacters.join('');
  return finalReversed;
};

const executeMainLogic = (rawData) => {
  const linesOfInput = rawData.split('\n');
  const primaryTargetString = linesOfInput[0];

  const expectedLengthForDirectOutput = 2;
  const currentStringLength = primaryTargetString.length;

  let resultToDisplay;

  if (currentStringLength === expectedLengthForDirectOutput) {
    resultToDisplay = primaryTargetString;
  } else {
    resultToDisplay = getReversedString(primaryTargetString);
  }
  
  console.log(resultToDisplay);
};

const fileSystemUtility = require('fs');
const standardInputSource = '/dev/stdin';
const fileEncoding = 'utf8';

const fileContents = fileSystemUtility.readFileSync(standardInputSource, fileEncoding);
executeMainLogic(fileContents);
