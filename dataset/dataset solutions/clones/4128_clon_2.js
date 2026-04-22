'use strict';
console.log(function (inputData) {
  const processedLines = inputData
    .trim()
    .split('\n')
    .map(lineStr => lineStr.split(' ').map(numStr => numStr | 0));

  const queryCount = processedLines.shift()[0];

  const upperLimit = 50000;

  const sieveArray = Array(upperLimit).fill(1);
  const prefixSums = Array(upperLimit + 1).fill(0);

  sieveArray[0] = 0;
  sieveArray[1] = 1;
  prefixSums[0] = prefixSums[1] = 0;
  prefixSums[2] = 1;

  for (let idx = 1; idx < upperLimit; idx++) {
    if (!sieveArray[idx]) {
      continue;
    }
    const stepVal = 2 * idx + 1;

    if ((~idx & 1) && sieveArray[idx / 2]) {
      prefixSums[idx + 1] = 1;
    }

    for (let innerIdx = idx + stepVal; innerIdx < upperLimit; innerIdx = innerIdx + stepVal) {
      sieveArray[innerIdx] = 0;
    }
  }

  for (let idx = 2; idx < upperLimit; idx++) {
    prefixSums[idx] += prefixSums[idx - 1];
  }

  let outputValues = [];

  for (let idx = 0; idx < queryCount; idx++) {
    const leftBound = (processedLines[idx][0] - 1) / 2;
    const rightBound = (processedLines[idx][1] - 1) / 2 + 1;
    outputValues.push(prefixSums[rightBound] - prefixSums[leftBound]);
  }
  return outputValues.join('\n');
}(require('fs').readFileSync('/dev/stdin', 'utf8')));