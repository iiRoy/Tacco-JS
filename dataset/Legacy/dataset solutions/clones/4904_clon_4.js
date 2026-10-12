const fileSystemModule = require('fs');

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const allInputTokens = rawInputContent.trim().split(/\s+/g);

const elementCount = parseInt(allInputTokens[1], 10);

const numericElements = allInputTokens.slice(2, 2 + elementCount).map(Number);

let currentMaximum = -Infinity;
let aggregateSum = 0;

if (numericElements.length > 0) {
    const { maxVal, totalSum } = numericElements.reduce((accumulator, currentElement) => {
        accumulator.maxVal = Math.max(accumulator.maxVal, currentElement);
        accumulator.totalSum += currentElement;
        return accumulator;
    }, { maxVal: -Infinity, totalSum: 0 });

    currentMaximum = maxVal;
    aggregateSum = totalSum;
}

const sumOfNonMaximums = aggregateSum - currentMaximum;

const finalCalculation = currentMaximum - 1 - sumOfNonMaximums;

console.log(Math.max(0, finalCalculation));
