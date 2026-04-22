const systemIoInterface = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let accumulatedEntries = [];

systemIoInterface.on('line', (singleEntry) => {
  accumulatedEntries.push(singleEntry);
});

systemIoInterface.on('close', () => {
  accumulatedEntries
    .filter(textSegment => textSegment.trim().length > 0)
    .map(textSegment => Number(textSegment))
    .forEach(numericalComponent => {
      process.stdout.write(deriveCumulativeSum(numericalComponent) + '\n');
    });
});

const deriveCumulativeSum = (originator) => {
  const calculateRecursiveSum = (currentTermValue, stepProgress, runningSummation) => {
    if (stepProgress > 9) {
      return runningSummation;
    }

    let nextTermValue;
    if (stepProgress % 2 === 1) {
      nextTermValue = currentTermValue * 2;
    } else {
      nextTermValue = currentTermValue / 3;
    }

    return calculateRecursiveSum(nextTermValue, stepProgress + 1, runningSummation + nextTermValue);
  };

  return calculateRecursiveSum(originator, 1, originator);
};