"use strict";

// --- Input Handling (Substantially different implementation) ---
function* tokenStreamGenerator(rawInput) {
    // Split input by spaces or newlines, filter out empty strings
    const tokens = rawInput.split(/ |\n/).filter(t => t !== '');
    for (const token of tokens) {
        yield token;
    }
}

let inputTokenIterator; // Initialized in the main execution block

function retrieveNextToken() {
    const { value, done } = inputTokenIterator.next();
    if (done) {
        throw new Error("End of input stream reached unexpectedly.");
    }
    return value;
}

function retrieveNextNumber() {
    return Number(retrieveNextToken());
}

function retrieveNextBigInt() {
    return BigInt(retrieveNextToken());
}

// --- Mathematical Utilities (Substantially different implementation, using BigInts throughout) ---
const MOD_VAL = 1000000007n; // Modulo constant as BigInt

function computeGreatestCommonDivisor(valA, valB) {
    valA = valA < 0n ? -valA : valA; // Ensure positive for GCD
    valB = valB < 0n ? -valB : valB; // Ensure positive for GCD
    while (valB !== 0n) {
        const temp = valB;
        valB = valA % valB;
        valA = temp;
    }
    return valA;
}

function modularMultiplication(factorA, factorB) {
    return (factorA * factorB) % MOD_VAL;
}

function modularExponentiation(baseVal, exponentVal) {
    let result = 1n;
    baseVal %= MOD_VAL;
    while (exponentVal > 0n) {
        if (exponentVal % 2n === 1n) {
            result = modularMultiplication(result, baseVal);
        }
        baseVal = modularMultiplication(baseVal, baseVal);
        exponentVal /= 2n;
    }
    return result;
}

// Modular inverse using Fermat's Little Theorem (MOD_VAL is prime)
function modularInverse(num) {
    return modularExponentiation(num, MOD_VAL - 2n);
}

function normalizeModulo(num) {
    return (num % MOD_VAL + MOD_VAL) % MOD_VAL;
}

// --- Core Logic (Substantially different implementation strategy) ---
function solveProblem() {
    const vectorCount = retrieveNextNumber();

    let zeroX_nonZeroY_count = 0; // Count of (0, Y) vectors where Y != 0
    let nonZeroX_zeroY_count = 0; // Count of (X, 0) vectors where X != 0

    // Using a Map for vector counts, where key is "a,b" string
    // and values are counts. This replaces the nested object structure.
    const nonZeroVectorGroups = new Map();

    for (let i = 0; i < vectorCount; i++) {
        let currentA = retrieveNextBigInt();
        let currentB = retrieveNextBigInt();

        if (currentA === 0n && currentB === 0n) {
            continue; // Ignore (0,0) vectors
        }

        if (currentA === 0n) {
            zeroX_nonZeroY_count++;
            continue;
        }
        if (currentB === 0n) {
            nonZeroX_zeroY_count++;
            continue;
        }

        // Normalize non-zero, non-zero vectors to a canonical form:
        // GCD division, then ensure first component is positive.
        // If first component is zero, ensure second component is positive.
        const commonDivisor = computeGreatestCommonDivisor(currentA, currentB);
        currentA /= commonDivisor;
        currentB /= commonDivisor;

        if (currentA < 0n || (currentA === 0n && currentB < 0n)) {
            currentA = -currentA;
            currentB = -currentB;
        }

        const canonicalKey = `${currentA},${currentB}`;
        nonZeroVectorGroups.set(canonicalKey, (nonZeroVectorGroups.get(canonicalKey) || 0) + 1);
    }

    // Calculate initial ways for (0,Y) and (X,0) vectors
    // This is (2^zeroX_nonZeroY_count - 1) + (2^nonZeroX_zeroY_count - 1) + 1
    // which simplifies to 2^zeroX_nonZeroY_count + 2^nonZeroX_zeroY_count - 1
    let totalCombinations = (modularExponentiation(2n, BigInt(zeroX_nonZeroY_count)) +
                             modularExponentiation(2n, BigInt(nonZeroX_zeroY_count)) - 1n);
    totalCombinations = normalizeModulo(totalCombinations);

    // Use a Set to track processed canonical keys to avoid double-counting orthogonal pairs.
    const processedCanonicalKeys = new Set();

    // Iterate through the canonical non-zero, non-zero vector groups
    // Using Map.entries() and for...of loop, different from original for...in
    for (const [canonicalKey, groupCount] of nonZeroVectorGroups.entries()) {
        if (processedCanonicalKeys.has(canonicalKey)) {
            continue; // This group has already been handled as part of an orthogonal pair
        }

        const [aStr, bStr] = canonicalKey.split(',');
        const aVal = BigInt(aStr);
        const bVal = BigInt(bStr);

        // Calculate the canonical form of the orthogonal vector (-b, a)
        let orthogonalA = -bVal;
        let orthogonalB = aVal;

        const orthCommonDivisor = computeGreatestCommonDivisor(orthogonalA, orthogonalB);
        orthogonalA /= orthCommonDivisor;
        orthogonalB /= orthCommonDivisor;

        if (orthogonalA < 0n || (orthogonalA === 0n && orthogonalB < 0n)) {
            orthogonalA = -orthogonalA;
            orthogonalB = -orthogonalB;
        }
        const orthogonalCanonicalKey = `${orthogonalA},${orthogonalB}`;

        processedCanonicalKeys.add(canonicalKey); // Mark current group as processed

        let currentGroupContribution;
        if (orthogonalCanonicalKey === canonicalKey) {
            // This case implies the vector is orthogonal to itself after normalization.
            // For non-zero a,b, this should not happen with the chosen normalization.
            // If it did, it would just be the combinations of this group.
            currentGroupContribution = modularExponentiation(2n, BigInt(groupCount));
        } else if (nonZeroVectorGroups.has(orthogonalCanonicalKey)) {
            // Found an orthogonal group
            const orthogonalGroupCount = nonZeroVectorGroups.get(orthogonalCanonicalKey);
            const waysForCurrentGroup = modularExponentiation(2n, BigInt(groupCount));
            const waysForOrthogonalGroup = modularExponentiation(2n, BigInt(orthogonalGroupCount));

            // The number of ways to choose subsets from these two orthogonal groups
            // is (waysForCurrentGroup + waysForOrthogonalGroup - 1)
            // This is (2^C1 - 1) + (2^C2 - 1) + 1 = 2^C1 + 2^C2 - 1
            currentGroupContribution = (waysForCurrentGroup + waysForOrthogonalGroup - 1n);
            currentGroupContribution = normalizeModulo(currentGroupContribution);

            processedCanonicalKeys.add(orthogonalCanonicalKey); // Mark orthogonal group as processed
        } else {
            // No orthogonal group found for this vector
            currentGroupContribution = modularExponentiation(2n, BigInt(groupCount));
        }

        totalCombinations = modularMultiplication(totalCombinations, currentGroupContribution);
    }

    // Subtract 1 for the empty set of vectors (which is always counted)
    return normalizeModulo(totalCombinations - 1n);
}

// --- Main Execution Block ---
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
inputTokenIterator = tokenStreamGenerator(rawInputData);

const finalResult = solveProblem();
if (finalResult !== undefined) {
    console.log(finalResult.toString()); // Ensure BigInt result is converted to string for output
}
