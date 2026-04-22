const sourceModule = require('node:fs');
const acquiredContent = sourceModule.readFileSync('/dev/stdin', 'utf8').trim();
const rawSegments = acquiredContent.split('\n');

function calculateFractionalDigitSum(topValue, bottomValue, countDigits) {
    let currentRemainder = topValue % bottomValue;
    let accumulatedSum = 0;

    for (let i = 0; i < countDigits; i++) {
        currentRemainder *= 10;
        const digit = Math.floor(currentRemainder / bottomValue);
        accumulatedSum += digit;
        currentRemainder %= bottomValue;
    }
    return accumulatedSum;
}

for (const currentSegment of rawSegments) {
    if (!currentSegment) continue;

    const stringParts = currentSegment.split(' ');
    const firstOperand = Number(stringParts[0]);
    const secondOperand = Number(stringParts[1]);
    const digitPrecision = Number(stringParts[2]);

    const finalResult = calculateFractionalDigitSum(firstOperand, secondOperand, digitPrecision);
    console.log(finalResult);
}