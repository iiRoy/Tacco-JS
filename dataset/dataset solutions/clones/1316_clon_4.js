'use strict';
(function(sourceData) {
  const rawData = sourceData.toString();

  const charTally = Array(26).fill(0);

  for (const currentSymbol of rawData) {
    const currentCode = currentSymbol.charCodeAt(0);
    let letterIndex = -1;

    if (currentCode >= 65 && currentCode <= 90) {
      letterIndex = currentCode - 65;
    } else if (currentCode >= 97 && currentCode <= 122) {
      letterIndex = currentCode - 97;
    }

    if (letterIndex !== -1) {
      charTally[letterIndex]++;
    }
  }

  const outputSegments = [];
  for (let i = 0; i < 26; i++) {
    const currentLetter = String.fromCharCode(97 + i);
    outputSegments.push(`${currentLetter} : ${charTally[i]}`);
  }

  const finalReport = outputSegments.join('\n');

  console.log(finalReport);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
