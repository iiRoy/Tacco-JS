const inputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const expressionLines = inputContent.trim().split('\n');

const performRPNCalculation = (expressionText) => {
    const tokenList = expressionText.split(' ');
    const operandStack = [];

    const operatorMap = {
        '+': (first, second) => first + second,
        '-': (first, second) => first - second,
        '*': (first, second) => first * second,
        '/': (first, second) => first / second,
    };

    for (const currentElement of tokenList) {
        const parsedValue = parseFloat(currentElement);
        if (Number.isFinite(parsedValue)) {
            operandStack.push(parsedValue);
        } else {
            const secondOperand = operandStack.pop();
            const firstOperand = operandStack.pop();
            const operationFunction = operatorMap[currentElement];

            if (operationFunction) {
                operandStack.push(operationFunction(firstOperand, secondOperand));
            }
        }
    }
    return operandStack.pop();
};

for (const currentLine of expressionLines) {
    const finalResult = performRPNCalculation(currentLine);
    console.log(finalResult.toFixed(6));
}
