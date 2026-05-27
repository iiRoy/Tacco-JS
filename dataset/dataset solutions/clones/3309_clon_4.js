'use strict';

function processInputAndFindLCS(sourceData) {
  const contentLines = sourceData.trim().split('\n');
  const firstSequence = contentLines[0];
  const secondSequence = contentLines[1];

  const firstLen = firstSequence.length;
  const secondLen = secondSequence.length;

  const lookupTable = Array(firstLen + 1).fill(null).map(() => Array(secondLen + 1).fill(null));

  function calculateLCS(currentIdxA, currentIdxB) {
    if (currentIdxA === 0 || currentIdxB === 0) {
      return '';
    }

    if (lookupTable[currentIdxA][currentIdxB] !== null) {
      return lookupTable[currentIdxA][currentIdxB];
    }

    if (firstSequence[currentIdxA - 1] === secondSequence[currentIdxB - 1]) {
      lookupTable[currentIdxA][currentIdxB] = calculateLCS(currentIdxA - 1, currentIdxB - 1) + firstSequence[currentIdxA - 1];
    } else {
      const pathOne = calculateLCS(currentIdxA - 1, currentIdxB);
      const pathTwo = calculateLCS(currentIdxA, currentIdxB - 1);
      lookupTable[currentIdxA][currentIdxB] = pathOne.length > pathTwo.length ? pathOne : pathTwo;
    }

    return lookupTable[currentIdxA][currentIdxB];
  }

  return calculateLCS(firstLen, secondLen);
}

console.log(processInputAndFindLCS(require('fs').readFileSync('/dev/stdin', 'utf8')));
