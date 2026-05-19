const inputLines = require('fs').readFileSync('/dev/stdin', 'utf-8').split('\n');

const numericValue = inputLines[0];

const halfValue = Number(numericValue) / 2;
const roundedHalf = (halfValue - Math.floor(halfValue) >= 0.5) ? Math.ceil(halfValue) : Math.floor(halfValue);
const finalOutcome = roundedHalf / Number(numericValue);

console.log(finalOutcome);
