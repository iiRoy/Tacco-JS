const fileSystem = require('fs');
let rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

let processedNumericValue = Number(rawInputContent.trim());

let resultStringAccumulator = '';

function evaluateNumberForInclusion(candidateNumber) {
    const isDivisibleByThree = (candidateNumber % 3 === 0);
    const stringifiedNumber = String(candidateNumber);
    const containsDigitThree = stringifiedNumber.includes('3');
    return isDivisibleByThree || containsDigitThree;
}

for (let currentNumber = 3; currentNumber <= processedNumericValue; currentNumber++) {
    if (evaluateNumberForInclusion(currentNumber)) {
        resultStringAccumulator += currentNumber + ' ';
    }
}

console.log(resultStringAccumulator.trim());
