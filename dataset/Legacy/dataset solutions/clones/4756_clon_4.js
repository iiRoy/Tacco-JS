const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericValues = fileContent.split(' ').map(Number);
const [n1, n2, n3, n4] = numericValues;
const products = [n1 * n2, n3 * n4];
const finalOutcome = products.reduce((accumulator, currentValue) => Math.max(accumulator, currentValue));
console.log(finalOutcome);
