const acquirePrimesBelow = (upperBound) => {
    const nonPrimeRegistry = new Set();
    nonPrimeRegistry.add(0);
    nonPrimeRegistry.add(1);

    const checkLimit = Math.floor(Math.sqrt(upperBound));

    for (let current = 2; current <= checkLimit; ++current) {
        if (!nonPrimeRegistry.has(current)) {
            for (let multiple = current * current; multiple <= upperBound; multiple += current) {
                nonPrimeRegistry.add(multiple);
            }
        }
    }

    const collectedPrimes = [];
    for (let num = 2; num <= upperBound; ++num) {
        if (!nonPrimeRegistry.has(num)) {
            collectedPrimes.push(num);
        }
    }
    return collectedPrimes;
};

const retrieveAdjacents = (targetValue, sortedSequence) => {
    let lowIndex = 0;
    let highIndex = sortedSequence.length - 1;
    let exactMatchIndex = -1;

    while (lowIndex <= highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        const midValue = sortedSequence[midIndex];

        if (midValue === targetValue) {
            exactMatchIndex = midIndex;
            break;
        } else if (midValue < targetValue) {
            lowIndex = midIndex + 1;
        } else {
            highIndex = midIndex - 1;
        }
    }

    let previousPrime, nextPrime;

    if (exactMatchIndex !== -1) {
        previousPrime = sortedSequence[exactMatchIndex - 1];
        nextPrime = sortedSequence[exactMatchIndex + 1];
    } else {
        previousPrime = sortedSequence[lowIndex - 1];
        nextPrime = sortedSequence[lowIndex];
    }

    if (nextPrime === undefined && exactMatchIndex === -1) {
        return null;
    } else {
        const prevOutput = previousPrime === undefined ? 'undefined' : previousPrime;
        const nextOutput = nextPrime === undefined ? 'undefined' : nextPrime;
        return `${prevOutput} ${nextOutput}`;
    }
};

const primeCollection = acquirePrimesBelow(999999);

const fileSystem = require('fs');
const rawInputSource = fileSystem.readFileSync('/dev/stdin', 'utf8');
const queryNumbers = rawInputSource.trim().split('\n').map(Number);

queryNumbers.forEach(currentNumber => {
    const outputString = retrieveAdjacents(currentNumber, primeCollection);
    if (outputString !== null) {
        console.log(outputString);
    }
});