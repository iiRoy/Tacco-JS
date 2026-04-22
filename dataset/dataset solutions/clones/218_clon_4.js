const fileSystemModule = require('fs');

const inputBlob = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedNumbers = inputBlob.trim().split(/\s+/).map(Number);

function computeDigitAccumulation(currentRemainderFactor, divisorValue, iterationsRemaining, runningSum) {
    if (iterationsRemaining === 0) {
        return runningSum;
    }
    const nextRemainderFactor = (currentRemainderFactor % divisorValue) * 10;
    const extractedDigit = Math.floor(nextRemainderFactor / divisorValue);
    return computeDigitAccumulation(nextRemainderFactor, divisorValue, iterationsRemaining - 1, runningSum + extractedDigit);
}

let dataCursor = 0;
while (dataCursor < processedNumbers.length) {
    const valueA = processedNumbers[dataCursor++];
    const valueB = processedNumbers[dataCursor++];
    const countLimit = processedNumbers[dataCursor++];
    
    const finalAccumulatedValue = computeDigitAccumulation(valueA, valueB, countLimit, 0);
    console.log(finalAccumulatedValue);
}