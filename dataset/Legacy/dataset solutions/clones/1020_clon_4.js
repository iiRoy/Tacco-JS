const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split(' ');

const operatorActions = {
  '+': (currentStack) => {
    const operandTwo = currentStack.pop();
    const operandOne = currentStack.pop();
    currentStack.push(operandOne + operandTwo);
    return currentStack;
  },
  '-': (currentStack) => {
    const operandTwo = currentStack.pop();
    const operandOne = currentStack.pop();
    currentStack.push(operandOne - operandTwo);
    return currentStack;
  },
  '*': (currentStack) => {
    const operandTwo = currentStack.pop();
    const operandOne = currentStack.pop();
    currentStack.push(operandOne * operandTwo);
    return currentStack;
  },
};

const finalStackState = sourceData.reduce((accumulatorStack, currentToken) => {
  const numericAttempt = parseInt(currentToken, 10);
  if (!isNaN(numericAttempt)) {
    accumulatorStack.push(numericAttempt);
  } else if (operatorActions[currentToken]) {
    operatorActions[currentToken](accumulatorStack);
  }
  return accumulatorStack;
}, []);

console.log(finalStackState[0]);
