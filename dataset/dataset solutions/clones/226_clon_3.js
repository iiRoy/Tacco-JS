const fileSystemModule = require('fs');

const MAX_ARRAY_SIZE = 50001;
const MAX_PRIME_CHECK_VALUE = 50000;
const MAX_PRIME_LIST_SIZE = 5134;

function readInputLines() {
    const inputLength = fileSystemModule.fstatSync(process.stdin.fd).size;
    const inputBuffer = Buffer.alloc(inputLength);
    const readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, inputLength, 0);
    return inputBuffer.toString('utf8', 0, readBytesCount).split('\n');
}

function executeMainLogic() {
    const inputLines = readInputLines();
    const calculatedPrimes = generatePrimeRelatedCounts();

    let lineIndex = 0;
    let currentInputVal;
    while (true) {
        const rawLine = inputLines[lineIndex];
        if (rawLine === undefined) {
            break;
        }
        currentInputVal = Number(rawLine);
        if (isNaN(currentInputVal) || currentInputVal === 0) {
            break;
        }
        console.log(calculatedPrimes[currentInputVal]);
        lineIndex++;
    }
}

function generatePrimeRelatedCounts() {
    const sieveArray = new Int16Array(MAX_ARRAY_SIZE);
    const sumOfPrimesCounts = new Int16Array(MAX_ARRAY_SIZE);
    const foundPrimesList = new Int16Array(MAX_PRIME_LIST_SIZE);

    function markMultiples(primeFactor, limit) {
        for (let multiple = (primeFactor << 1); multiple <= limit; multiple += primeFactor) {
            sieveArray[multiple] = 1;
        }
    }

    sieveArray[0] = sieveArray[1] = 1;
    const sieveLimit = Math.floor(Math.sqrt(MAX_PRIME_CHECK_VALUE));
    for (let idx = 2; idx <= sieveLimit; idx++) {
        if (sieveArray[idx]) {
            continue;
        }
        markMultiples(idx, MAX_PRIME_CHECK_VALUE);
    }

    let primeListIndex = 0;
    for (let idx = 1; idx <= MAX_PRIME_CHECK_VALUE; idx++) {
        if (sieveArray[idx]) {
            continue;
        }

        const currentPrime = idx;
        foundPrimesList[++primeListIndex] = currentPrime;

        for (let jdx = 1; jdx <= primeListIndex; jdx++) {
            const previousPrime = foundPrimesList[jdx];
            const currentSum = currentPrime + previousPrime;

            if (currentSum > MAX_PRIME_CHECK_VALUE) {
                break;
            }
            sumOfPrimesCounts[currentSum]++;
        }
    }

    return sumOfPrimesCounts;
}

executeMainLogic();
