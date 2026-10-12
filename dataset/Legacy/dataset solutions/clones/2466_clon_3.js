const ioHandler = require('readline');
const inputOutputInterface = ioHandler.createInterface({
  input: process.stdin,
  output: process.stdout
});

let dataBuffer = [];

const MAX_OPERAND_VALUE = 9;

const isOperandValid = (operandValue) => {
  return operandValue <= MAX_OPERAND_VALUE;
};

const parseInputLine = (inputString) => {
  return inputString.split(' ').map((elementString) => parseInt(elementString, 10));
};

const computeProduct = (numericInputs) => {
  const firstOperand = numericInputs[0];
  const secondOperand = numericInputs[1];

  const isValidFirst = isOperandValid(firstOperand);
  const isValidSecond = isOperandValid(secondOperand);

  if (!isValidFirst || !isValidSecond) {
    return -1;
  }
  return firstOperand * secondOperand;
};

inputOutputInterface.on('line', function (inputLine) {
    dataBuffer = parseInputLine(inputLine);
  })
  .on('close', function () {
    console.log(computeProduct(dataBuffer));

    process.exit();
  });
