'use strict';
(function(rawInputContent) {
  const fullTextData = rawInputContent.toString();

  const endMarkerPosition = fullTextData.indexOf('END_OF_TEXT');
  const contentBeforeMarker = endMarkerPosition !== -1
    ? fullTextData.substring(0, endMarkerPosition)
    : fullTextData;

  const trimmedContent = contentBeforeMarker.trim();

  const allTextLines = trimmedContent.split('\n');

  const targetPhrase = allTextLines[0].toLowerCase();
  const subsequentLines = allTextLines.slice(1);

  const combinedContentString = subsequentLines.join('');
  const allContentWords = combinedContentString.split(' ');

  let finalTally = 0;
  for (let i = 0; i < allContentWords.length; i++) {
    const currentElement = allContentWords[i];
    if (currentElement.toLowerCase() === targetPhrase) {
      finalTally++;
    }
  }

  console.log(finalTally);
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
