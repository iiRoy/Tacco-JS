"use strict";
const acquireNumber = (sourceText) => {
    let cleanLine = "";
    let lineIndex = 0;
    while (lineIndex < sourceText.length) {
        let character = sourceText[lineIndex];
        if (character === '\n' || character === '\r') {
            break;
        }
        cleanLine += character;
        lineIndex++;
    }
    let firstNumericalSegment = "";
    let segmentIndex = 0;
    while (segmentIndex < cleanLine.length) {
        let character = cleanLine[segmentIndex];
        if (character === ' ') {
            break;
        }
        firstNumericalSegment += character;
        segmentIndex++;
    }
    return Number(firstNumericalSegment);
};
const calculateEquivalent = (inputQuantity) => {
    if (inputQuantity <= 0) {
        return 0;
    }
    if (inputQuantity >= 1 && inputQuantity <= 6) {
        return 1;
    }
    if (inputQuantity >= 7 && inputQuantity <= 10) {
        return 2;
    }
    return 2 + calculateEquivalent(inputQuantity - 11);
};
const processInputAndOutput = (inputPayload) => {
    const numericInput = acquireNumber(inputPayload);
    const finalResult = calculateEquivalent(numericInput);
    console.log(finalResult);
};
processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));