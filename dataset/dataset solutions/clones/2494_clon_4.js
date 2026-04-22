'use strict';
function processInputData(dataSource) {
  const lineSegments = dataSource.split('\n');
  const quantityIndicator = Number(lineSegments[0]);
  const fullItemCollection = lineSegments[1].split(' ');

  const relevantItemCollection = fullItemCollection.slice(0, quantityIndicator);

  const compactedSequence = relevantItemCollection.reduce((accumulatorArray, currentItem) => {
    if (accumulatorArray.length === 0 || accumulatorArray[accumulatorArray.length - 1] !== currentItem) {
      accumulatorArray.push(currentItem);
    }
    return accumulatorArray;
  }, []);

  const distinctRunCount = compactedSequence.length;
  console.log(distinctRunCount);
}

function executeProgram() {
  const rawSource = require('fs').readFileSync('/dev/stdin', 'utf8');
  processInputData(rawSource);
}

executeProgram();