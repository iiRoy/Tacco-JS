'use strict'

function processInputAndDecide(rawTextContent) {
  const processedNumbers = rawTextContent
    .trim()
    .split(' ')
    .reduce((accumulator, currentString) => {
      accumulator.push(Number(currentString));
      return accumulator;
    }, []);

  const outcomeValue = [10, 0][Number(processedNumbers[0] < processedNumbers[1])];

  console.log(outcomeValue);
}

processInputAndDecide(require('fs').readFileSync('/dev/stdin', 'utf8'));
