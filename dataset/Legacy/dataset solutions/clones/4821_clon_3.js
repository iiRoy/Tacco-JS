'use strict'

function createDuplicatedLinePair(originalLine) {
  const currentLineText = originalLine;
  return [currentLineText, currentLineText];
}

function processInputData(rawData) {
  const trimmedContent = rawData.trim();
  const allContentLines = trimmedContent.split('\n');

  const startIndex = 1;
  const imageLines = allContentLines.slice(startIndex);

  const finalOutputLines = imageLines.flatMap(createDuplicatedLinePair);

  const outputString = finalOutputLines.join('\n');
  console.log(outputString);
}

const standardInputPath = '/dev/stdin';
const fileContent = require('fs').readFileSync(standardInputPath, 'utf8');
processInputData(fileContent);
