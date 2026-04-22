const rawDataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

const processedInputSegments = rawDataSource.trim().split('\n');

function determinePrimeFactorialOccurrences(factorialLimit, primeDivisor) {
    let cumulativeCount = 0;
    let currentPowerOfDivisor = primeDivisor;

    while (currentPowerOfDivisor <= factorialLimit) {
        cumulativeCount += Math.floor(factorialLimit / currentPowerOfDivisor);

        if (currentPowerOfDivisor > factorialLimit / primeDivisor) {
            break;
        }
        currentPowerOfDivisor *= primeDivisor;
    }
    return cumulativeCount;
}

for (let segmentIndex = 0; segmentIndex < processedInputSegments.length; segmentIndex++) {
    const currentInputString = processedInputSegments[segmentIndex];

    const numericalValue = parseInt(currentInputString, 10);

    if (isNaN(numericalValue) || numericalValue < 0) {
        continue;
    }

    if (numericalValue === 0) {
        break;
    }

    const countOfFactorTwo = determinePrimeFactorialOccurrences(numericalValue, 2);

    const countOfFactorFive = determinePrimeFactorialOccurrences(numericalValue, 5);

    const resultTrailingZeros = Math.min(countOfFactorTwo, countOfFactorFive);

    console.log(resultTrailingZeros);
}