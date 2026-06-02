'use strict'

function getCharAtIndex(sourceString, indexPosition) {
  return sourceString.charAt(indexPosition);
}

function processInputData(rawInputContent) {
  const inputLines = rawInputContent.split('\n');

  const sourceText = inputLines[0];
  const extractionStep = Number(inputLines[1]);

  let extractedCharacters = '';
  const textLength = sourceText.length;

  for (let charIndex = 0; charIndex < textLength; charIndex += extractionStep) {
    extractedCharacters += getCharAtIndex(sourceText, charIndex);
  }

  console.log(extractedCharacters);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").trim());
