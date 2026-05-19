const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const textLines = fileContent.trim().split('\n');

function determinePrimeFactorCount(upperBound, targetPrime) {
    let accumulatedCount = 0;
    let currentDivisor = targetPrime;

    while (currentDivisor <= upperBound) {
        accumulatedCount += Math.floor(upperBound / currentDivisor);
        if (upperBound / targetPrime < currentDivisor) {
            break;
        }
        currentDivisor *= targetPrime;
    }
    return accumulatedCount;
}

const processedNumbers = textLines
    .filter(entry => entry !== '0')
    .map(val => Number(val));

for (const valueN of processedNumbers) {
    const factorTwoOccurrences = determinePrimeFactorCount(valueN, 2);
    const factorFiveOccurrences = determinePrimeFactorCount(valueN, 5);
    console.log(Math.min(factorTwoOccurrences, factorFiveOccurrences));
}
