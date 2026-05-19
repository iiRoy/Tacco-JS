"use strict";

function processInputData(rawData) {
  const cleanedInputString = rawData.trim();
  const characterSequence = cleanedInputString.split('');

  let oneCharacterCount = 0;
  const targetCharacter = '1';

  for (const currentCharacter of characterSequence) {
    if (currentCharacter === targetCharacter) {
      oneCharacterCount++;
    }
  }

  console.log(oneCharacterCount);
}

const fsModule = require('fs');
const stdinPath = '/dev/stdin';
const utf8Encoding = 'utf8';

const inputBuffer = fsModule.readFileSync(stdinPath, utf8Encoding);
processInputData(inputBuffer);
