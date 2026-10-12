const fileSystemModule = require('fs');

const ZERO_INPUT_SIGNAL = '0';

function calculatePrimeFactorOccurrences(value, prime) {
    let occurrenceCount = 0;
    let temporaryValue = value;
    while (temporaryValue > 0 && temporaryValue % prime === 0) {
        temporaryValue /= prime;
        occurrenceCount++;
    }
    return occurrenceCount;
}

const rawInputContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split('\n');

let currentProcessedLine;
while ((currentProcessedLine = processedInputLines.shift()) !== undefined) {
    if (currentProcessedLine === ZERO_INPUT_SIGNAL) {
        break;
    }

    let totalFactorTwoCount = 0;
    let totalFactorFiveCount = 0;
    const upperBoundNumber = Number(currentProcessedLine);

    for (let iterationNumber = 1; iterationNumber <= upperBoundNumber; iterationNumber++) {
        totalFactorTwoCount += calculatePrimeFactorOccurrences(iterationNumber, 2);
        totalFactorFiveCount += calculatePrimeFactorOccurrences(iterationNumber, 5);
    }

    const minimumFactorCount = Math.min(totalFactorTwoCount, totalFactorFiveCount);
    console.log(minimumFactorCount);
}
