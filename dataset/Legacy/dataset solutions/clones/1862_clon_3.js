"use strict";

// --- Input Reading Utilities ---
const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenStream = fileContent.split(/ |\n/);
let tokenIndex = 0;

function readNextToken() {
    return tokenStream[tokenIndex++];
}

function readInt() {
    return +readNextToken();
}

function readString() {
    return readNextToken();
}

function readBigInt() {
    return BigInt(readNextToken());
}

function readInts(count, mapToNumber) {
    const values = tokenStream.slice(tokenIndex, tokenIndex += count);
    return mapToNumber ? values : values.map(val => +val);
}

function readMatrix(height, width, asStrings) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; rowIdx++) {
        const row = tokenStream.slice(tokenIndex, tokenIndex += width);
        resultMatrix.push(asStrings ? row : row.map(val => +val));
    }
    return resultMatrix;
}

function createMultiDimArray(initialValue) {
    const args = arguments;
    let argCount = args.length;
    let arrayCreationString = "Array(args[" + --argCount + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argCount) {
        arrayCreationString = "Array(args[" + argCount + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// --- Math Utilities ---
function greatestCommonDivisor(valA, valB) {
    return valB ? greatestCommonDivisor(valB, valA % valB) : valA;
}

const MODULUS_VAL = 1e9 + 7;

function modularMultiply() {
    const factors = arguments;
    let productAccumulator = factors[0];
    for (let factorIndex = factors.length; --factorIndex;) {
        // This specific multiplication prevents overflow for numbers up to MODULUS_VAL
        // before applying modulo, as (A*B) can exceed Number.MAX_SAFE_INTEGER.
        // It splits numbers into 16-bit parts.
        productAccumulator = ((productAccumulator >> 16) * factors[factorIndex] % MODULUS_VAL * 65536 + (productAccumulator & 65535) * factors[factorIndex]) % MODULUS_VAL;
    }
    return productAccumulator;
}

function modularPower(baseVal, exponentVal) {
    let resultVal = 1;
    while (exponentVal) {
        if (exponentVal & 1) {
            resultVal = modularMultiply(baseVal, resultVal);
        }
        baseVal = modularMultiply(baseVal, baseVal);
        exponentVal >>= 1;
    }
    return resultVal;
}

const getPositiveModulo = (val) => (val % MODULUS_VAL + MODULUS_VAL) % MODULUS_VAL;

// --- Main Logic ---
const finalResult = solveProblem();
if (finalResult !== undefined) {
    console.log(finalResult);
}

function normalizePair(valA, valB) {
    if (valA < 0n) {
        valA = -valA;
        valB = -valB;
    }
    return [valA, valB];
}

function solveProblem() {
    const numPairs = readInt();
    let zeroA_count = 0; // Count of pairs (0, X) where X != 0
    let zeroB_count = 0; // Count of pairs (X, 0) where X != 0
    let zeroZero_count = 0; // Count of pairs (0, 0)

    const pairCountsMap = {}; // Stores counts for normalized (a,b) pairs
    const uniquePairsList = []; // Stores unique normalized [a,b] pairs encountered

    for (let pairIdx = 0; pairIdx < numPairs; pairIdx++) {
        let currentA = readBigInt();
        let currentB = readBigInt();

        if (currentA === 0n && currentB === 0n) {
            zeroZero_count++;
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

        const [normalizedA, normalizedB] = normalizePair(currentA, currentB);

        const normalizedA_str = normalizedA.toString();
        const normalizedB_str = normalizedB.toString();

        let nestedMap = pairCountsMap[normalizedA_str];

        if (!nestedMap) {
            nestedMap = {};
            pairCountsMap[normalizedA_str] = nestedMap;
            nestedMap[normalizedB_str] = 2;
            uniquePairsList.push([normalizedA, normalizedB]);
        } else {
            if (nestedMap[normalizedB_str]) {
                nestedMap[normalizedB_str] = modularMultiply(nestedMap[normalizedB_str], 2);
            } else {
                nestedMap[normalizedB_str] = 2;
                uniquePairsList.push([normalizedA, normalizedB]);
            }
        }
    }

    let totalCombinations = modularPower(2, zeroA_count) + modularPower(2, zeroB_count) - 1;

    for (const pairEntry of uniquePairsList) {
        const [currentA, currentB] = pairEntry;
        let tempSum = 0;

        const currentA_str = currentA.toString();
        const currentB_str = currentB.toString();

        // If currentB is negative, and its "perpendicular" pair (-currentB, currentA) exists,
        // we skip this pair to avoid double counting. The perpendicular pair will be processed.
        if (currentB < 0n) {
            const negB_str = (-currentB).toString();
            if (pairCountsMap[negB_str] && pairCountsMap[negB_str][currentA_str]) {
                continue;
            }
        }
        // If currentB is positive, check if its "perpendicular" pair (currentB, -currentA) exists.
        // If it does, add its count (minus 1) to tempSum.
        else { // currentB >= 0n
            const negA_str = (-currentA).toString();
            const perpendicularMap = pairCountsMap[currentB_str];
            if (perpendicularMap && perpendicularMap[negA_str]) {
                tempSum = perpendicularMap[negA_str] - 1;
            }
        }

        // Add the count for the current pair (currentA, currentB)
        tempSum += pairCountsMap[currentA_str][currentB_str];

        totalCombinations = modularMultiply(totalCombinations, getPositiveModulo(tempSum));
    }

    return getPositiveModulo(totalCombinations - 1 + zeroZero_count);
}
