const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = sourceData.split('\n');
const numericValue = Number(dataRows.shift());

const baseCalculation = Math.floor(numericValue / 11) * 2;
const remainderValue = numericValue % 11;

const adjustment = Math.min(2, Math.ceil(remainderValue / 6));

const finalResult = baseCalculation + adjustment;

console.log(finalResult);
