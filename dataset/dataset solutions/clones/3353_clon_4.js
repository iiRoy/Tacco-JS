'use strict';

function computeMaxScore(itemCount, heights, values) {
  const memoizedScores = new Array(itemCount).fill(null);
  let overallHighestScore = 0;

  function computeSegmentScore(currentElementIndex) {
    if (memoizedScores[currentElementIndex] !== null) {
      return memoizedScores[currentElementIndex];
    }

    let currentElementBaseValue = values[currentElementIndex];
    let maxPreviousChainContribution = 0;

    for (let previousElementIndex = 0; previousElementIndex < currentElementIndex; previousElementIndex++) {
      if (heights[currentElementIndex] > heights[previousElementIndex]) {
        maxPreviousChainContribution = Math.max(
          maxPreviousChainContribution,
          computeSegmentScore(previousElementIndex)
        );
      }
    }

    const finalScoreForThisElement = currentElementBaseValue + maxPreviousChainContribution;
    memoizedScores[currentElementIndex] = finalScoreForThisElement;
    return finalScoreForThisElement;
  }

  for (let idx = 0; idx < itemCount; idx++) {
    const scoreEndingAtIndex = computeSegmentScore(idx);
    overallHighestScore = Math.max(overallHighestScore, scoreEndingAtIndex);
  }

  return overallHighestScore;
}

function processInputData(rawData) {
  const inputLines = rawData.split("\n");
  const countElements = parseInt(inputLines[0]);
  const elementHeights = inputLines[1].split(' ').map(valStr => parseInt(valStr));
  const elementValues = inputLines[2].split(' ').map(valStr => parseInt(valStr));

  const finalResult = computeMaxScore(countElements, elementHeights, elementValues);
  console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
