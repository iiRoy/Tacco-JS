'use strict';

function createTokenParser(patternToMatch) {
  const matchLength = patternToMatch.length;

  const performSegmentCheck = (sourceString, startIndex) => {
    const endIndex = startIndex + matchLength;
    const currentSegment = sourceString.slice(startIndex, endIndex);
    return currentSegment === patternToMatch;
  };

  return (inputData, currentOffset) => {
    if (currentOffset + matchLength > inputData.length) {
      return [false, null, currentOffset];
    }

    const isMatchSuccessful = performSegmentCheck(inputData, currentOffset);

    if (isMatchSuccessful) {
      const newPositionAfterMatch = currentOffset + matchLength;
      return [true, patternToMatch, newPositionAfterMatch];
    } else {
      return [false, null, currentOffset];
    }
  };
}
