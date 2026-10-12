const processInputs = (firstOperand, secondOperand) => {
  const comparisonIndicator = Math.sign(firstOperand - secondOperand);

  const operationMap = {
    '1': (op1, op2) => op1 * 2 - 1,
    '-1': (op1, op2) => op2 * 2 - 1,
    '0': (op1, op2) => op1 + op2
  };

  return operationMap[comparisonIndicator.toString()](firstOperand, secondOperand);
};

console.log(processInputs(A, B));
