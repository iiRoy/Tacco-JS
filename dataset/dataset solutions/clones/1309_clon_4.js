const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

const rowList = sourceData.split('\n');

const processedLines = rowList.reduce((acc, currentLine) => {
    if (currentLine === '0') {
        return { stopProcessing: true, collected: acc.collected };
    }
    if (acc.stopProcessing) {
        return acc;
    }
    return { stopProcessing: false, collected: [...acc.collected, currentLine] };
}, { stopProcessing: false, collected: [] }).collected;

const deriveSumOfDigits = (digitSequence) => {
    const numericUnits = Array.from(digitSequence, Number);
    let currentTotal = 0;
    for (let index = 0; index < numericUnits.length; index++) {
        currentTotal += numericUnits[index];
    }
    return currentTotal;
};

const computedValues = processedLines.map(deriveSumOfDigits);

const resultDisplay = computedValues.join('\n');

console.log(resultDisplay);