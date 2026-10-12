const fileSystemModule = require('fs');

function readStandardInputLines() {
    const standardInputFd = process.stdin.fd;
    const inputStats = fileSystemModule.fstatSync(standardInputFd);
    const inputLengthBytes = inputStats.size;

    if (inputLengthBytes === 0) {
        return [];
    }

    const inputBuffer = Buffer.alloc(inputLengthBytes);
    const actualBytesRead = fileSystemModule.readSync(standardInputFd, inputBuffer, 0, inputLengthBytes, 0);

    const rawInputString = inputBuffer.toString('utf8', 0, actualBytesRead);
    return rawInputString.split('\n');
}

const inputLines = readStandardInputLines();
processInputData();

function processInputData() {
    const cumulativePrimeSums = generateCumulativePrimeSums();
    const totalInputEntries = inputLines.length;

    if (totalInputEntries === 0 || (totalInputEntries === 1 && inputLines[0] === '')) {
        return;
    }

    const loopUpperLimit = totalInputEntries - 1;
    for (let i = 0; i < loopUpperLimit; i++) {
        const currentLineContent = inputLines[i];
        const numericValue = parseInt(currentLineContent, 10);

        if (isNaN(numericValue) || numericValue === 0) {
            continue;
        }
        
        console.log(cumulativePrimeSums[numericValue]);
    }
}

function generateCumulativePrimeSums() {
    const upperBound = 10000;
    const arraySize = upperBound + 1;
    const sieveArray = new Int8Array(arraySize);
    const NOT_PRIME_MARKER = 1;

    sieveArray[0] = NOT_PRIME_MARKER;
    sieveArray[1] = NOT_PRIME_MARKER;

    const sqrtLimit = Math.floor(Math.sqrt(upperBound));

    for (let i = 2; i <= sqrtLimit; i++) {
        if (sieveArray[i] === NOT_PRIME_MARKER) {
            continue;
        }
        markMultiples(i, upperBound, sieveArray, NOT_PRIME_MARKER);
    }

    const cumulativeSumsArray = new Int32Array(arraySize);
    let currentCumulativeSum = 0;
    let primeIndexCounter = 0;

    for (let i = 1; i <= upperBound; i++) {
        if (sieveArray[i] !== NOT_PRIME_MARKER) {
            ({ currentCumulativeSum, primeIndexCounter } = updateCumulativeSums(
                i,
                currentCumulativeSum,
                primeIndexCounter,
                cumulativeSumsArray
            ));
        }
    }

    return cumulativeSumsArray;
}

function markMultiples(primeFactor, limit, sieve, markerValue) {
    for (let multiple = primeFactor * 2; multiple <= limit; multiple += primeFactor) {
        sieve[multiple] = markerValue;
    }
}

function updateCumulativeSums(
    currentNumber,
    previousSum,
    currentIndex,
    targetArray
) {
    const newSum = previousSum + currentNumber;
    targetArray[currentIndex] = newSum;
    return {
        currentCumulativeSum: newSum,
        primeIndexCounter: currentIndex + 1
    };
}
