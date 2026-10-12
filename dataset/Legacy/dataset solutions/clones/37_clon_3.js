const fs = require("fs");

const fileContent = fs.readFileSync("/dev/stdin", "utf8");
const inputLines = fileContent.trim().split("\n");

const IS_PRIME_VAL = 1;
const NOT_PRIME_VAL = 0;

function initializeSieveArray(size, initialValue) {
    const sieve = new Array(size);
    for (let k = 0; k < size; k++) {
        sieve[k] = initialValue;
    }
    return sieve;
}

function setNonPrimeFlag(sieveArray, index) {
    sieveArray[index] = NOT_PRIME_VAL;
}

function countPrimesInSieve(sieveArray, limit, primeValue) {
    let primeCounter = 0;
    for (let num = 2; num <= limit; num++) {
        if (sieveArray[num] === primeValue) {
            primeCounter++;
        }
    }
    return primeCounter;
}

for (let lineIndex = 0; lineIndex < inputLines.length; lineIndex++) {
    const currentMax = parseInt(inputLines[lineIndex], 10);

    const primeFlags = initializeSieveArray(currentMax + 1, IS_PRIME_VAL);

    setNonPrimeFlag(primeFlags, 0);
    setNonPrimeFlag(primeFlags, 1);

    for (let outerLoopIdx = 2; outerLoopIdx <= currentMax / 2; outerLoopIdx++) {
        for (let innerLoopIdx = outerLoopIdx * 2; innerLoopIdx <= currentMax; innerLoopIdx += outerLoopIdx) {
            setNonPrimeFlag(primeFlags, innerLoopIdx);
        }
    }

    const resultPrimeCount = countPrimesInSieve(primeFlags, currentMax, IS_PRIME_VAL);

    console.log(resultPrimeCount);
}
