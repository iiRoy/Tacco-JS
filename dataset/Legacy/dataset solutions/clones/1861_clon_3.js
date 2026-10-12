"use strict";

// Input parsing utilities
var rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenBuffer = rawInputData.split(/ |\n/);
var currentTokenIndex = 0;

function readNextNumber() {
    return +tokenBuffer[currentTokenIndex++];
}

function readNextString() {
    return tokenBuffer[currentTokenIndex++];
}

function readNextBigInt() {
    return BigInt(tokenBuffer[currentTokenIndex++]);
}

function readNumberArray(count, returnStrings) {
    return returnStrings ? tokenBuffer.slice(currentTokenIndex, currentTokenIndex += count) : tokenBuffer.slice(currentTokenIndex, currentTokenIndex += count).map(val => +val);
}

function readNumberMatrix(height, width, returnStrings) {
    var resultMatrix = [];
    var rowIdx = 0;
    if (returnStrings) {
        for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenBuffer.slice(currentTokenIndex, currentTokenIndex += width));
    } else {
        for (; rowIdx < height; rowIdx++) resultMatrix.push(tokenBuffer.slice(currentTokenIndex, currentTokenIndex += width).map(val => +val));
    }
    return resultMatrix;
}

// Multi-dimensional array initialization (preserving original eval structure)
function initializeMultiDimArray(initialValue) {
    var args = arguments;
    var argLength = args.length;
    var arrayCreationString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
    while (--argLength) {
        arrayCreationString = "Array(args[" + argLength + "]).fill().map(x=>" + arrayCreationString + ")";
    }
    return eval(arrayCreationString);
}

// Mathematical utilities
function calculateGCD(valA, valB) {
    while (valB !== 0n) {
        let temp = valB;
        valB = valA % valB;
        valA = temp;
    }
    return valA;
}

var MODULUS_VALUE = 1e9 + 7;

function modularMultiply(factorA, factorB) {
    // Optimized multiplication to prevent overflow before modulo for Number types
    return ((factorA >> 16) * factorB % MODULUS_VALUE * 65536 + (factorA & 65535) * factorB) % MODULUS_VALUE;
}

function modularPower(base, exponent) {
    let result = 1;
    let currentBase = base;
    while (exponent > 0) {
        if (exponent & 1) {
            result = modularMultiply(currentBase, result);
        }
        currentBase = modularMultiply(currentBase, currentBase);
        exponent >>= 1;
    }
    return result;
}

function normalizeModulo(value) {
    return (value % MODULUS_VALUE + MODULUS_VALUE) % MODULUS_VALUE;
}

// Main program execution
var programOutput = runMainLogic();
if (programOutput !== undefined) {
    console.log(programOutput);
}

function runMainLogic() {
    let pairCount = readNextNumber();
    let zeroA_onlyCount = 0;
    let zeroB_onlyCount = 0;
    let bothZeroCount = 0;
    let fractionFrequencyMap = {}; // Stores counts of normalized (numerator, denominator) pairs

    for (let loopIdx = 0; loopIdx < pairCount; loopIdx++) {
        let numeratorVal = readNextBigInt();
        let denominatorVal = readNextBigInt();

        if (numeratorVal === 0n && denominatorVal === 0n) {
            bothZeroCount++;
            continue;
        }
        if (numeratorVal === 0n) {
            zeroA_onlyCount++;
            continue;
        }
        if (denominatorVal === 0n) {
            zeroB_onlyCount++;
            continue;
        }

        let commonDivisor = calculateGCD(numeratorVal, denominatorVal);
        numeratorVal /= commonDivisor;
        denominatorVal /= commonDivisor;

        // Ensure numerator is positive; adjust denominator accordingly
        if (numeratorVal < 0n) {
            numeratorVal = -numeratorVal;
            denominatorVal = -denominatorVal;
        }

        const currentNumeratorKey = numeratorVal.toString();
        const currentDenominatorKey = denominatorVal.toString();

        // Update frequency map for the normalized fraction
        if (!fractionFrequencyMap.hasOwnProperty(currentNumeratorKey)) {
            fractionFrequencyMap[currentNumeratorKey] = {};
        }
        let innerDenominatorMap = fractionFrequencyMap[currentNumeratorKey];

        if (innerDenominatorMap.hasOwnProperty(currentDenominatorKey)) {
            innerDenominatorMap[currentDenominatorKey] = modularMultiply(innerDenominatorMap[currentDenominatorKey], 2);
        } else {
            innerDenominatorMap[currentDenominatorKey] = 2;
        }
    }

    // Calculate the final answer based on counts and fraction pairs
    let currentFinalAnswer = modularPower(2, zeroA_onlyCount);
    currentFinalAnswer = (currentFinalAnswer + modularPower(2, zeroB_onlyCount)) % MODULUS_VALUE;
    currentFinalAnswer = (currentFinalAnswer - 1 + MODULUS_VALUE) % MODULUS_VALUE; // Ensure result is non-negative

    const allNumeratorKeys = Object.keys(fractionFrequencyMap);
    for (const currentNumeratorKey of allNumeratorKeys) {
        const denominatorMap = fractionFrequencyMap[currentNumeratorKey];
        const allDenominatorKeys = Object.keys(denominatorMap);

        for (const currentDenominatorKey of allDenominatorKeys) {
            let tempAccumulator = 0;

            // Logic to handle complementary fraction pairs (e.g., (A/B) and (B/-A))
            // If currentDenominatorKey is negative (e.g., "-2"), check if its positive counterpart
            // (e.g., "2") exists as a numerator key with currentNumeratorKey (e.g., "1") as its denominator.
            // If such a complementary pair exists, skip processing the current (numerator, negative_denominator) pair
            // to avoid double counting or incorrect combinations.
            if (Number(currentDenominatorKey) < 0) {
                const positiveDenominatorKey = currentDenominatorKey.slice(1); // e.g., "-2" -> "2"
                if (fractionFrequencyMap.hasOwnProperty(positiveDenominatorKey) &&
                    fractionFrequencyMap[positiveDenominatorKey].hasOwnProperty(currentNumeratorKey)) {
                    continue; // Skip this pair as its "complementary" positive-denominator version is handled
                }
            } else {
                // If currentDenominatorKey is positive, check for its "opposite" (denominator, -numerator) pair.
                // If it exists, add its count-1 to tempAccumulator.
                const negativeNumeratorKey = "-" + currentNumeratorKey; // e.g., "1" -> "-1"
                if (fractionFrequencyMap.hasOwnProperty(currentDenominatorKey) &&
                    fractionFrequencyMap[currentDenominatorKey].hasOwnProperty(negativeNumeratorKey)) {
                    tempAccumulator = (fractionFrequencyMap[currentDenominatorKey][negativeNumeratorKey] - 1 + MODULUS_VALUE) % MODULUS_VALUE;
                }
            }
            
            // Add the count of the current fraction pair to the accumulator
            tempAccumulator = (tempAccumulator + denominatorMap[currentDenominatorKey]) % MODULUS_VALUE;
            
            // Multiply the running total by the accumulated value for this fraction pair
            currentFinalAnswer = modularMultiply(currentFinalAnswer, tempAccumulator);
        }
    }
    
    // Final adjustment and normalization
    return normalizeModulo(currentFinalAnswer - 1 + bothZeroCount);
}
