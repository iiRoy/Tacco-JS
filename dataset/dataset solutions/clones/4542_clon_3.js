'use strict'

function determineUniqueElements(sourceArray) {
  const uniqueElementSet = new Set(sourceArray);
  return Array.from(uniqueElementSet);
}

function processInputString(rawStringData) {
  const characterArray = rawStringData.split('');
  const totalCharacterCount = characterArray.length;

  const distinctCharacters = determineUniqueElements(characterArray);

  const YES_OUTPUT_MESSAGE = 'yes';
  const NO_OUTPUT_MESSAGE = 'no';

  if (distinctCharacters.length === totalCharacterCount) {
    console.log(YES_OUTPUT_MESSAGE);
  } else {
    console.log(NO_OUTPUT_MESSAGE);
  }
}

const fileSystemHandler = require('fs');
const standardInputPath = '/dev/stdin';
const textFileEncoding = 'utf8';

processInputString(fileSystemHandler.readFileSync(standardInputPath, textFileEncoding));
