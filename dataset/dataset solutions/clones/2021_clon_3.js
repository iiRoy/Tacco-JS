var inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputValue = parseInt(inputData);

const primaryDivisor = 500;
const primaryMultiplier = 1000;
const secondaryDivisor = 5;
const secondaryMultiplier = 5;

let firstQuotient = Math.floor(inputValue / primaryDivisor);
let firstTermValue = firstQuotient * primaryMultiplier;

let remainderForSecondCalc = inputValue % primaryDivisor;

let secondQuotient = Math.floor(remainderForSecondCalc / secondaryDivisor);
let secondTermValue = secondQuotient * secondaryMultiplier;

let finalResult = firstTermValue + secondTermValue;

console.log(finalResult);
