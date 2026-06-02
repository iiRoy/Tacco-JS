const fileSystem = require('fs');

const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.split('\n');

const limitValue = Number(inputLines.shift());

const initialSummation = Array.from({ length: limitValue }, (_, index) => index + 1)
  .reduce((accumulated, currentNumber) => accumulated + (currentNumber * (currentNumber + 1) / 2), 0);

const subtractedTotal = inputLines
  .filter(lineEntry => lineEntry.trim() !== '')
  .map(lineEntry => {
    const numericParts = lineEntry.split(' ').map(Number);
    const firstCoordinate = Math.min(numericParts[0], numericParts[1]);
    const secondCoordinate = Math.max(numericParts[0], numericParts[1]);
    return { firstCoordinate, secondCoordinate };
  })
  .reduce((totalReduction, { firstCoordinate, secondCoordinate }) => {
    return totalReduction + (firstCoordinate * (limitValue - secondCoordinate + 1));
  }, 0);

console.log(initialSummation - subtractedTotal);
