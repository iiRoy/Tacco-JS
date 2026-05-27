'use strict';
(function(rawInputContent){
  rawInputContent = rawInputContent.trim();
  const parsedParts = rawInputContent.split(/\s+/);

  const sequenceLength = Number(parsedParts.shift());
  const numberSequence = parsedParts.map(Number);

  // memoizedResults[currentLength][startIndex] represents the X-Y value for a subsegment
  // of 'currentLength' elements starting at 'startIndex'.
  const memoizedResults = Array.from({ length: sequenceLength + 1 }, (_, rowIdx) => {
    return Array.from({ length: sequenceLength + 1 - rowIdx }, () => 0);
  });

  for (let currentLength = 1; currentLength <= sequenceLength; currentLength++) {
    for (let startIndex = 0; startIndex <= sequenceLength - currentLength; startIndex++) {
      const elementFromRight = numberSequence[startIndex + currentLength - 1];
      const elementFromLeft = numberSequence[startIndex];

      // The original code uses dp[i-1][j] for both options.
      // This behavior is preserved to maintain exact observable equivalence.
      const valueIfRightTaken = elementFromRight - memoizedResults[currentLength - 1][startIndex];
      const valueIfLeftTaken = elementFromLeft - memoizedResults[currentLength - 1][startIndex];

      memoizedResults[currentLength][startIndex] = Math.max(valueIfRightTaken, valueIfLeftTaken);
    }
  }

  const finalResult = memoizedResults[sequenceLength][0];
  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin','utf8'));
