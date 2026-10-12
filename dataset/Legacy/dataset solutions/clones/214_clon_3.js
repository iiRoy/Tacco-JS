function computePrimesUpTo(upperBoundValue) {
    const sieveState = Array.from({ length: upperBoundValue + 1 }, (_, index) => index);

    sieveState[0] = false;
    sieveState[1] = false;

    const sieveIterationLimit = Math.floor(Math.sqrt(upperBoundValue));

    for (let currentPrimeCandidate = 2; currentPrimeCandidate <= sieveIterationLimit; currentPrimeCandidate++) {
        if (sieveState[currentPrimeCandidate] === false) {
            continue;
        }
        for (let multipleIndex = currentPrimeCandidate * 2; multipleIndex <= upperBoundValue; multipleIndex += currentPrimeCandidate) {
            sieveState[multipleIndex] = false;
        }
    }

    const foundPrimeNumbers = [];
    for (let numIndex = 0; numIndex <= upperBoundValue; numIndex++) {
        if (sieveState[numIndex] !== false) {
            foundPrimeNumbers.push(sieveState[numIndex]);
        }
    }
    return foundPrimeNumbers;
}

const cachedPrimes = computePrimesUpTo(999999);

const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const parsedNumbers = rawInputContent.trim().split("\n").map(Number);

let inputDataPointer = 0;
while (true) {
    const currentNumber = parsedNumbers[inputDataPointer];
    if (currentNumber === 0) {
        break;
    }

    let calculatedSum = 0;
    for (let primeIndex = 0; primeIndex < currentNumber; primeIndex++) {
        calculatedSum += cachedPrimes[primeIndex];
    }
    console.log(calculatedSum);
    inputDataPointer++;
}
