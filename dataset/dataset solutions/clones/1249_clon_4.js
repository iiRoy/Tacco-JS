const rawStream = require('node:fs').readFileSync('/dev/stdin', 'utf8');

const lineSegments = rawStream.toString().split('\n');

const computationMethods = {
    '+': (firstOperand, secondOperand) => firstOperand + secondOperand,
    '-': (firstOperand, secondOperand) => firstOperand - secondOperand,
    '*': (firstOperand, secondOperand) => firstOperand * secondOperand,
    '/': (firstOperand, secondOperand) => Math.floor(firstOperand / secondOperand)
};

const queryIdentifier = '?';

const terminationPoint = lineSegments.findIndex(segment => segment.includes(queryIdentifier));

const calculableExpressions = terminationPoint !== -1 ? lineSegments.slice(0, terminationPoint) : lineSegments;

const finalOutcome = calculableExpressions.reduce((accumulator, currentEntry) => {
    const trimmedEntry = currentEntry.trim();
    if (!trimmedEntry) {
        return accumulator;
    }

    const expressionParts = trimmedEntry.split(' ');
    const leftValue = Number(expressionParts[0]);
    const operatorSymbol = expressionParts[1];
    const rightValue = Number(expressionParts[2]);

    const performOperation = computationMethods[operatorSymbol];

    if (performOperation) {
        return accumulator + performOperation(leftValue, rightValue) + '\n';
    } else {
        // This case should ideally not be reached if terminationPoint logic is correct
        return accumulator;
    }
}, '');

console.log(finalOutcome.trim());