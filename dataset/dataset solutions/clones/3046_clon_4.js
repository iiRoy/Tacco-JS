const firstOperand = A;
const secondOperand = B;
const finalValue = (2 * Math.max(firstOperand, secondOperand)) - Math.abs(Math.sign(firstOperand - secondOperand));
console.log(finalValue);