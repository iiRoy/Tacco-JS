"use strict";

const dataSource = require("fs").readFileSync("/dev/stdin", "utf8");

const PRIME_MODULUS = 1000000007n;

const bigGcd = (firstVal, secondVal) => {
    let x = firstVal < 0n ? -firstVal : firstVal;
    let y = secondVal < 0n ? -secondVal : secondVal;
    while (y !== 0n) {
        let temp = y;
        y = x % y;
        x = temp;
    }
    return x;
};

const modularMultiply = (lhs, rhs) => {
    return (lhs * rhs) % PRIME_MODULUS;
};

const modularExponentiation = (base, exponent) => {
    let result = 1n;
    let currentBase = base % PRIME_MODULUS;
    let currentExponent = exponent;
    while (currentExponent > 0n) {
        if (currentExponent % 2n === 1n) {
            result = modularMultiply(result, currentBase);
        }
        currentBase = modularMultiply(currentBase, currentBase);
        currentExponent /= 2n;
    }
    return result;
};

const normalizeModulo = (value) => {
    return (value % PRIME_MODULUS + PRIME_MODULUS) % PRIME_MODULUS;
};

const solveProblem = () => {
    const tokens = dataSource.split(/\s+/).filter(Boolean);
    let tokenPointer = 0;

    const readLargeInteger = () => BigInt(tokens[tokenPointer++]);

    const totalPairs = readLargeInteger();

    let verticalVectorCount = 0n; // Corresponds to original 'az'
    let horizontalVectorCount = 0n; // Corresponds to original 'bz'
    const directionalCounts = new Map(); // Map<string "a,b", bigint count>

    for (let currentIdx = 0; currentIdx < totalPairs; currentIdx++) {
        const componentA = readLargeInteger();
        const componentB = readLargeInteger();

        if (componentA === 0n && componentB === 0n) continue;

        if (componentA === 0n) {
            verticalVectorCount++;
            continue;
        }
        if (componentB === 0n) {
            horizontalVectorCount++;
            continue;
        }

        const commonDivisor = bigGcd(componentA, componentB);
        let normalizedA = componentA / commonDivisor;
        let normalizedB = componentB / commonDivisor;

        // Ensure normalizedA is positive for canonical representation
        if (normalizedA < 0n) {
            normalizedA = -normalizedA;
            normalizedB = -normalizedB;
        }

        const vectorKey = `${normalizedA},${normalizedB}`;
        directionalCounts.set(vectorKey, (directionalCounts.get(vectorKey) || 0n) + 1n);
    }

    let cumulativeResult = 1n;
    // Initial term for vertical and horizontal vectors
    // (2^verticalVectorCount + 2^horizontalVectorCount - 1)
    const initialTerm = (modularExponentiation(2n, verticalVectorCount) + modularExponentiation(2n, horizontalVectorCount) - 1n);
    cumulativeResult = modularMultiply(cumulativeResult, initialTerm);

    const processedKeys = new Set();

    for (const [vectorKey, count] of directionalCounts.entries()) {
        if (processedKeys.has(vectorKey)) {
            continue;
        }

        const [aStr, bStr] = vectorKey.split(',');
        const aVal = BigInt(aStr);
        const bVal = BigInt(bStr);

        // Find the orthogonal partner (b, -a)
        const orthogonalKey = `${bVal},${-aVal}`;
        const orthogonalCount = directionalCounts.get(orthogonalKey) || 0n;

        // Calculate term for this orthogonal pair: (2^count + 2^orthogonalCount - 1)
        const groupTerm = (modularExponentiation(2n, count) + modularExponentiation(2n, orthogonalCount) - 1n);
        cumulativeResult = modularMultiply(cumulativeResult, groupTerm);

        processedKeys.add(vectorKey);
        processedKeys.add(orthogonalKey); // Mark both original and orthogonal keys as processed
    }

    // Subtract 1 for the empty set
    return normalizeModulo(cumulativeResult - 1n);
};

const problemOutput = solveProblem();
if (problemOutput !== undefined) {
    console.log(problemOutput.toString());
}