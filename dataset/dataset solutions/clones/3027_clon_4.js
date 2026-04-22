"use strict";

// Replacement for I class (input parser)
function* acquireNumericSequence(sourceString, typeConverter = Number) {
    const textLines = sourceString.split("\n");
    let currentLineIndex = 0;
    let currentTokenPosition = 0;
    let activeLineTokens = [];

    while (currentLineIndex < textLines.length) {
        if (currentTokenPosition === 0) { // Time to parse a new line
            const lineContent = textLines[currentLineIndex];
            // Mimic original's behavior: trim then split by single space.
            // This can result in empty string tokens for multiple spaces or empty lines.
            activeLineTokens = lineContent.trim().split(" ");
        }

        if (currentTokenPosition < activeLineTokens.length) {
            yield typeConverter(activeLineTokens[currentTokenPosition]);
            currentTokenPosition++;
        } else {
            // All tokens on the current line have been consumed, move to the next line
            currentLineIndex++;
            currentTokenPosition = 0;
        }
    }
}

// Replacement for sieveOfEratosthenes
function derivePrimeNumbers(maximumBoundary) {
    const compositeStatus = new Array(maximumBoundary + 1).fill(false); // false means prime candidate
    compositeStatus[0] = true; // 0 is not prime
    compositeStatus[1] = true; // 1 is not prime

    const identifiedPrimesList = [];
    for (let currentCandidate = 2; currentCandidate <= maximumBoundary; currentCandidate += 1) {
        if (!compositeStatus[currentCandidate]) { // If currentCandidate is prime
            identifiedPrimesList.push(currentCandidate);
            // Mark all multiples of currentCandidate as composite
            // Start marking from currentCandidate * currentCandidate for efficiency
            for (let multipleValue = currentCandidate * currentCandidate; multipleValue <= maximumBoundary; multipleValue += currentCandidate) {
                compositeStatus[multipleValue] = true;
            }
        }
    }
    return identifiedPrimesList;
}

var knownPrimes = derivePrimeNumbers(100000); // Pre-calculate primes globally

// Replacement for gcd (iterative Euclidean algorithm)
function findGreatestCommonDivisor(valueA, valueB) {
    while (valueB !== 0) {
        const remainder = valueA % valueB;
        valueA = valueB;
        valueB = remainder;
    }
    return valueA;
}

// Replacement for main function
function processComputationalTask(rawData) {
    const numericTokenIterator = acquireNumericSequence(rawData);

    const totalElementsCount = numericTokenIterator.next().value; // Reads the first number 'n'
    const elementCollection = [];

    // Read 'n+1' additional elements into the collection
    for (let k = 0; k <= totalElementsCount; k++) {
        elementCollection.push(numericTokenIterator.next().value);
    }
    elementCollection.reverse(); // Reverse the order of elements

    // Compute the greatest common divisor of all elements in the collection
    const collectiveDivisor = elementCollection.reduce((accumulator, currentVal) => findGreatestCommonDivisor(accumulator, currentVal));

    // Normalize the collection by dividing each element by the collective divisor
    const normalizedCollection = elementCollection.map(val => val / collectiveDivisor);

    const resultingFactors = new Set(); // Use a Set to automatically handle unique factors

    // First phase of factor identification: based on properties of the normalized collection
    knownPrimes.forEach(potentialFactor => {
        // Condition 1: If the first element of the normalized collection is not divisible by the potential factor, skip.
        if (normalizedCollection[0] % potentialFactor !== 0) {
            return; // Equivalent to 'continue' for this iteration of forEach
        }

        // Condition 2: Check sums for specific sub-sequences
        // This uses `every` to ensure that all sub-conditions (for loopIndex from 1 to potentialFactor-1) pass.
        // If any sub-condition fails, `every` returns false, and the potentialFactor is not added.
        const allSubConditionsSatisfied = Array.from({ length: potentialFactor - 1 }, (_, k) => k + 1)
            .every(loopIndex => {
                let currentSum = 0;
                let subCollectionIndex = loopIndex;
                while (subCollectionIndex <= totalElementsCount) {
                    currentSum += normalizedCollection[subCollectionIndex];
                    subCollectionIndex += potentialFactor - 1;
                }
                return currentSum % potentialFactor === 0;
            });

        if (allSubConditionsSatisfied) {
            resultingFactors.add(potentialFactor);
        }
    });

    // Second phase of factor identification: prime factors of the original collective divisor
    let mutableCollectiveDivisor = collectiveDivisor; // Work with a mutable copy
    for (const p of knownPrimes) {
        if (mutableCollectiveDivisor <= 1) break; // All factors have been found
        if (mutableCollectiveDivisor % p === 0) {
            resultingFactors.add(p);
            // Repeatedly divide out the factor until it's no longer divisible
            while (mutableCollectiveDivisor % p === 0) {
                mutableCollectiveDivisor /= p;
            }
        }
    }
    // If after dividing by all known primes, there's a remainder greater than 1,
    // that remainder itself must be a prime factor (larger than knownPrimes limit or not yet encountered)
    if (mutableCollectiveDivisor > 1) {
        resultingFactors.add(mutableCollectiveDivisor);
    }

    // Convert the Set to an Array, sort numerically, and print each unique factor
    Array.from(resultingFactors)
        .sort((valA, valB) => valA - valB)
        .forEach(factor => console.log(factor));
}

// Read input from standard input and execute the main processing task
processComputationalTask(require("fs").readFileSync("/dev/stdin", "utf8"));