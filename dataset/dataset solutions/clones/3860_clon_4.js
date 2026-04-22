"use strict";

const HIGHEST_NUMERAL = 55555;

function establishPrimeUniverse(upperBoundary) {
    const isComposite = new Array(upperBoundary + 1).fill(false);
    
    isComposite[0] = true;
    isComposite[1] = true;

    const limitForMarking = Math.floor(Math.sqrt(upperBoundary));

    for (let current = 2; current <= limitForMarking; current++) {
        if (!isComposite[current]) {
            for (let multiple = current * 2; multiple <= upperBoundary; multiple += current) {
                isComposite[multiple] = true;
            }
        }
    }
    
    const gatheredPrimes = [];
    for (let num = 2; num <= upperBoundary; num++) {
        if (!isComposite[num]) {
            gatheredPrimes.push(num);
        }
    }

    return {
        primalityMap: isComposite, // true if composite, false if prime
        primeSequence: gatheredPrimes
    };
}

function* yieldCombinations(sourceCollection, subsetCardinality) {
    if (subsetCardinality < 0 || subsetCardinality > sourceCollection.length) {
        return;
    }
    if (subsetCardinality === 0) {
        yield [];
        return;
    }
    if (subsetCardinality === sourceCollection.length) {
        yield [...sourceCollection];
        return;
    }

    function* recurse(startIndex, currentCombination) {
        if (currentCombination.length === subsetCardinality) {
            yield currentCombination;
            return;
        }
        for (let idx = startIndex; idx < sourceCollection.length; idx++) {
            yield* recurse(idx + 1, [...currentCombination, sourceCollection[idx]]);
        }
    }
    yield* recurse(0, []);
}

function checkPrimeSumConstraint(numericalList, compositeIndicatorMap) {
    for (const group of yieldCombinations(numericalList, 5)) {
        const aggregatedSum = group.reduce((accumulator, value) => accumulator + value, 0);
        // Check if sum is within bounds and is NOT composite (i.e., is prime)
        if (aggregatedSum <= HIGHEST_NUMERAL && !compositeIndicatorMap[aggregatedSum]) {
            return false;
        }
    }
    return true;
}

function executeSolver(inputStringContent) {
    const desiredQuantity = parseInt(inputStringContent, 10);

    const primeData = establishPrimeUniverse(HIGHEST_NUMERAL);
    const primalityMap = primeData.primalityMap;
    const orderedPrimes = primeData.primeSequence;

    let currentPrimeWindow = [];
    let primeIteratorIndex = 0;

    while (true) {
        if (primeIteratorIndex >= orderedPrimes.length) {
            // This case indicates no solution was found within the pre-calculated primes.
            // For the problem constraints, a solution should always be found.
            console.error("No solution found within the prime limit.");
            return;
        }

        const currentPrimeCandidate = orderedPrimes[primeIteratorIndex];
        currentPrimeWindow.push(currentPrimeCandidate);

        if (currentPrimeWindow.length === desiredQuantity) {
            if (checkPrimeSumConstraint(currentPrimeWindow, primalityMap)) {
                console.log(currentPrimeWindow.join(' '));
                return;
            }
            currentPrimeWindow.shift();
        }
        primeIteratorIndex++;
    }
}

executeSolver(require('fs').readFileSync('/dev/stdin', 'utf8'));