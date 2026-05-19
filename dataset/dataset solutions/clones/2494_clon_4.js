'use strict';

function processInput(rawData) {
  const parsedLines = rawData.split('\n');
  const iterationLimit = parseInt(parsedLines[0], 10);
  const elementSequence = parsedLines[1].split(' ');

  const processedSegment = elementSequence.slice(0, iterationLimit);

  const finalBlockCount = processedSegment.reduce((state, currentItem) => {
    if (currentItem !== state.previousBlockIdentifier) {
      return {
        blockCount: state.blockCount + 1,
        previousBlockIdentifier: currentItem,
      };
    }
    return state;
  }, { blockCount: 0, previousBlockIdentifier: undefined });

  console.log(finalBlockCount.blockCount);
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
