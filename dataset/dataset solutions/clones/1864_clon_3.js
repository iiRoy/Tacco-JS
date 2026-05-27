"use strict";
var rawInput = require("fs").readFileSync("/dev/stdin", "utf8");

// Input parsing utility
const InputReader = function(inputString) {
    let tokenStream = inputString.split(/\s+/);
    let tokenIndex = 0;

    this.readInt = function() {
        return +tokenStream[tokenIndex++];
    };

    this.readString = function() {
        return tokenStream[tokenIndex++];
    };

    this.readBigInt = function() {
        return BigInt(tokenStream[tokenIndex++]);
    };

    this.readIntArray = function(count, mapToNumber = true) {
        let result = tokenStream.slice(tokenIndex, tokenIndex + count);
        tokenIndex += count;
        return mapToNumber ? result.map(Number) : result;
    };

    this.readMatrix = function(height, width, mapToNumber = true) {
        let matrix = [];
        for (let row = 0; row < height; row++) {
            let rowData = tokenStream.slice(tokenIndex, tokenIndex + width);
            tokenIndex += width;
            matrix.push(mapToNumber ? rowData.map(Number) : rowData);
        }
        return matrix;
    };
};

const inputReader = new InputReader(rawInput);

// Multi-dimensional array creation (original xArray, kept as is due to eval)
function createMultiDimArray(initialValue) {
    var args = arguments,
        len = args.length,
        resultExpr = "Array(args[" + --len + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--len) resultExpr = "Array(args[" + len + "]).fill().map(x=>" + resultExpr + ")";
    return eval(resultExpr);
}

// Greatest Common Divisor for BigInts (recursive, as in original)
function greatestCommonDivisorBigInt(valA, valB) {
    return valB ? greatestCommonDivisorBigInt(valB, valA % valB) : valA;
}

const moduloConstant = 1e9 + 7;

// Modular multiplication for Numbers
function multiplyMod() {
    for (var args = arguments, result = args[0], i = args.length; --i;) {
        result = ((result >>> 16) * args[i] % moduloConstant * 65536 + (result & 65535) * args[i]) % moduloConstant;
    }
    return result;
}

var factorialCache = [],
    invFactorialCache = [];
// var modularInverseCache = [], powerOfTwoCache = []; // Kept commented as in original

function precomputeFactorials(maxN) {
    factorialCache.length = maxN + 1;
    factorialCache[0] = factorialCache[1] = 1;
    for (var i = 2; i <= maxN;) factorialCache[i] = multiplyMod(factorialCache[i - 1], i++);

    invFactorialCache.length = maxN + 1;
    invFactorialCache[0] = invFactorialCache[1] = 1;
    invFactorialCache[maxN] = modularInverse(factorialCache[maxN]);
    for (i = maxN; 2 < i;) invFactorialCache[i - 1] = multiplyMod(invFactorialCache[i], i--);

    // modularInverseCache.length = maxN + 1; modularInverseCache[0] = modularInverseCache[1] = 1;
    // for (i = 2; i <= maxN;) modularInverseCache[i] = multiplyMod(factorialCache[i - 1], invFactorialCache[i++]);
    // powerOfTwoCache.length = maxN + 1; powerOfTwoCache[0] = 1;
    // for (i = 1; i <= maxN; i++) powerOfTwoCache[i] = powerOfTwoCache[i - 1] * 2 % moduloConstant;
}

// Modular inverse using extended Euclidean algorithm
function modularInverse(numB) {
    var numA = moduloConstant,
        u = 0,
        v = 1,
        temp;
    while (numB) {
        temp = numA / numB | 0;
        numA -= temp * numB;
        u -= temp * v;
        temp = numA;
        numA = numB;
        numB = temp;
        temp = u;
        u = v;
        v = temp;
    }
    u %= moduloConstant;
    return u < 0 ? u + moduloConstant : u;
}

// Modular exponentiation
function modularPower(base, exponent) {
    for (var result = 1; exponent; base = multiplyMod(base, base), exponent >>= 1) {
        if (exponent & 1) result = multiplyMod(base, result);
    }
    return result;
}

// nCr modulo (combinations)
function nCrMod(n, r) {
    return multiplyMod(factorialCache[n], invFactorialCache[r], invFactorialCache[n - r]);
}

// nPr modulo (permutations)
function nPrMod(n, r) {
    return multiplyMod(factorialCache[n], invFactorialCache[r]);
}

// Normalize a number to be within [0, moduloConstant-1]
function normalizeModulo(val) {
    return (val % moduloConstant + moduloConstant) % moduloConstant;
}

// Main program execution
var programOutput = solveProblem();
if (programOutput !== undefined) console.log(programOutput);

function solveProblem() {
    const numPairs = inputReader.readInt();
    let zeroA_count = 0;
    let zeroB_count = 0;
    const pairFrequencyMap = {}; // Stores counts of (A, B) pairs where A > 0

    // Helper to process and store a pair
    const processAndStorePair = (a_val, b_val) => {
        if (a_val === 0n && b_val === 0n) return;

        if (a_val === 0n) {
            zeroA_count++;
            return;
        }
        if (b_val === 0n) {
            zeroB_count++;
            return;
        }

        let commonDivisorVal = greatestCommonDivisorBigInt(a_val, b_val);
        a_val /= commonDivisorVal;
        b_val /= commonDivisorVal;

        // Normalize 'a' to be positive
        if (a_val < 0n) {
            a_val = -a_val;
            b_val = -b_val;
        }

        const a_str = a_val.toString();
        const b_str = b_val.toString();

        if (!pairFrequencyMap[a_str]) {
            pairFrequencyMap[a_str] = {};
        }
        pairFrequencyMap[a_str][b_str] = (pairFrequencyMap[a_str][b_str] || 0) + 1;
    };

    // Populate pairFrequencyMap
    for (let k = 0; k < numPairs; k++) {
        let currentA_val = inputReader.readBigInt();
        let currentB_val = inputReader.readBigInt();
        processAndStorePair(currentA_val, currentB_val);
    }

    let finalResult = (modularPower(2, zeroA_count) + modularPower(2, zeroB_count) - 1);

    // Calculate contribution from non-zero pairs
    for (const mapKey_A in pairFrequencyMap) {
        for (const mapKey_B in pairFrequencyMap[mapKey_A]) {
            let currentPairContribution = 0;

            // Check if mapKey_B represents a negative number (string comparison)
            if (mapKey_B < "0") { // e.g., "-5" < "0" is true
                // If we have (A, -B_abs) and (B_abs, A) already processed, skip (A, -B_abs)
                // This avoids double counting for specific orthogonal/perpendicular pairs
                const abs_mapKey_B_str = mapKey_B.slice(1); // e.g., "-5".slice(1) is "5"
                if (pairFrequencyMap[abs_mapKey_B_str] && pairFrequencyMap[abs_mapKey_B_str][mapKey_A]) {
                    continue;
                }
            } else { // mapKey_B is positive or "0" (though "0" is handled by zeroB_count)
                // Check for the "opposite" pair (B, -A)
                const negative_mapKey_A_str = "-" + mapKey_A;
                if (pairFrequencyMap[mapKey_B] && pairFrequencyMap[mapKey_B][negative_mapKey_A_str]) {
                    currentPairContribution = (modularPower(2, pairFrequencyMap[mapKey_B][negative_mapKey_A_str]) - 1);
                }
            }
            
            // Add contribution from the current pair (A, B)
            currentPairContribution = (currentPairContribution + modularPower(2, pairFrequencyMap[mapKey_A][mapKey_B]));
            finalResult = multiplyMod(finalResult, currentPairContribution % moduloConstant);
        }
    }

    return normalizeModulo(finalResult - 1);
}
