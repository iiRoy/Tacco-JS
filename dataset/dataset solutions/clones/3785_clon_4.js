const sourceData = require('node:fs').readFileSync(0, 'utf8');
const processedLine = sourceData.trim().split('\n')[0];

const operandMatches = processedLine.match(/(-?\d+)\s+(-?\d+)/);
const firstOperand = Number(operandMatches[1]);
const secondOperand = Number(operandMatches[2]);

const computedValues = [
    firstOperand + secondOperand,
    firstOperand - secondOperand,
    firstOperand * secondOperand
];

const greatestResult = computedValues.reduce((currentMax, element) => {
    return currentMax > element ? currentMax : element;
});

process.stdout.write(greatestResult.toString() + '\n');