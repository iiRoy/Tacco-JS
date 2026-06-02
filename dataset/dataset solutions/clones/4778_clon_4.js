'use strict';

function processInputAndCalculate(rawData) {
  const numericParts = rawData
    .trim()
    .split(' ')
    .map(valStr => parseInt(valStr, 10));

  const upperLimit = numericParts[0];
  const desiredSum = numericParts[1];

  const totalCombinations = Array.from({ length: upperLimit + 1 }, (_, firstTerm) => firstTerm)
    .reduce((accumulator, firstTerm) => {
      return accumulator + Array.from({ length: upperLimit + 1 }, (_, secondTerm) => secondTerm)
        .filter(secondTerm => {
          const thirdTerm = desiredSum - (firstTerm + secondTerm);
          return thirdTerm >= 0 && thirdTerm <= upperLimit;
        }).length;
    }, 0);

  console.log(totalCombinations);
}

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
