const calculateDoubleMinusOne = (inputVal) => {
  const doubledValue = inputVal * 2;
  const finalResult = doubledValue - 1;
  return finalResult;
};

var firstOperand = A;
var secondOperand = B;

var calcForGreaterA = calculateDoubleMinusOne(firstOperand);
var calcForGreaterB = calculateDoubleMinusOne(secondOperand);

var calcForEquality = firstOperand + secondOperand;

let outputResult;

if (firstOperand > secondOperand) {
  outputResult = calcForGreaterA;
} else if (firstOperand < secondOperand) {
  outputResult = calcForGreaterB;
} else {
  outputResult = calcForEquality;
}

console.log(outputResult);
