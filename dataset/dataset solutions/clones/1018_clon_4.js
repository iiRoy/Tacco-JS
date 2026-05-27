'use strict';

let rawExpression = require('fs').readFileSync('/dev/stdin', 'utf8');
rawExpression = rawExpression.trim().split(' ');

const operationRegistry = {
  '+': (operandStore) => {
    const secondOperand = operandStore.pop();
    const firstOperand = operandStore.pop();
    operandStore.push(firstOperand + secondOperand);
  },
  '-': (operandStore) => {
    // Original: stack.push(-stack.pop() + stack.pop());
    // This evaluates to (second_popped_value - first_popped_value)
    const firstPopped = operandStore.pop();
    const secondPopped = operandStore.pop();
    operandStore.push(secondPopped - firstPopped);
  },
  '*': (operandStore) => {
    const secondOperand = operandStore.pop();
    const firstOperand = operandStore.pop();
    operandStore.push(firstOperand * secondOperand);
  },
};

const finalOperandStore = rawExpression.reduce((currentOperandStore, currentToken) => {
  const operationExecutor = operationRegistry[currentToken];
  if (operationExecutor) {
    operationExecutor(currentOperandStore);
  } else {
    currentOperandStore.push(Number(currentToken));
  }
  return currentOperandStore;
}, []);

console.log(finalOperandStore[0]);
