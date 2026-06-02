'use strict';

let expressionTokens = require('fs').readFileSync('/dev/stdin', 'utf8');
expressionTokens = expressionTokens.trim().split(' ');

const operandStack = [];

for (let idx = 0; idx < expressionTokens.length; ++idx) {
  const currentToken = expressionTokens[idx];
  switch (currentToken) {
    case '+': {
      const val1 = operandStack.pop();
      const val2 = operandStack.pop();
      operandStack.push(val1 + val2);
      break;
    }
    case '-': {
      const subtrahend = operandStack.pop();
      const minuend = operandStack.pop();
      operandStack.push(minuend - subtrahend);
      break;
    }
    case '*': {
      const factor1 = operandStack.pop();
      const factor2 = operandStack.pop();
      operandStack.push(factor1 * factor2);
      break;
    }
    default:
      const numericValue = Number(currentToken);
      operandStack.push(numericValue);
      break;
  }
}

console.log(operandStack[0]);
