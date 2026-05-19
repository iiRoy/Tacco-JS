'use strict';

function processInput(rawData) {
  const processedLines = rawData.trim().split('\n');

  const countN = Number(processedLines[0]);
  const charArray = processedLines[1].split('');
  const targetIndexString = processedLines[2];

  const targetIndex = Number(targetIndexString);

  const targetChar = charArray[targetIndex];

  const replacementMarker = '*';

  const transformedChars = charArray.map(function(currentChar) {
    if (currentChar === targetChar) {
      return targetChar;
    } else {
      return replacementMarker;
    }
  });

  const finalResultString = transformedChars.join('');

  console.log(finalResultString);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
