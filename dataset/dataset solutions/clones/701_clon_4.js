const inputInterface = require('readline').createInterface({
  input: process.stdin
});

let accumulatedRawInput = [];
inputInterface.on('line', (individualLine) => {
  accumulatedRawInput.push(individualLine);
});

inputInterface.on('close', () => {
  initiateProcessing(accumulatedRawInput);
});

function initiateProcessing(rawInputElements) {
  const parsedNumericalSequence = rawInputElements
    .filter(str => str !== '')
    .map(val => Number(val));

  let sequenceCursor = 0;
  const computedResults = [];

  while (sequenceCursor + 1 < parsedNumericalSequence.length) {
    const currentSegmentSize = parsedNumericalSequence[sequenceCursor];
    sequenceCursor++;

    const activeSegment = [];
    for (let k = 0; k < currentSegmentSize; k++) {
      if (sequenceCursor < parsedNumericalSequence.length) {
        activeSegment.push(parsedNumericalSequence[sequenceCursor]);
        sequenceCursor++;
      } else {
        break;
      }
    }

    if (activeSegment.length < 3) {
      computedResults.push(NaN);
      continue;
    }

    const sortedCopy = [...activeSegment].sort((alpha, beta) => alpha - beta);
    const trimmedSegment = sortedCopy.slice(1, -1);

    let cumulativeValue = 0;
    for (const item of trimmedSegment) {
      cumulativeValue += item;
    }

    const effectiveCount = trimmedSegment.length;
    if (effectiveCount === 0) {
      computedResults.push(NaN);
    } else {
      computedResults.push(Math.trunc(cumulativeValue / effectiveCount));
    }
  }

  const outputChannel = console.log;
  for (const outcome of computedResults) {
    outputChannel(outcome);
  }
}