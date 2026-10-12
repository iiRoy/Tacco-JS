const lineProcessor = require('readline').createInterface({
    input: process.stdin,
    terminal: false
});

const operationRegistry = {
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '/': (firstOperand, secondOperand) => firstOperand / secondOperand
};

function evaluateExpression(expressionString) {
    const componentArray = expressionString.split(" ");
    const leftValue = Number(componentArray[0]);
    const operationSymbol = componentArray[1];
    const rightValue = Number(componentArray[2]);

    if (operationSymbol === "?") {
        return false;
    }

    const operationFunction = operationRegistry[operationSymbol];
    if (operationFunction) {
        return operationFunction(leftValue, rightValue);
    }
    
    // If operator is not recognized and not '?', original returns undefined.
    // This path is implicitly handled by not returning anything specific.
}

lineProcessor.on('line', (currentInputLine) => {
    const computedResult = evaluateExpression(currentInputLine);
    if (computedResult !== false) {
        console.log(computedResult);
    }
});
