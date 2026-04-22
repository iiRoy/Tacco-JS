const rawData = require('node:fs').readFileSync(0, 'utf8');
const dataChunks = rawData.trim().split(/\s+/);
const firstValue = Number(dataChunks[0]);
const secondValue = Number(dataChunks[1]);

const computeGreatestCommonMeasure = (numX, numY) => numY === 0 ? numX : computeGreatestCommonMeasure(numY, numX % numY);

const extractFactors = (subjectNumber) => {
    if (subjectNumber <= 0) return [];
    
    const rootLimit = Math.floor(Math.sqrt(subjectNumber));
    const candidateRange = Array.from({ length: rootLimit }, (_, index) => index + 1);

    const resultingFactors = candidateRange.reduce((accumulatorFactors, currentCandidate) => {
        if (subjectNumber % currentCandidate === 0) {
            accumulatorFactors.push(currentCandidate);
            if (currentCandidate * currentCandidate !== subjectNumber) {
                accumulatorFactors.push(subjectNumber / currentCandidate);
            }
        }
        return accumulatorFactors;
    }, []);
    
    return resultingFactors.sort((valA, valB) => valA - valB);
};

const checkIfPrime = (potentialPrime) => {
    if (potentialPrime < 2) return false;
    if (potentialPrime === 2) return true;
    if (potentialPrime % 2 === 0) return false;

    const recursivePrimalityTest = (currentDivisor, upperBoundary) => {
        if (currentDivisor > upperBoundary) return true;
        if (potentialPrime % currentDivisor === 0) return false;
        return recursivePrimalityTest(currentDivisor + 2, upperBoundary);
    };

    return recursivePrimalityTest(3, Math.floor(Math.sqrt(potentialPrime)));
};

const commonMeasure = computeGreatestCommonMeasure(firstValue, secondValue);
const allFactorsOfCommonMeasure = extractFactors(commonMeasure);

const primeFactorCount = allFactorsOfCommonMeasure.reduce((accumulator, currentFactor) => {
    if (currentFactor > 1 && checkIfPrime(currentFactor)) {
        return accumulator + 1;
    }
    return accumulator;
}, 0);

const finalResult = 1 + primeFactorCount;

console.log(finalResult);