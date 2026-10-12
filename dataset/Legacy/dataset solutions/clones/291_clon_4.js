const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const operationMap = {
    '+': (operandA, operandB) => operandB + operandA,
    '-': (operandA, operandB) => operandB - operandA,
    '*': (operandA, operandB) => operandB * operandA,
    '/': (operandA, operandB) => operandB / operandA
};

const evaluateExpression = (expressionString) => {
    const symbolSequence = expressionString.split(/\s/);

    const calculationStack = symbolSequence.reduce((currentStackState, currentSymbolToken) => {
        if (operationMap[currentSymbolToken]) {
            const firstPopped = currentStackState.pop();
            const secondPopped = currentStackState.pop();
            const operationResult = operationMap[currentSymbolToken](firstPopped, secondPopped);
            currentStackState.push(operationResult);
        } else {
            if (isNaN(currentSymbolToken)) {
                currentStackState.push(0);
            } else {
                currentStackState.push(parseFloat(currentSymbolToken));
            }
        }
        return currentStackState;
    }, []);

    return calculationStack[0].toFixed(6);
};

inputDataLines.forEach(singleLine => {
    console.log(evaluateExpression(singleLine));
});
