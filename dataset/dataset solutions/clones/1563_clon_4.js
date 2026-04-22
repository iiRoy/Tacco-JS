const acquirePrimes = (upperBoundary) => {
    const potentialPrimes = new Set();
    for (let currentNumber = 2; currentNumber <= upperBoundary; currentNumber++) {
        potentialPrimes.add(currentNumber);
    }

    for (let currentPrimeCandidate = 2; currentPrimeCandidate * currentPrimeCandidate <= upperBoundary; currentPrimeCandidate++) {
        if (potentialPrimes.has(currentPrimeCandidate)) {
            for (let multiple = currentPrimeCandidate * currentPrimeCandidate; multiple <= upperBoundary; multiple += currentPrimeCandidate) {
                potentialPrimes.delete(multiple);
            }
        }
    }
    return Array.from(potentialPrimes).sort((a, b) => a - b);
};

const extractUniqueFactors = (numberToDecompose, availablePrimesList) => {
    const uniqueDivisorsFound = new Set();
    let remainingNumber = numberToDecompose;

    if (remainingNumber <= 1) return uniqueDivisorsFound;

    for (const primeFromList of availablePrimesList) {
        if (primeFromList * primeFromList > remainingNumber && remainingNumber > 1) {
            break;
        }
        if (remainingNumber % primeFromList === 0) {
            uniqueDivisorsFound.add(primeFromList);
            while (remainingNumber % primeFromList === 0) {
                remainingNumber /= primeFromList;
            }
        }
    }
    if (remainingNumber > 1) {
        uniqueDivisorsFound.add(remainingNumber);
    }
    return uniqueDivisorsFound;
};

const findCommonDivisor = (firstOperand, secondOperand) => {
    while (secondOperand !== 0) {
        const remainder = firstOperand % secondOperand;
        firstOperand = secondOperand;
        secondOperand = remainder;
    }
    return firstOperand;
};

const evaluateNumberSet = (inputData) => {
    const dataLines = inputData.split("\n");
    const numericSequence = dataLines[1].split(" ").map(Number);

    const PRIME_LIMIT = 10**6 + 1;

    const allCalculatedPrimes = acquirePrimes(PRIME_LIMIT);
    
    let observedPrimeOccurrences = new Map();
    let isSetPairwiseCoprime = true;

    for (const element of numericSequence) {
        const currentElementFactors = extractUniqueFactors(element, allCalculatedPrimes);
        for (const factor of currentElementFactors) {
            if (observedPrimeOccurrences.has(factor)) {
                isSetPairwiseCoprime = false;
                break;
            }
            observedPrimeOccurrences.set(factor, true);
        }
        if (!isSetPairwiseCoprime) {
            break;
        }
    }
    
    if (isSetPairwiseCoprime) {
        console.log("pairwise coprime");
        return;
    }

    const overallSetGCD = numericSequence.reduce(findCommonDivisor);
    
    if (overallSetGCD === 1) {
        console.log("setwise coprime");
        return;
    }
    
    console.log("not coprime");
};

evaluateNumberSet(require("fs").readFileSync("/dev/stdin", "utf8"));