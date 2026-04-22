const fileSystem = require('fs');

const determineIfPrime = (numValue, currentDiv = 5) => {
    if (numValue < 2) return false;
    if (numValue === 2 || numValue === 3) return true;
    if (numValue % 2 === 0 || numValue % 3 === 0) return false;

    if (currentDiv * currentDiv > numValue) {
        return true;
    }

    if (numValue % currentDiv === 0 || numValue % (currentDiv + 2) === 0) {
        return false;
    }

    return determineIfPrime(numValue, currentDiv + 6);
};

const findNextPrimeNumber = (initialNumber) => {
    let currentCandidate = initialNumber;
    while (!determineIfPrime(currentCandidate)) {
        currentCandidate++;
    }
    return currentCandidate;
};

const rawDataFromStandardInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const parsedNumber = parseInt(rawDataFromStandardInput.split('\n')[0], 10);
const finalResult = findNextPrimeNumber(parsedNumber);
console.log(finalResult);