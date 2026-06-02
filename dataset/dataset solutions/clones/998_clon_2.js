const settings = {
    sourcePath: '/dev/stdin',
    lineSeparator: '\n'
};

const rawLines = require('fs').readFileSync(settings.sourcePath, 'utf-8').split(settings.lineSeparator);

const dataPoints = rawLines.slice(1, rawLines.length - 1).map(currentLineText => parseInt(currentLineText));

const firstValue = dataPoints[0];
const remainingValues = dataPoints.slice(1);

const finalOutcome = remainingValues.reduce((accumulator, currentVal) => {
    accumulator.maxDifference = Math.max(accumulator.maxDifference, currentVal - accumulator.currentMinimum);
    accumulator.currentMinimum = Math.min(accumulator.currentMinimum, currentVal);
    return accumulator;
}, { maxDifference: -Infinity, currentMinimum: firstValue });

console.log(finalOutcome.maxDifference);
