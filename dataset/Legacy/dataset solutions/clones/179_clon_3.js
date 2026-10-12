const MAX_PRIME_LIMIT = 999999;

function findPrimesUpTo(upperBound) {
    const initializeSieveArray = (limit) => {
        const sieveState = new Array(limit + 1).fill(true);
        if (limit >= 0) {
            sieveState[0] = false;
        }
        if (limit >= 1) {
            sieveState[1] = false;
        }
        return sieveState;
    };

    let currentSieveState = initializeSieveArray(upperBound);

    const sieveIterationLimit = Math.floor(Math.sqrt(upperBound));

    for (let currentNumber = 2; currentNumber <= sieveIterationLimit; currentNumber++) {
        if (currentSieveState[currentNumber]) {
            for (let multiple = currentNumber * currentNumber; multiple <= upperBound; multiple += currentNumber) {
                currentSieveState[multiple] = false;
            }
        }
    }

    const extractPrimeNumbers = (state, limit) => {
        const primeNumbersList = [];
        for (let num = 2; num <= limit; num++) {
            if (state[num]) {
                primeNumbersList.push(num);
            }
        }
        return primeNumbersList;
    };

    return extractPrimeNumbers(currentSieveState, upperBound);
}

const precomputedPrimes = findPrimesUpTo(MAX_PRIME_LIMIT);

const findAndPrintPrimeNeighbors = (targetValue, primeList) => {
    for (let primeListIndex = 0; primeListIndex < primeList.length; primeListIndex++) {
        const currentPrimeInList = primeList[primeListIndex];

        if (currentPrimeInList === targetValue) {
            const previousPrime = primeListIndex > 0 ? primeList[primeListIndex - 1] : undefined;
            const nextPrime = primeList[primeListIndex + 1];
            console.log(`${previousPrime} ${nextPrime}`);
            return;
        }

        if (currentPrimeInList > targetValue) {
            const previousPrime = primeListIndex > 0 ? primeList[primeListIndex - 1] : undefined;
            console.log(`${previousPrime} ${currentPrimeInList}`);
            return;
        }
    }
};

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

const processedInputLines = rawInputData.trim().split("\n");
const targetNumbers = processedInputLines.map(Number);

for (let inputIndex = 0; inputIndex < targetNumbers.length; inputIndex++) {
    const currentTargetNumber = targetNumbers[inputIndex];
    findAndPrintPrimeNeighbors(currentTargetNumber, precomputedPrimes);
}
