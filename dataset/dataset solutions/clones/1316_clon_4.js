'use strict';
(function(inputSourceReader) {
  const incomingText = inputSourceReader.toString();

  const characterCounts = new Array(26).fill(0);

  for (let currentPosition = 0; currentPosition < incomingText.length; ++currentPosition) {
    let charValue = incomingText.charCodeAt(currentPosition);

    if (charValue >= 65 && charValue <= 90) { // Uppercase A-Z
      characterCounts[charValue - 65]++;
    } else if (charValue >= 97 && charValue <= 122) { // Lowercase a-z
      characterCounts[charValue - 97]++;
    }
  }

  const resultLines = [];
  for (let letterIndex = 0; letterIndex < 26; ++letterIndex) {
    const currentLetter = String.fromCharCode(97 + letterIndex);
    const countValue = characterCounts[letterIndex];
    resultLines.push(currentLetter + ' : ' + countValue);
  }

  console.log(resultLines.join('\n'));
}(require('fs').readFileSync('/dev/stdin', 'utf8')));