const productCalc = (...operands) => operands.reduce((acc, curr) => acc * curr, 1);

const sumDoubleCalc = (valOne, valTwo) => valOne * 2 + valTwo * 2;

let inputA = 10;
let inputB = 5;

console.log(productCalc(inputA, inputB), sumDoubleCalc(inputA, inputB));
