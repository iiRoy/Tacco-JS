"use strict";
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const tokenizedInput = rawInputData.split(/ |\n/);
let currentTokenIdx = 0;

function retrieveNumber() {
    return +tokenizedInput[currentTokenIdx++];
}

function retrieveString() {
    return tokenizedInput[currentTokenIdx++];
}

function retrieveBigInt() {
    return BigInt(tokenizedInput[currentTokenIdx++]);
}

function retrieveNumberSequence(count, asStrings) {
    const start = currentTokenIdx;
    currentTokenIdx += count;
    return asStrings ? tokenizedInput.slice(start, currentTokenIdx) : tokenizedInput.slice(start, currentTokenIdx).map(val => +val);
}

function retrieveSortedNumberSequence(numElements, descending) {
    const startIndex = currentTokenIdx;
    currentTokenIdx += numElements;
    const numbers = tokenizedInput.slice(startIndex, currentTokenIdx).map(val => +val);
    return descending ? numbers.sort((valA, valB) => valB - valA) : numbers.sort((valA, valB) => valA - valB);
}

function retrieveMatrix(height, width, asStrings) {
    const resultMatrix = [];
    for (let rowIdx = 0; rowIdx < height; ++rowIdx) {
        const rowStart = currentTokenIdx;
        currentTokenIdx += width;
        resultMatrix.push(asStrings ? tokenizedInput.slice(rowStart, currentTokenIdx) : tokenizedInput.slice(rowStart, currentTokenIdx).map(val => +val));
    }
    return resultMatrix;
}

const outputLines = [];
function recordOutput(content) {
    outputLines.push(content);
}

const primeModulus = 1000000007;

function modularProduct() {
    const factors = arguments;
    let currentProduct = factors[0];
    for (let factorIndex = 1; factorIndex < factors.length; ++factorIndex) {
        const nextFactor = factors[factorIndex];
        // This specific modular multiplication handles potential overflow for intermediate products
        // (currentProduct * nextFactor) before taking modulo, if currentProduct and nextFactor are large.
        currentProduct = (((currentProduct >>> 16) * nextFactor) % primeModulus * 65536 + (currentProduct & 65535) * nextFactor) % primeModulus;
    }
    return currentProduct;
}

const precomputedFactorials = [];
const precomputedInvFactorials = [];

function precomputeCombinatorics(limit) {
    precomputedFactorials.length = limit + 1;
    precomputedFactorials[0] = precomputedFactorials[1] = 1;
    for (let val = 2; val <= limit; ++val) {
        precomputedFactorials[val] = modularProduct(precomputedFactorials[val - 1], val);
    }

    precomputedInvFactorials.length = limit + 1;
    precomputedInvFactorials[0] = precomputedInvFactorials[1] = 1;
    precomputedInvFactorials[limit] = calculateModularInverse(precomputedFactorials[limit]);
    for (let val = limit; val > 1; --val) {
        precomputedInvFactorials[val - 1] = modularProduct(precomputedInvFactorials[val], val);
    }
}

function calculateModularInverse(divisor) {
    let dividend = primeModulus;
    let inverseU = 0;
    let inverseV = 1;
    let tempVal;
    while (divisor) {
        tempVal = dividend / divisor | 0; // Integer division
        dividend -= tempVal * divisor;
        inverseU -= tempVal * inverseV;

        // Swap (dividend, divisor) and (inverseU, inverseV)
        tempVal = dividend;
        dividend = divisor;
        divisor = tempVal;

        tempVal = inverseU;
        inverseU = inverseV;
        inverseV = tempVal;
    }
    inverseU %= primeModulus;
    return inverseU < 0 ? inverseU + primeModulus : inverseU;
}

function calculateModularPower(base, exponent) {
    let resultPower = 1;
    let currentBase = base;
    while (exponent > 0) {
        if (exponent & 1) { // If exponent is odd
            resultPower = modularProduct(currentBase, resultPower);
        }
        currentBase = modularProduct(currentBase, currentBase);
        exponent >>= 1; // Divide exponent by 2
    }
    return resultPower;
}

function getCombinations(total, choose) {
    return modularProduct(precomputedFactorials[total], precomputedInvFactorials[choose], precomputedInvFactorials[total - choose]);
}

function getPermutations(total, choose) {
    return modularProduct(precomputedFactorials[total], precomputedInvFactorials[total - choose]);
}

function ensurePositiveModulo(value) {
    return (value % primeModulus + primeModulus) % primeModulus;
}


const finalResult = processMainLogic();
if (finalResult !== undefined) console.log(String(finalResult));
if (outputLines.length) console.log(outputLines.join("\n"));

function processMainLogic() {
    const targetValue = retrieveNumber();
    const waysToSum = new Array(targetValue + 1).fill(0);

    // Base case: There is 1 way to sum to 0 (by taking no numbers).
    waysToSum[0] = 1;

    // The problem asks for partitions into parts >= 3.
    // Let dp[k] be the number of ways to sum to k using parts >= 3.
    // The original DP computes: dp[k] = sum(dp[k-j]) for j from 3 to k.
    // This can be rewritten as a linear recurrence:
    // dp[k] = dp[k-1] + dp[k-3] for k >= 3.
    //
    // Base cases for this recurrence:
    // dp[0] = 1 (one way to make sum 0: take no numbers)
    // dp[1] = 0 (cannot form 1 with parts >= 3)
    // dp[2] = 0 (cannot form 2 with parts >= 3)

    // Explicitly set base cases for k=1 and k=2 if targetValue allows
    if (targetValue >= 1) waysToSum[1] = 0;
    if (targetValue >= 2) waysToSum[2] = 0;

    // Compute dp values using the derived recurrence relation
    for (let currentSum = 3; currentSum <= targetValue; ++currentSum) {
        waysToSum[currentSum] = (waysToSum[currentSum - 1] + waysToSum[currentSum - 3]) % primeModulus;
    }

    return waysToSum[targetValue];
}
