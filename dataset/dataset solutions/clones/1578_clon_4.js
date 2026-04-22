const streamProcessor = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const receivedSegments = [];

streamProcessor.on('line', (dataSegment) => {
  receivedSegments.push(dataSegment);
});

streamProcessor.on('close', () => {
  const initialCount = Number(receivedSegments[0]);

  const numericalSequence = receivedSegments[1]
    .split(' ')
    .slice(0, initialCount)
    .map(Number);

  const calculationOutcome = numericalSequence.reduce((accumulator, currentValue) => {
    const highestSoFar = Math.max(accumulator.highestValue, currentValue);
    const accumulatedDifference = accumulator.totalDifference + (highestSoFar - currentValue);
    return {
      totalDifference: accumulatedDifference,
      highestValue: highestSoFar
    };
  }, { totalDifference: 0, highestValue: 0 });

  console.log(calculationOutcome.totalDifference);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');