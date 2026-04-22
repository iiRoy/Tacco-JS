'use strict';
const displayOutcome = (dataPiece) => console.log(dataPiece);

function processChallenge(rawInputData) {
  const dataLines = rawInputData.split('\n');

  const limitValue = parseInt(dataLines[0].split(' ')[0], 10);
  const sourceNumbers = dataLines[1].split(' ').map(Number);

  const temporaryTally = sourceNumbers.reduce((accumulator, currentNumber) => {
    if (currentNumber >= 1 && currentNumber <= limitValue) {
      accumulator[currentNumber] = (accumulator[currentNumber] || 0) + 1;
    }
    return accumulator;
  }, {});

  const finalFrequencies = Array.from({ length: limitValue }, (_, index) => {
    const currentKey = index + 1;
    return temporaryTally[currentKey] || 0;
  });

  finalFrequencies.forEach(displayOutcome);
}

processChallenge(require("fs").readFileSync("/dev/stdin", "utf8"));