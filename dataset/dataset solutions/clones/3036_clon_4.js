'use strict';

function processInputData(rawData) {
  const parsedLines = rawData.trim().split('\n');

  const numericValue = Number(parsedLines[0]); // Corresponds to N, but is unused in the original logic
  const characterSequence = parsedLines[1];
  const targetPosition = Number(parsedLines[2]);

  const keyCharacter = characterSequence[targetPosition];

  const outputSegments = [];
  for (const currentCharacter of characterSequence) {
    if (currentCharacter === keyCharacter) {
      outputSegments.push(keyCharacter);
    } else {
      outputSegments.push('*');
    }
  }

  const finalRender = outputSegments.join('');
  console.log(finalRender);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
