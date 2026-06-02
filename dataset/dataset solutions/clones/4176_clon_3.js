'use strict';

function processData(rawInputString) {
  const inputLines = rawInputString.split('\n');

  const firstLineParts = inputLines[0].split(' ');
  const configParams = firstLineParts.map(strVal => Number(strVal));

  const maxIndex = configParams[0];
  const sliceStartIndex = configParams[1];

  const frequencyArraySize = maxIndex + 1;
  const valueFrequencies = Array.from({ length: frequencyArraySize }).fill(0);

  const dataNumbers = inputLines[1].split(' ').map(currentNumStr => Number(currentNumStr));

  const forEachReturnVal = dataNumbers.forEach(val => {
    valueFrequencies[val] += 1;
  });

  const finalSum = forEachReturnVal
    .slice(sliceStartIndex)
    .reduce((accumulator, currentVal) => accumulator + currentVal);

  console.log(finalSum);
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
