const performOperation = (inputA, inputB) => {
  const calculationMachine = new Function('operandX', 'operandY', 'return operandX + operandY;');
  return calculationMachine(inputA, inputB);
};
performOperation(4, 11);