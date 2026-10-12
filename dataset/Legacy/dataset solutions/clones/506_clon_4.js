const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericValues = fileContent
  .trim()
  .split('\n')
  .map(val => Number(val));

const totalAccumulation = numericValues
  .slice(0, 10)
  .reduce((currentSum, currentVal) => currentSum + currentVal, 0);

console.log(totalAccumulation);
