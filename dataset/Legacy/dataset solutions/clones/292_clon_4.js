const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split(/\n/);

const operationMap = {
    '+': (firstValue, secondValue) => firstValue + secondValue,
    '-': (firstValue, secondValue) => firstValue - secondValue,
    '*': (firstValue, secondValue) => firstValue * secondValue,
    '/': (firstValue, secondValue) => firstValue / secondValue
};

inputLines.forEach(currentExpressionLine => {
    const expressionTokens = currentExpressionLine.split(/\s/);

    const calculationStack = expressionTokens.reduce((accumulatorStack, currentToken) => {
        if (operationMap[currentToken]) {
            const operandTwo = parseFloat(accumulatorStack.pop());
            const operandOne = parseFloat(accumulatorStack.pop());
            accumulatorStack.push(operationMap[currentToken](operandOne, operandTwo));
        } else {
            const numericRepresentation = isNaN(currentToken) ? 0 : parseFloat(currentToken).toFixed(6);
            accumulatorStack.push(numericRepresentation);
        }
        return accumulatorStack;
    }, []);

    console.log(calculationStack[0]);
});
