'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

process.stdin.on('data', function(dataChunk) {
  inputBuffer += dataChunk;
});

function parseInputArray(rawInputString) {
  const rawInputTokens = rawInputString.split(/\s+/);
  const relevantTokens = rawInputTokens.slice(1, rawInputTokens.length - 1);
  const numericArray = relevantTokens.map(numericString => parseInt(numericString, 10));
  return numericArray;
}

function calculateCumulativeMinSum(initialSequence) {
  let overallSum = 0;
  let currentSequence = [...initialSequence];

  while (currentSequence.length > 0) {
    let currentSequenceLength = currentSequence.length;
    
    for (let i = 0; i < currentSequenceLength; i++) {
      overallSum += currentSequence[i];
    }

    if (currentSequenceLength === 1) {
      currentSequence = [];
      continue;
    }

    let nextSequence = [];
    for (let i = 1; i < currentSequenceLength; i++) {
      const previousValue = currentSequence[i - 1];
      const currentValue = currentSequence[i];
      nextSequence.push(Math.min(previousValue, currentValue));
    }
    currentSequence = nextSequence;
  }
  return overallSum;
}

process.stdin.on('end', function() {
  const processedNumbers = parseInputArray(inputBuffer);
  console.log(calculateCumulativeMinSum(processedNumbers));
  process.exit(0);
});
