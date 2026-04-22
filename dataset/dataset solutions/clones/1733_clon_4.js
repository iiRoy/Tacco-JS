"use strict";

const dataStream = require("node:fs").readFileSync(0, "utf8").split(/\s+/).filter(Boolean);
let streamPosition = 0;

const obtainNextToken = () => dataStream[streamPosition++];
const convertToNumber = () => Number(obtainNextToken());
const convertToLargeNumber = () => BigInt(obtainNextToken());

const primeModulus = 1000000007;

const calculateProductModulo = (...factorElements) => {
    let accumulatedProduct = BigInt(factorElements[0]);
    const currentMod = BigInt(primeModulus);
    for (let idx = 1; idx < factorElements.length; ++idx) {
        accumulatedProduct = (accumulatedProduct * BigInt(factorElements[idx])) % currentMod;
    }
    return Number(accumulatedProduct);
};

const performModularExponentiation = (baseVal, exponentVal) => {
    if (exponentVal === 0) return 1;
    if (exponentVal % 2 === 1) {
        return calculateProductModulo(baseVal, performModularExponentiation(baseVal, exponentVal - 1));
    } else {
        const halfPowerResult = performModularExponentiation(baseVal, exponentVal / 2);
        return calculateProductModulo(halfPowerResult, halfPowerResult);
    }
};

const findModularInverse = (valueToInvert) => {
    return performModularExponentiation(valueToInvert, primeModulus - 2);
};

let storedFactorials = [];
let storedInverseFactorials = [];

const setupCombinatorialTables = (upperLimit) => {
    storedFactorials.length = upperLimit + 1;
    storedFactorials[0] = storedFactorials[1] = 1;
    for (let num = 2; num <= upperLimit; ++num) {
        storedFactorials[num] = calculateProductModulo(storedFactorials[num - 1], num);
    }

    storedInverseFactorials.length = upperLimit + 1;
    storedInverseFactorials[0] = storedInverseFactorials[1] = 1;
    storedInverseFactorials[upperLimit] = findModularInverse(storedFactorials[upperLimit]);

    for (let num = upperLimit; num > 1; --num) {
        storedInverseFactorials[num - 1] = calculateProductModulo(storedInverseFactorials[num], num);
    }
};

const computeCombinations = (total, choose) => {
    return calculateProductModulo(storedFactorials[total], storedInverseFactorials[choose], storedInverseFactorials[total - choose]);
};

const computePermutations = (total, choose) => {
    return calculateProductModulo(storedFactorials[total], storedInverseFactorials[total - choose]);
};

const sanitizeModuloResult = (value) => {
    return (value % primeModulus + primeModulus) % primeModulus;
};

const operationStartMark = Date.now() + 1900;

const determineHighestBitIndex = (bigIntValue) => {
    if (bigIntValue === 0n) return -1n;
    return BigInt(bigIntValue.toString(2).length - 1);
};

const selectMinimumBigInt = (valA, valB) => {
  return (valA > valB) ? valB : valA;
};

const executeProblemSolution = () => {
    const totalElements = convertToNumber();
    let primaryOperand = convertToLargeNumber();
    let secondaryOperand = convertToLargeNumber();

    let cumulativeXOR = 0n;
    for (let elementCounter = 2; elementCounter < totalElements; elementCounter++) {
        cumulativeXOR ^= convertToLargeNumber();
    }

    const transformRecursively = (currentP, currentS, currentAccumulatedCost) => {
        const currentXORState = currentP ^ currentS ^ cumulativeXOR;

        if (currentXORState === 0n) {
            return currentAccumulatedCost;
        }

        if (currentP === 1n || Date.now() > operationStartMark) {
            return -1n;
        }

        const highestBitPos = determineHighestBitIndex(currentXORState);
        if (highestBitPos === -1n) return currentAccumulatedCost; 
        
        const relevantBitMask = 1n << highestBitPos;

        const transferAmountPrimary = (currentP % relevantBitMask) + 1n;
        const transferAmountSecondary = relevantBitMask - (currentS % relevantBitMask);
        
        const actualTransfer = selectMinimumBigInt(transferAmountPrimary, transferAmountSecondary);

        if (actualTransfer < currentP) {
            return transformRecursively(currentP - actualTransfer, currentS + actualTransfer, currentAccumulatedCost + actualTransfer);
        } else {
            return -1n;
        }
    };

    return transformRecursively(primaryOperand, secondaryOperand, 0n);
};

const finalResult = executeProblemSolution();
if (finalResult !== undefined) {
    console.log(String(finalResult));
}