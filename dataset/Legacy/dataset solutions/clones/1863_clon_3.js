"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = rawData.split(/\s+/),
    tokenIndex = 0;

function readNum() {
    return +tokenArray[tokenIndex++];
}

function readStr() {
    return tokenArray[tokenIndex++];
}

function readBigInt() {
    return BigInt(tokenArray[tokenIndex++]);
}

// Helper function for BigInt GCD, rewritten iteratively for clarity
function greatestCommonDivisor(valA, valB) {
    let currentA = valA;
    let currentB = valB;
    while (currentB !== 0n) {
        const temp = currentB;
        currentB = currentA % currentB;
        currentA = temp;
    }
    return currentA;
}

const MODULUS_VAL = 1e9 + 7;

// Modular multiplication function, preserving original overflow prevention logic
function multiplyMod() {
    for (var factors = arguments, product = factors[0], i = factors.length; --i;) {
        product = ((product >> 16) * factors[i] % MODULUS_VAL * 65536 + (product & 65535) * factors[i]) % MODULUS_VAL;
    }
    return product;
}

// Modular inverse using Extended Euclidean Algorithm
function modularInverse(valB) {
    let currentA = MODULUS_VAL,
        u = 0,
        v = 1,
        tempVal;
    while (valB) {
        tempVal = currentA / valB | 0;
        currentA -= tempVal * valB;
        u -= tempVal * v;
        tempVal = currentA;
        currentA = valB;
        valB = tempVal;
        tempVal = u;
        u = v;
        v = tempVal;
    }
    u %= MODULUS_VAL;
    return u < 0 ? u + MODULUS_VAL : u;
}

// Modular exponentiation (power function)
function modularPower(base, exponent) {
    let result = 1;
    let currentBase = base;
    while (exponent) {
        if (exponent & 1) result = multiplyMod(currentBase, result);
        currentBase = multiplyMod(currentBase, currentBase);
        exponent >>= 1;
    }
    return result;
}

// Normalizes a number to be within [0, MODULUS_VAL-1]
function normalizeMod(value) {
    return (value % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL;
}

// Helper for retrieving count from nested map-like objects
function getPairCount(mapObj, key1, key2) {
    const innerMap = mapObj[key1];
    if (innerMap && innerMap[key2]) {
        return innerMap[key2];
    }
    return 0;
}

// Helper for adding or incrementing count in nested map-like objects,
// and managing a list of unique first-level keys.
function addOrIncrementPair(mapObj, uniqueKeyList, key1, key2) {
    if (!mapObj[key1]) {
        mapObj[key1] = {};
        uniqueKeyList.push(key1); // Add to unique list only if key1 is new
    }
    if (!mapObj[key1][key2]) {
        mapObj[key1][key2] = 0;
    }
    mapObj[key1][key2]++;
}


var resultValue = solveProblem();
if (resultValue !== undefined) console.log(resultValue);

function solveProblem() {
    const numPairs = readNum();
    let zeroA_count = 0; // Count of (0, b) where b != 0
    let zeroB_count = 0; // Count of (a, 0) where a != 0
    let bothZero_count = 0; // Count of (0, 0)

    const pairCounts = {}; // Stores counts of (a, b) pairs after normalization
    const uniqueA_values = []; // Stores unique 'a' values encountered for iteration

    for (let pairIdx = 0; pairIdx < numPairs; pairIdx++) {
        let currentA = readBigInt();
        let currentB = readBigInt();

        if (currentA === 0n && currentB === 0n) {
            bothZero_count++;
            continue;
        }
        if (currentA === 0n) {
            zeroA_count++;
            continue;
        }
        if (currentB === 0n) {
            zeroB_count++;
            continue;
        }

        const commonDivisor = greatestCommonDivisor(currentA, currentB);
        currentA /= commonDivisor;
        currentB /= commonDivisor;

        // Normalize such that currentA is always positive
        if (currentA < 0n) {
            currentA = -currentA;
            currentB = -currentB;
        }

        // Store counts using helper function
        addOrIncrementPair(pairCounts, uniqueA_values, currentA, currentB);
    }

    // Initialize final answer with combinations involving (0,b) and (a,0) vectors
    let finalAnswer = normalizeMod(modularPower(2, zeroA_count) + modularPower(2, zeroB_count) - 1);

    // Iterate through unique 'a' values to process (a,b) pairs
    for (const uniqueA of uniqueA_values) {
        // Iterate through 'b' values associated with the current 'a'
        for (const b_str_key in pairCounts[uniqueA]) {
            const currentB_val = BigInt(b_str_key); // Convert string key back to BigInt for comparison

            // This condition prevents double-counting orthogonal groups.
            // If we have a pair (A, B) where A > 0 and B < 0, its orthogonal counterpart is (-B, A).
            // Normalized, this would be (abs(B), A).
            // If (abs(B), A) has already been processed or will be processed later (because abs(B) > 0),
            // we skip processing (A, B) to ensure each orthogonal pair of vector types is handled once.
            if (currentB_val < 0n) {
                const absB_str = String(-currentB_val); // Key for abs(B)
                const A_str = String(uniqueA); // Key for A
                if (getPairCount(pairCounts, absB_str, A_str) > 0) {
                    continue; // Skip if the orthogonal pair (abs(B), A) exists and will be processed.
                }
            }

            let currentTerm = 0;
            const count_A_B = getPairCount(pairCounts, uniqueA, currentB_val); // Count of (A, B) vectors
            currentTerm = modularPower(2, count_A_B);

            // Check for the perpendicular vector type (B, -A)
            // Note: currentB_val is BigInt, uniqueA is BigInt.
            // The key for the perpendicular vector's 'a' component would be currentB_val.
            // The key for the perpendicular vector's 'b' component would be -uniqueA.
            const count_B_negA = getPairCount(pairCounts, currentB_val, String(-uniqueA)); // Count of (B, -A) vectors

            if (count_B_negA > 0) {
                // If both (A,B) and (B,-A) types exist, the term is (2^N1 + 2^N2 - 1)
                currentTerm = normalizeMod(currentTerm + modularPower(2, count_B_negA) - 1);
            }

            finalAnswer = multiplyMod(finalAnswer, currentTerm);
        }
    }

    // The final result includes the special (0,0) vectors.
    // The original formula `ans - 1 + z` is preserved for behavioral equivalence.
    return normalizeMod(finalAnswer - 1 + bothZero_count);
}
