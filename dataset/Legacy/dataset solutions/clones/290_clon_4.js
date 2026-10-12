var rawInput = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
var expressionLines = rawInput.split('\n');

const operationRegistry = {
    '+': (first, second) => first + second,
    '-': (first, second) => first - second,
    '*': (first, second) => first * second,
    '/': (first, second) => first / second,
};

expressionLines.forEach(currentExpression => {
    if (!currentExpression.trim()) return;

    var expressionSymbols = currentExpression.trim().split(/ +/);

    const finalOperandStack = expressionSymbols.reduce((currentStack, currentSymbol) => {
        const numericValue = parseFloat(currentSymbol);
        if (Number.isFinite(numericValue)) {
            currentStack.push(numericValue);
        } else if (operationRegistry[currentSymbol]) {
            const secondOperand = currentStack.pop();
            const firstOperand = currentStack.pop();
            const operationFunction = operationRegistry[currentSymbol];
            currentStack.push(operationFunction(firstOperand, secondOperand));
        }
        return currentStack;
    }, []);

    console.log(finalOperandStack.pop().toFixed(6));
});
