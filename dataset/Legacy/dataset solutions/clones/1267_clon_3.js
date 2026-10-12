'use strict';
(function(inputSource) {
  const HASH_CHAR = '#';
  const DOT_CHAR = '.';

  function constructAlternatingLine(lineLength, startingChar) {
    const segmentChars = [];
    for (let charIndex = 0; charIndex < lineLength; charIndex++) {
      const currentSegmentChar = (charIndex % 2 === 0) ? startingChar : (startingChar === HASH_CHAR ? DOT_CHAR : HASH_CHAR);
      segmentChars.push(currentSegmentChar);
    }
    return segmentChars.join('');
  }

  function generatePattern(dimensionsArray) {
    const [heightValue, widthValue] = dimensionsArray;

    const topRowTemplate = constructAlternatingLine(widthValue, HASH_CHAR);
    const bottomRowTemplate = constructAlternatingLine(widthValue, DOT_CHAR);

    const patternLines = [];
    for (let rowIndex = 0; rowIndex < heightValue; rowIndex++) {
      const currentLineContent = (rowIndex % 2 === 0) ? topRowTemplate : bottomRowTemplate;
      patternLines.push(currentLineContent);
    }
    return patternLines.join('\n');
  }

  const rawInputLines = inputSource.toString().trim().split('\n');
  const relevantInputData = rawInputLines.slice(0, rawInputLines.indexOf('0 0'));

  const parsedDimensions = relevantInputData.map(function(dimensionString) {
    return dimensionString.split(' ').map(Number);
  });

  const allGeneratedPatterns = parsedDimensions.map(generatePattern);

  const finalCombinedOutput = allGeneratedPatterns.join('\n\n');

  console.log(finalCombinedOutput);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
