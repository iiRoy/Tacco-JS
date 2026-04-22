var primeSequenceCache = [-1, 2, 3, 5, 7, 11, 13];

function isNumberPrime(testCandidate) {
    if (testCandidate <= 1) {
        return false;
    }
    if (testCandidate === 2 || testCandidate === 3) {
        return true;
    }
    if (testCandidate % 2 === 0) {
        return false;
    }
    if (testCandidate % 3 === 0) {
        return false;
    }

    const maxDivisorCheck = Math.floor(Math.sqrt(testCandidate));
    let kFactor = 1;

    while ((6 * kFactor - 1) <= maxDivisorCheck) {
        const divisorA = (6 * kFactor - 1);
        const divisorB = (6 * kFactor + 1);

        if (testCandidate % divisorA === 0 || testCandidate % divisorB === 0) {
            return false;
        }
        kFactor++;
    }

    return true;
}

function computePrimeByIndex(ordinalPosition) {
    if (!Number.isInteger(ordinalPosition) || ordinalPosition <= 0) {
        throw new Error("Ordinal position must be a positive integer.");
    }

    const cachedValue = primeSequenceCache[ordinalPosition];
    if (cachedValue !== undefined && cachedValue !== -1) {
        return cachedValue;
    }

    let currentCacheSize = primeSequenceCache.length;
    let lastKnownPrimeIndex = currentCacheSize - 1;
    let lastKnownPrimeNumber = primeSequenceCache[lastKnownPrimeIndex];

    let candidateForPrimality = lastKnownPrimeNumber + 2;

    while (true) {
        if (candidateForPrimality > Number.MAX_SAFE_INTEGER) {
            throw new Error("Candidate prime exceeded safe integer limit.");
        }

        if (isNumberPrime(candidateForPrimality)) {
            lastKnownPrimeIndex++;
            primeSequenceCache[lastKnownPrimeIndex] = candidateForPrimality;

            if (lastKnownPrimeIndex === ordinalPosition) {
                return candidateForPrimality;
            }
        }
        candidateForPrimality += 2;
    }
}

const fileSystem = require('fs');
const standardInputPath = '/dev/stdin';

let rawInputData;
try {
    rawInputData = fileSystem.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
    console.error("Failed to read input from /dev/stdin:", readError.message);
    process.exit(1);
}

const inputLinesArray = rawInputData
    .split('\n')
    .map(currentLineString => currentLineString.trim())
    .filter(trimmedLine => trimmedLine.length > 0);

for (let lineIndex = 0; lineIndex < inputLinesArray.length; lineIndex++) {
    const currentLineString = inputLinesArray[lineIndex];
    const queryValue = parseInt(currentLineString, 10);

    if (isNaN(queryValue)) {
        console.warn(`Skipping invalid input line: "${currentLineString}" as it's not a number.`);
        continue;
    }
    if (queryValue < 0) {
        console.warn(`Skipping input line: "${currentLineString}" as negative numbers are not valid prime positions.`);
        continue;
    }

    if (queryValue === 0) {
        break;
    }

    let cumulativeSumOfPrimes = 0;
    const loopUpperBound = queryValue;

    for (let currentOrdinal = loopUpperBound; currentOrdinal >= 1; currentOrdinal--) {
        try {
            cumulativeSumOfPrimes += computePrimeByIndex(currentOrdinal);
        } catch (primeError) {
            console.error(`Error computing prime for ordinal ${currentOrdinal} for input ${queryValue}: ${primeError.message}. Adding 0 to sum.`);
            cumulativeSumOfPrimes += 0;
        }
    }

    console.log(cumulativeSumOfPrimes);
}