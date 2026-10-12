const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericValues = inputContent.trim().split(' ').map(Number);
const firstOperand = numericValues[0];
const secondOperand = numericValues[1];
const thirdOperand = numericValues[2];
const fourthOperand = numericValues[3];
const productOne = firstOperand * secondOperand;
const productTwo = thirdOperand * fourthOperand;
console.log(Math.max(productOne, productTwo));
