const filesystemOperations = require('node:fs');

const standardInputLocation = '/dev/stdin';
const rawInputText = filesystemOperations.readFileSync(standardInputLocation, 'utf8');

const textLines = rawInputText.split('\n');
const numericStringRow = textLines[1];

const separatedValues = numericStringRow
  .split(' ')
  .filter(val => val !== '');

const cumulativeInverse = separatedValues.reduce((totalAggregator, elementItem) => {
  const currentNumber = Number(elementItem);
  return totalAggregator + (1 / currentNumber);
}, 0);

const ultimateOutcome = 1 / cumulativeInverse;

console.log(ultimateOutcome);