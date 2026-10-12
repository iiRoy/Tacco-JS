const sourceData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = sourceData.split('\n');

const numericValues = dataRows.slice(0, 5).map(Number);

const firstSetMinimum = numericValues.slice(0, 3).reduce((currentMin, value) => Math.min(currentMin, value), Infinity);
const secondSetMinimum = numericValues.slice(3, 5).reduce((currentMin, value) => Math.min(currentMin, value), Infinity);

console.log(firstSetMinimum + secondSetMinimum);
