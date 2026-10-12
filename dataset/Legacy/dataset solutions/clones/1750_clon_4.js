'use strict';

const rawLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const parseLineNumbers = (lineString) => lineString.split(' ').map(Number);

rawLines.shift();

const initialValues = parseLineNumbers(rawLines.shift());
const valueCounts = initialValues.reduce((accMap, currentVal) => {
    return accMap.set(currentVal, (accMap.get(currentVal) || 0n) + 1n);
}, new Map());

rawLines.shift();

while (rawLines.length > 0) {
  const currentOperation = parseLineNumbers(rawLines.shift());

  const sourceVal = currentOperation[0];
  const targetVal = currentOperation[1];

  if (valueCounts.has(sourceVal) && valueCounts.get(sourceVal) > 0n) {
    const transferAmount = valueCounts.get(sourceVal);

    valueCounts.set(sourceVal, 0n);

    valueCounts.set(targetVal, (valueCounts.get(targetVal) || 0n) + transferAmount);
  }

  console.log(calculateSumOfValues());
}

function calculateSumOfValues() {
  let totalSum = 0;

  for (const [keyVal, countVal] of valueCounts.entries()) {
    if (countVal > 0n) {
      totalSum += keyVal * Number(countVal);
    }
  }
  return totalSum;
}
