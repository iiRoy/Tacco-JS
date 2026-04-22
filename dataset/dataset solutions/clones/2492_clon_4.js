const { readFileSync: retrieveData } = require('node:fs');

const presentOutput = (value) => process.stdout.write(String(value) + '\n');

const acquireInput = () => retrieveData('/dev/stdin', 'utf8').trim();

const computeProductSum = () => {
  const initialLoad = acquireInput();
  const dataLines = initialLoad.split('\n');

  const elementCount = parseInt(dataLines[0], 10);
  const numericSequence = dataLines[1].split(' ').map(Number);

  const totalSum = numericSequence.reduce((accumulator, currentVal) => accumulator + currentVal, 0);
  const sumOfSquares = numericSequence.reduce((accumulator, currentVal) => accumulator + (currentVal * currentVal), 0);

  const squaredTotal = totalSum * totalSum;
  const difference = squaredTotal - sumOfSquares;
  const finalProductSum = difference / 2;

  presentOutput(finalProductSum);
};

computeProductSum();