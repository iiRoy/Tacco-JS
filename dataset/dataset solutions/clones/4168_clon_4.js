"use strict";

function processInputAndLog(sourceText){
  const processedCount = sourceText.trim().split('').reduce((accumulator, currentCharacter) => {
    return accumulator + (currentCharacter === '1' ? 1 : 0);
  }, 0);
  console.log(processedCount);
}

processInputAndLog(require('node:fs').readFileSync('/dev/stdin', 'utf8'));
