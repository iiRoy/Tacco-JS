function generatePrimesUpTo(limitValue) {
    const primeFlags = new Uint8Array(limitValue + 1).fill(1);
    primeFlags[0] = 0;
    primeFlags[1] = 0;

    let currentCandidate = 2;
    const upperSqrtBound = Math.floor(Math.sqrt(limitValue));

    while (currentCandidate <= upperSqrtBound) {
        if (primeFlags[currentCandidate] === 1) {
            let multiple = currentCandidate + currentCandidate;
            while (multiple <= limitValue) {
                primeFlags[multiple] = 0;
                multiple += currentCandidate;
            }
        }
        currentCandidate++;
    }

    const collectedPrimes = [];
    primeFlags.forEach((isItPrime, numberValue) => {
        if (isItPrime === 1) {
            collectedPrimes.push(numberValue);
        }
    });
    return collectedPrimes;
}

const precomputedPrimes = generatePrimesUpTo(999999);

function findPrimeCount(primeArray, targetNumber) {
    let lowIndex = 0;
    let highIndex = primeArray.length - 1;
    let resultCount = 0;

    while (lowIndex <= highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        if (primeArray[midIndex] <= targetNumber) {
            resultCount = midIndex + 1;
            lowIndex = midIndex + 1;
        } else {
            highIndex = midIndex - 1;
        }
    }
    return resultCount;
}

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const numericInputs = rawInputData.trim().split('\n').reduce((accumulator, currentLine) => {
    const parsedValue = Number(currentLine);
    accumulator.push(parsedValue);
    return accumulator;
}, []);

numericInputs.forEach(singleInput => {
    const count = findPrimeCount(precomputedPrimes, singleInput);
    console.log(count);
});
