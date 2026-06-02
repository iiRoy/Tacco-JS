function checkIfPrimeAndGetSmallestFactor(candidateNumber) {
    if (candidateNumber % 2 === 0) {
        return 2;
    }
    const limitForDivisor = Math.sqrt(candidateNumber);
    for (let currentDivisor = 3; currentDivisor <= limitForDivisor; currentDivisor += 2) {
        if (candidateNumber % currentDivisor === 0) {
            return currentDivisor;
        }
    }
    return candidateNumber;
}

const primeGenerationLimit = 50024;
const generatedPrimes = [2, 3];

for (let multiplierIndex = 1; (multiplierIndex * 6 + 1) < primeGenerationLimit; multiplierIndex++) {
    const baseSixValue = multiplierIndex * 6;
    const primeCandidateMinusOne = baseSixValue - 1;
    const primeCandidatePlusOne = baseSixValue + 1;

    if (checkIfPrimeAndGetSmallestFactor(primeCandidateMinusOne) === primeCandidateMinusOne) {
        generatedPrimes.push(primeCandidateMinusOne);
    }

    if (checkIfPrimeAndGetSmallestFactor(primeCandidatePlusOne) === primeCandidatePlusOne) {
        generatedPrimes.push(primeCandidatePlusOne);
    }
}

const totalPrimesCount = generatedPrimes.length;

process.stdin.on("data", function(inputDataBuffer) {
    const inputLines = String(inputDataBuffer).trim().split("\n");

    inputLines.some(function(line) {
        const queryNumber = Number(line);

        let foundPrimeIndex = -1;
        for (let primeArrayIndex = 0; primeArrayIndex < totalPrimesCount; primeArrayIndex++) {
            if (queryNumber < generatedPrimes[primeArrayIndex]) {
                foundPrimeIndex = primeArrayIndex;
                break;
            }
        }

        if (foundPrimeIndex !== -1) {
            const precedingPrime = generatedPrimes[foundPrimeIndex - 1];
            const succeedingPrime = generatedPrimes[foundPrimeIndex];

            let firstOutputValue;
            if (precedingPrime === queryNumber) {
                firstOutputValue = generatedPrimes[foundPrimeIndex - 2];
            } else {
                firstOutputValue = precedingPrime;
            }
            console.log(firstOutputValue, succeedingPrime);
        }
    });
}).resume();
