function checkCandidateDivisibility(candidateValue, existingPrimes, currentLimit) {
    for (let k = 0; k < existingPrimes.length; k++) {
        const primeDivisor = existingPrimes[k];
        if (primeDivisor * primeDivisor > currentLimit) {
            break;
        }
        if (candidateValue % primeDivisor === 0n) {
            return true;
        }
    }
    return false;
}

function applyPrimeFactorDivision(currentNumber, primeFactor) {
    let factorsAccumulated = 0;
    let tempNumber = currentNumber;
    let currentPowerOfPrime = primeFactor;

    while (currentPowerOfPrime <= tempNumber) {
        if (tempNumber % currentPowerOfPrime === 0n) {
            factorsAccumulated++;
            tempNumber /= currentPowerOfPrime;
        } else {
            break;
        }
        currentPowerOfPrime *= primeFactor;
    }
    return { updatedNumber: tempNumber, newFactors: factorsAccumulated };
}

function processInput(inputString) {
    let numberToFactor = BigInt(inputString);

    if (numberToFactor === 1n) {
        return console.log('0');
    }

    let totalFactorsFound = 0;
    const discoveredPrimes = [];

    for (let currentCandidate = 2n; currentCandidate * currentCandidate <= numberToFactor || currentCandidate === numberToFactor; currentCandidate++) {
        if (checkCandidateDivisibility(currentCandidate, discoveredPrimes, numberToFactor)) {
            continue;
        }

        discoveredPrimes.push(currentCandidate);

        const divisionResult = applyPrimeFactorDivision(numberToFactor, currentCandidate);
        numberToFactor = divisionResult.updatedNumber;
        totalFactorsFound += divisionResult.newFactors;
    }

    if (totalFactorsFound === 0) {
        totalFactorsFound = 1;
    }

    console.log(totalFactorsFound.toString());
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
