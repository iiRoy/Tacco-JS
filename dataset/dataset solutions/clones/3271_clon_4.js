"use strict";

function processInput(data) {
  const inputLines = data.split('\n');
  const targetString = inputLines[0];
  const keyword = 'keyence';
  const keywordLength = keyword.length;

  let matchFound = false;

  for (let i = 0; i <= keywordLength; i++) {
    const prefixSegment = keyword.substring(0, i);
    const suffixSegment = keyword.substring(i);

    if (targetString.startsWith(prefixSegment) && targetString.endsWith(suffixSegment)) {
      matchFound = true;
      break;
    }
  }

  if (matchFound) {
    console.log('YES');
  } else {
    console.log('NO');
  }
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));

function parseNumbers(lineContent) {
  return lineContent.split(/\s+/).map(numStr => parseInt(numStr, 10));
}
