function markMultiples(flagsArray, primeVal, currentLimit) {
    const start = primeVal * primeVal;
    for (let multiple = start; multiple <= currentLimit; multiple += primeVal) {
        flagsArray[multiple] = false;
    }
}

function generatePrimes(limit) {
    if (limit < 2) {
        return new Set();
    }

    const isPrimeFlags = new Array(limit + 1).fill(true);
    isPrimeFlags[0] = false;
    isPrimeFlags[1] = false;

    const limitSqrt = Math.floor(Math.sqrt(limit));

    for (let k = 2; k <= limitSqrt; k++) {
        if (isPrimeFlags[k]) {
            markMultiples(isPrimeFlags, k, limit);
        }
    }

    const primeSet = new Set();
    for (let k = 2; k <= limit; k++) {
        if (isPrimeFlags[k]) {
            primeSet.add(k);
        }
    }
    return primeSet;
}

const cachedPrimes = generatePrimes(1000000);

function readAndParseLine(linesArray) {
    return linesArray.shift().split(" ").map(Number);
}

function readSingleValue(linesArray) {
    return Number(linesArray.shift());
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawData.trim().split("\n");

while (true) {
    const currentLineNums = readAndParseLine(inputLines);
    const numElements = currentLineNums[0];
    const targetSum = currentLineNums[1];

    if (numElements === 0 && targetSum === 0) {
        break;
    }

    const maxPossibleSum = 1000000;
    const sumPossibilities = new Array(maxPossibleSum + 1).fill(false);
    sumPossibilities[0] = true;

    const inputValues = [];
    for (let k = 0; k < numElements; k++) {
        const currentValue = readSingleValue(inputLines);
        inputValues.push(currentValue);
        if (currentValue <= maxPossibleSum) {
            sumPossibilities[currentValue] = true;
        }
    }

    for (let currentSum = 0; currentSum <= targetSum; currentSum++) {
        if (sumPossibilities[currentSum]) {
            for (let valIndex = 0; valIndex < inputValues.length; valIndex++) {
                const itemValue = inputValues[valIndex];
                const nextSum = currentSum + itemValue;
                if (nextSum <= maxPossibleSum) {
                    sumPossibilities[nextSum] = true;
                }
            }
        }
    }

    let largestPrimeReachable = 0;

    for (let k = targetSum; k > 0; k--) {
        if (sumPossibilities[k] && cachedPrimes.has(k)) {
            largestPrimeReachable = k;
            break;
        }
    }

    console.log((largestPrimeReachable === 0) ? "NA" : largestPrimeReachable);
}
