const fileSystem = require('fs');
const inputSourcePath = '/dev/stdin';

const rawInputContent = fileSystem.readFileSync(inputSourcePath);
const processedInputString = rawInputContent.toString().trim();
const limitValue = parseInt(processedInputString, 10);

function checkSpecialNumberCondition(candidateNumber) {
    const divisorForModulo = 3;
    const targetDigitString = '3';

    const isDivisible = (candidateNumber % divisorForModulo === 0);
    const containsDigit = (String(candidateNumber).indexOf(targetDigitString) !== -1);

    return isDivisible || containsDigit;
}

const collectedNumbers = [];
for (let currentIteration = 1; currentIteration <= limitValue; currentIteration++) {
    if (checkSpecialNumberCondition(currentIteration)) {
        collectedNumbers.push(currentIteration);
    }
}

console.log(collectedNumbers.join(" "));
