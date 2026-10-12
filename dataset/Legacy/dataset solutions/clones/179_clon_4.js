function generatePrimes(limit) {
    const primeCandidates = new Set();
    for (let currentNum = 2; currentNum <= limit; currentNum++) {
        primeCandidates.add(currentNum);
    }

    const squareRootLimit = Math.floor(Math.sqrt(limit));
    for (let currentNum = 2; currentNum <= squareRootLimit; currentNum++) {
        if (primeCandidates.has(currentNum)) {
            for (let multiple = currentNum * currentNum; multiple <= limit; multiple += currentNum) {
                primeCandidates.delete(multiple);
            }
        }
    }
    return Array.from(primeCandidates).sort((a, b) => a - b);
}

const primeNumbers = generatePrimes(999999);

function findInsertionPoint(sortedArray, target) {
    let lowIndex = 0;
    let highIndex = sortedArray.length - 1;
    let insertionPosition = sortedArray.length;

    while (lowIndex <= highIndex) {
        const midIndex = Math.floor((lowIndex + highIndex) / 2);
        if (sortedArray[midIndex] === target) {
            return { found: true, index: midIndex };
        } else if (sortedArray[midIndex] < target) {
            lowIndex = midIndex + 1;
        } else {
            insertionPosition = midIndex;
            highIndex = midIndex - 1;
        }
    }
    return { found: false, index: insertionPosition };
}

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedNumbers = rawInput.trim().split("\n").map(Number);

for (const targetValue of parsedNumbers) {
    const searchResult = findInsertionPoint(primeNumbers, targetValue);
    let previousPrime, subsequentPrime;

    if (searchResult.found) {
        const currentPrimeIndex = searchResult.index;
        previousPrime = (currentPrimeIndex > 0) ? primeNumbers[currentPrimeIndex - 1] : undefined;
        subsequentPrime = (currentPrimeIndex < primeNumbers.length - 1) ? primeNumbers[currentPrimeIndex + 1] : undefined;
        console.log(`${previousPrime} ${subsequentPrime}`);
    } else {
        const insertionIndex = searchResult.index;
        if (insertionIndex === primeNumbers.length) {
            continue;
        }
        previousPrime = (insertionIndex > 0) ? primeNumbers[insertionIndex - 1] : undefined;
        subsequentPrime = primeNumbers[insertionIndex];
        console.log(`${previousPrime} ${subsequentPrime}`);
    }
}
