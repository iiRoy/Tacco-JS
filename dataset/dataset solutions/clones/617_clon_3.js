const fileSystemHandler = require('fs');

const standardInputResource = '/dev/stdin';

const rawTextContent = fileSystemHandler.readFileSync(standardInputResource, 'utf8');

const trimmedAndSplitLines = rawTextContent.trim().split('\n');

let numericalAccumulator = 0;

if (trimmedAndSplitLines.length > 0) {
    const initialValueString = trimmedAndSplitLines[0];
    const initialNumericValue = parseFloat(initialValueString);

    if (!isNaN(initialNumericValue)) {
        numericalAccumulator = Math.trunc(initialNumericValue);
    } else {
        if (initialValueString.trim() === '') {
            numericalAccumulator = 0;
        } else {
            numericalAccumulator = NaN;
        }
    }
} else {
    numericalAccumulator = 0;
}

for (let currentLinePointer = 1; currentLinePointer < trimmedAndSplitLines.length; currentLinePointer += 2) {
    const operationIndicator = trimmedAndSplitLines[currentLinePointer];
    const operandValueString = trimmedAndSplitLines[currentLinePointer + 1];

    if (operandValueString === undefined) {
        numericalAccumulator = NaN;
        break;
    }

    const parsedOperandNumeric = parseFloat(operandValueString);

    if (isNaN(parsedOperandNumeric)) {
        numericalAccumulator = NaN;
        break;
    }

    switch (operationIndicator) {
        case '=':
            currentLinePointer = trimmedAndSplitLines.length;
            continue;
        case '+':
            numericalAccumulator += parsedOperandNumeric;
            break;
        case '-':
            numericalAccumulator -= parsedOperandNumeric;
            break;
        case '*':
            numericalAccumulator *= parsedOperandNumeric;
            break;
        case '/':
            if (parsedOperandNumeric === 0) {
                numericalAccumulator = NaN;
                currentLinePointer = trimmedAndSplitLines.length;
            } else {
                numericalAccumulator /= parsedOperandNumeric;
            }
            break;
        default:
            break;
    }

    numericalAccumulator = Math.trunc(numericalAccumulator);

    if (isNaN(numericalAccumulator)) {
        break;
    }
}

console.log(numericalAccumulator);