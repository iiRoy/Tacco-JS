const parseNumericToken = (tokenString) => {
  const parsedValue = parseInt(tokenString, 10);
  return isNaN(parsedValue) ? tokenString : parsedValue;
};

const expressionTokens = require('fs').readFileSync('/dev/stdin', 'utf8')
  .trim()
  .split(' ')
  .map(parseNumericToken);

const applyBinaryOp = (stack, operationFn) => {
  const secondOperand = stack.pop();
  const firstOperand = stack.pop();
  const result = operationFn(firstOperand, secondOperand);
  stack.push(result);
  return stack;
};

const handleAddition = (stack) => applyBinaryOp(stack, (op1, op2) => op1 + op2);
const handleSubtraction = (stack) => applyBinaryOp(stack, (op1, op2) => op1 - op2);
const handleMultiplication = (stack) => applyBinaryOp(stack, (op1, op2) => op1 * op2);

const operatorHandlers = {
  '+': handleAddition,
  '-': handleSubtraction,
  '*': handleMultiplication,
};

const processOperator = (operatorSymbol, stack) => {
  const handler = operatorHandlers[operatorSymbol];
  if (handler) {
    return handler(stack);
  }
  return stack;
};

const operandStack = [];

expressionTokens.forEach((currentToken) => {
  if (typeof currentToken === 'number') {
    operandStack.push(currentToken);
  } else {
    processOperator(currentToken, operandStack);
  }
});

console.log(operandStack[0]);
