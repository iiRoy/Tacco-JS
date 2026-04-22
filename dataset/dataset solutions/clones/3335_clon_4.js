'use strict';
(function(initialData){
  const parsedNumericData = initialData.trim().split(/\s+/).map(currentEntry => parseInt(currentEntry, 10));
  const elementCount = parsedNumericData.shift();
  const numericSequence = parsedNumericData;

  const outcomeMemoization = new Map();

  function calculateScoreDifference(leftPointer, rightPointer) {
    if (leftPointer > rightPointer) {
      return 0;
    }

    const currentRangeKey = `${leftPointer},${rightPointer}`;
    if (outcomeMemoization.has(currentRangeKey)) {
      return outcomeMemoization.get(currentRangeKey);
    }

    const takeLeft = numericSequence[leftPointer] - calculateScoreDifference(leftPointer + 1, rightPointer);
    const takeRight = numericSequence[rightPointer] - calculateScoreDifference(leftPointer, rightPointer - 1);

    const optimalChoiceForCurrentPlayer = Math.max(takeLeft, takeRight);
    outcomeMemoization.set(currentRangeKey, optimalChoiceForCurrentPlayer);
    return optimalChoiceForCurrentPlayer;
  }

  const finalScore = calculateScoreDifference(0, elementCount - 1);

  console.log(finalScore);
})(require('fs').readFileSync('/dev/stdin','utf8'));