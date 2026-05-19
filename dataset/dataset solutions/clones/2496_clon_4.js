'use strict'

const processInputData = (sourceContent) => {
  const structuredData = sourceContent.split('\n').map(lineSegment => lineSegment.split(' '));
  const seriesLength = parseInt(structuredData[0][0], 10); // This variable is parsed but not directly used in the functional approach, as the string length implicitly defines iteration.
  const characterSeries = structuredData[1][0];

  const finalTally = characterSeries.split('').reduce((accumulatorState, currentSymbol) => {
    if (accumulatorState.lastObservedSymbol !== currentSymbol) {
      accumulatorState.distinctBlockCount++;
    }
    accumulatorState.lastObservedSymbol = currentSymbol;
    return accumulatorState;
  }, { distinctBlockCount: 0, lastObservedSymbol: null });

  console.log(finalTally.distinctBlockCount);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
