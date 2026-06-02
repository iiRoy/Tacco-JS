const fileSystem = require('fs');

const processedInitialData = fileSystem.readFileSync('/dev/stdin', 'utf8').trim().split(' ').map((itemStr) => {
  const parsedVal = parseInt(itemStr, 10);
  if (!isNaN(parsedVal)) {
    return parsedVal;
  } else {
    return itemStr;
  }
});

const isOperable = (operandA, operandB, operatorSymbol) => {
  return typeof operandA === 'number' && typeof operandB === 'number' && typeof operatorSymbol === 'string';
};

function executeOperation(operandA, operandB, operatorSymbol) {
  const operatorMap = {
    '+': (x, y) => x + y,
    '-': (x, y) => x - y,
    '*': (x, y) => x * y,
  };
  const operationFunction = operatorMap[operatorSymbol];
  if (operationFunction) {
    return operationFunction(operandA, operandB);
  }
  return undefined;
}

function reinsertOperands(targetArray, opA, opB, opSym) {
  if (typeof opSym !== 'undefined') {
    targetArray.push(opSym);
  }
  if (typeof opB !== 'undefined') {
    targetArray.push(opB);
  }
  if (typeof opA !== 'undefined') {
    targetArray.push(opA);
  }
}

function processExpression(currentExpression) {
  const expressionLength = currentExpression.length;

  if (expressionLength === 1) {
    console.log(currentExpression[0]);
    return;
  }

  const nextExpressionSegment = [];

  for (let idx = 0; idx < expressionLength; idx += 3) {
    const operandA = currentExpression[idx];
    const operandB = currentExpression[idx + 1];
    const operatorSymbol = currentExpression[idx + 2];

    if (isOperable(operandA, operandB, operatorSymbol)) {
      const calculationResult = executeOperation(operandA, operandB, operatorSymbol);
      nextExpressionSegment.push(calculationResult);
    } else {
      reinsertOperands(nextExpressionSegment, operandA, operandB, operatorSymbol);
    }
  }

  processExpression(nextExpressionSegment);
}

processExpression(processedInitialData);
