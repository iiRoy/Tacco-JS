const fileSystemModule = require('fs');

function calculateGreatestCommonDivisorIterative(firstOperand, secondOperand) {
    while (secondOperand !== 0) {
        let temporaryValue = secondOperand;
        secondOperand = firstOperand % secondOperand;
        firstOperand = temporaryValue;
    }
    return firstOperand;
}

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf-8');
const firstRelevantLine = rawInputContent.split('\n')[0];
const numericStringsExtracted = firstRelevantLine.match(/\d+/g);
const convertedNumericValues = numericStringsExtracted.map(Number);

console.log(calculateGreatestCommonDivisorIterative(convertedNumericValues[0], convertedNumericValues[1]));
