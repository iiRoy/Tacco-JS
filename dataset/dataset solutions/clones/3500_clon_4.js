const fileSystem = require('fs');

function computeGreatestCommonDivisor(firstOperand, secondOperand) {
    if (secondOperand === 0) {
        return firstOperand;
    }
    return computeGreatestCommonDivisor(secondOperand, firstOperand % secondOperand);
}

const inputLines = fileSystem.readFileSync('/dev/stdin', 'UTF-8').split('\n');

const initialLine = inputLines[0];
const parsedNumbers = initialLine.split(' ').map(Number);

const [divisor, originalDividend] = parsedNumbers;

const quotientPart = Math.floor(originalDividend / divisor);
const remainderPart = originalDividend % divisor;

const finalResult = computeGreatestCommonDivisor(quotientPart, remainderPart);
console.log(finalResult);
