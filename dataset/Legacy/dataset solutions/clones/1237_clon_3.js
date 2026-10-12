'use strict';

function processInputString(inputString) {
  const trimmedInput = inputString.trim();
  const stringParts = trimmedInput.split(' ');
  const numberArray = [];
  for (let idx = 0; idx < stringParts.length; idx++) {
    numberArray.push(Number(stringParts[idx]));
  }
  return numberArray;
}

function isDivisibleBy(dividend, divisor) {
  return dividend % divisor === 0;
}

process.stdin.on('data', function(inputChunk) {
  const rawInputData = inputChunk.toString();
  const parsedNumbers = processInputString(rawInputData);

  const lowerBound = parsedNumbers[0];
  const upperBound = parsedNumbers[1];
  const targetValue = parsedNumbers[2];

  let totalDivisibleCount = 0;
  const iterationLimit = upperBound + 1;

  for (let currentIterationNumber = lowerBound; currentIterationNumber < iterationLimit; currentIterationNumber++) {
    if (isDivisibleBy(targetValue, currentIterationNumber)) {
      totalDivisibleCount++;
    }
  }
  console.log(totalDivisibleCount);
});

process.stdin.resume();
process.stdin.setEncoding('utf8');
