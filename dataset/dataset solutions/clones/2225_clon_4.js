const processInput = (dataString) => {
    const dataLines = dataString.trim().split('\n');
    const firstLineValues = dataLines[0].split(' ').map(val => parseInt(val, 10));
    const numberCount = firstLineValues[0];
    const numberArray = dataLines[1].split(' ').map(val => parseInt(val, 10));
    return { numberCount, numberArray };
};

const ARITHMETIC_MODULUS = 1000000007;

const performModExp = (baseNum, exponentNum) => {
    let outcome = 1n;
    let currentBaseBig = BigInt(baseNum);
    let currentExpBig = BigInt(exponentNum);
    const modulusBig = BigInt(ARITHMETIC_MODULUS);

    while (currentExpBig > 0n) {
        if (currentExpBig % 2n === 1n) {
            outcome = (outcome * currentBaseBig) % modulusBig;
        }
        currentBaseBig = (currentBaseBig * currentBaseBig) % modulusBig;
        currentExpBig /= 2n;
    }
    return Number(outcome);
};

const performModMult = (operandA, operandB) => {
    return Number((BigInt(operandA) * BigInt(operandB)) % BigInt(ARITHMETIC_MODULUS));
};

const generatePrimesUpToLimit = (upperBound) => {
    if (upperBound < 2) return [];
    const knownComposites = new Set();
    const primeSequence = [];
    for (let currentNum = 2; currentNum <= upperBound; currentNum++) {
        if (!knownComposites.has(currentNum)) {
            primeSequence.push(currentNum);
            // Optimization: start marking multiples from currentNum * currentNum
            // as smaller multiples would have already been marked by smaller primes.
            for (let mult = currentNum * currentNum; mult <= upperBound; mult += currentNum) {
                knownComposites.add(mult);
            }
        }
    }
    return primeSequence;
};

const obtainPrimeFactors = (targetValue, availablePrimeList) => {
    const factorTallies = new Map();
    let remainingValue = targetValue;
    if (remainingValue === 1) return factorTallies; // Handle 1 explicitly

    for (const currentPrime of availablePrimeList) {
        if (currentPrime * currentPrime > remainingValue) { // Optimization: if currentPrime squared exceeds remainingValue,
                                                            // then remainingValue must be prime itself (or 1)
            if (remainingValue > 1) {
                factorTallies.set(remainingValue, (factorTallies.get(remainingValue) || 0) + 1);
            }
            remainingValue = 1;
            break;
        }
        if (remainingValue === 1) break;

        while (remainingValue % currentPrime === 0) {
            factorTallies.set(currentPrime, (factorTallies.get(currentPrime) || 0) + 1);
            remainingValue /= currentPrime;
        }
    }
    // If after checking all available primes, remainingValue is still > 1,
    // it means remainingValue is a prime factor larger than any in availablePrimeList.
    // This should not happen if availablePrimeList covers primes up to Math.max(...A).
    if (remainingValue > 1) {
        factorTallies.set(remainingValue, (factorTallies.get(remainingValue) || 0) + 1);
    }
    return factorTallies;
};

const computeMaxExponentsAcrossAll = (listOfFactorMaps) => {
    const globalMaximumExponents = new Map();
    for (const factorMapEntry of listOfFactorMaps) {
        for (const [primeKey, exponentValue] of factorMapEntry) {
            globalMaximumExponents.set(primeKey, Math.max(globalMaximumExponents.get(primeKey) || 0, exponentValue));
        }
    }
    return globalMaximumExponents;
};

const calculateSumOfTerms = (individualFactorizations, overallMaxExps) => {
    return individualFactorizations.reduce((totalAccumulator, currentNumberFactorMap) => {
        let currentProductTerm = 1;
        for (const [primeFactor, highestExponent] of overallMaxExps) {
            const currentNumExponent = currentNumberFactorMap.get(primeFactor) || 0;
            const exponentDifference = highestExponent - currentNumExponent;
            if (exponentDifference > 0) {
                currentProductTerm = performModMult(currentProductTerm, performModExp(primeFactor, exponentDifference));
            }
        }
        return (totalAccumulator + currentProductTerm) % ARITHMETIC_MODULUS;
    }, 0);
};

(function(inputStr) {
    const processedInput = processInput(inputStr);
    const allNumbers = processedInput.numberArray;
    
    // Handle empty or zero arrays if necessary, though problem constraints usually imply positive integers.
    // For an empty array, Math.max would result in -Infinity.
    const maximumValue = allNumbers.length > 0 ? Math.max(...allNumbers) : 1; // Max value can be 1 for [1,1]

    const allPrimesGenerated = generatePrimesUpToLimit(maximumValue);

    const allNumbersFactorized = allNumbers.map(num => obtainPrimeFactors(num, allPrimesGenerated));

    const aggregatedMaxExponents = computeMaxExponentsAcrossAll(allNumbersFactorized);

    const finalCalculatedSum = calculateSumOfTerms(allNumbersFactorized, aggregatedMaxExponents);

    console.log(finalCalculatedSum);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));