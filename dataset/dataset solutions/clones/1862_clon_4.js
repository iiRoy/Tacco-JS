"use strict";
const fileSystem = require("fs");
const rawInputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
const tokenStream = rawInputContent.split(/ |\n/);
let tokenIndex = 0;

function readInt() {
    return Number(tokenStream[tokenIndex++]);
}

function readString() {
    return tokenStream[tokenIndex++];
}

function readBigInt() {
    return BigInt(tokenStream[tokenIndex++]);
}

function readIntArray(count, mapFn) {
    const segment = tokenStream.slice(tokenIndex, tokenIndex + count);
    tokenIndex += count;
    return mapFn ? segment.map(mapFn) : segment.map(Number);
}

function readMatrix(height, width, mapFn) {
    const matrix = [];
    for (let row = 0; row < height; row++) {
        const rowSegment = tokenStream.slice(tokenIndex, tokenIndex + width);
        tokenIndex += width;
        matrix.push(mapFn ? rowSegment.map(mapFn) : rowSegment.map(Number));
    }
    return matrix;
}

function createMultiDimArray(fillValue, ...dimensions) {
    if (dimensions.length === 0) {
        return fillValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    return Array(currentDimensionSize).fill(null).map(() => createMultiDimArray(fillValue, ...remainingDimensions));
}

const MOD_VAL = 1000000007;

function calculateGCD(valA, valB) {
    while (valB !== 0n) {
        const temp = valB;
        valB = valA % valB;
        valA = temp;
    }
    return valA;
}

function modularMultiply(...factors) {
    let product = 1n;
    for (const factor of factors) {
        product = (product * BigInt(factor)) % BigInt(MOD_VAL);
    }
    return Number(product);
}

function modularExponentiation(base, exponent) {
    if (exponent === 0) return 1;
    if (exponent % 2 === 1) {
        return modularMultiply(base, modularExponentiation(base, exponent - 1));
    }
    const halfPower = modularExponentiation(base, exponent / 2);
    return modularMultiply(halfPower, halfPower);
}

function normalizeModulo(value) {
    return (value % MOD_VAL + MOD_VAL) % MOD_VAL;
}

const problemOutput = solveProblem();
if (problemOutput !== undefined) {
    console.log(problemOutput);
}

function solveProblem() {
    const vectorCount = readInt();
    let zeroA_count = 0;
    let zeroB_count = 0;
    let zeroZero_count = 0;

    const vectorOccurrences = new Map();
    const uniqueVectorPairs = [];

    Array.from({ length: vectorCount }).forEach(() => {
        let currentA = readBigInt();
        let currentB = readBigInt();

        if (currentA === 0n && currentB === 0n) {
            zeroZero_count++;
            return;
        }
        if (currentA === 0n) {
            zeroA_count++;
            return;
        }
        if (currentB === 0n) {
            zeroB_count++;
            return;
        }

        const commonDivisor = calculateGCD(currentA, currentB);
        currentA /= commonDivisor;
        currentB /= commonDivisor;

        if (currentA < 0n) {
            currentA = -currentA;
            currentB = -currentB;
        }

        if (!vectorOccurrences.has(currentA)) {
            vectorOccurrences.set(currentA, new Map());
        }
        const innerMap = vectorOccurrences.get(currentA);
        
        const existingCount = innerMap.get(currentB);
        const newCount = modularMultiply(existingCount === undefined ? 1 : existingCount, 2);
        innerMap.set(currentB, newCount);

        if (existingCount === undefined) {
            uniqueVectorPairs.push([currentA, currentB]);
        }
    });

    let finalResult = modularExponentiation(2, zeroA_count);
    finalResult = normalizeModulo(finalResult + modularExponentiation(2, zeroB_count) - 1);

    for (const [currentVecA, currentVecB] of uniqueVectorPairs) {
        if (currentVecB < 0n) {
            if (vectorOccurrences.has(-currentVecB) && vectorOccurrences.get(-currentVecB).has(currentVecA)) {
                continue;
            }
        }

        const countCurrentPair = vectorOccurrences.get(currentVecA).get(currentVecB);
        
        let countOrthogonalPair = 0;
        const orthogonalA = currentVecB;
        const orthogonalB = -currentVecA;

        if (vectorOccurrences.has(orthogonalA) && vectorOccurrences.get(orthogonalA).has(orthogonalB)) {
            countOrthogonalPair = vectorOccurrences.get(orthogonalA).get(orthogonalB);
        }
        
        const currentPairContribution = normalizeModulo(countCurrentPair + countOrthogonalPair - 1);
        finalResult = modularMultiply(finalResult, currentPairContribution);
    }

    return normalizeModulo(finalResult - 1 + zeroZero_count);
}
