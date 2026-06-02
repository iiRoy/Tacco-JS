const fileContentReader = require('node:fs');

const rawInputContent = fileContentReader.readFileSync('/dev/stdin', 'ascii');
const allInputLines = rawInputContent.split('\n');

const finalExpressionBoundary = allInputLines.reduceRight((accumulator, currentEntry, currentIndex) => {
    if (accumulator === -1 && currentEntry.includes('?')) {
        return currentIndex;
    }
    return accumulator;
}, -1);

const relevantExpressionLines = finalExpressionBoundary !== -1
    ? allInputLines.slice(0, finalExpressionBoundary)
    : allInputLines;

const evaluateArithmetic = (expressionText) => {
    const [firstOperandString, operationCharacter, secondOperandString] = expressionText.split(' ', 3);

    const valueA = Number.parseInt(firstOperandString, 10);
    const valueB = Number.parseInt(secondOperandString, 10);

    const operationDispatcher = {
        '+': (x, y) => x + y,
        '-': (x, y) => x - y,
        '*': (x, y) => x * y,
        '/': (x, y) => Math.floor(x / y)
    };

    const chosenOperationFunction = operationDispatcher[operationCharacter] || operationDispatcher['/'];

    return chosenOperationFunction(valueA, valueB);
};

console.log(relevantExpressionLines.map(evaluateArithmetic).join('\n'));
