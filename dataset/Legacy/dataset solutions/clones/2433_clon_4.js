'use strict';
const fileSystemModule = require('fs');

function modularExponentiation(base, exponent, modulus) {
    let resultAccumulator = 1;
    base %= modulus;
    while (exponent > 0) {
        if (exponent % 2 === 1) {
            resultAccumulator = (resultAccumulator * base) % modulus;
        }
        base = (base * base) % modulus;
        exponent = Math.floor(exponent / 2);
    }
    return resultAccumulator;
}

function getModularInverse(numberValue, modulusValue) {
    return modularExponentiation(numberValue, modulusValue - 2, modulusValue);
}

function calculateGridPaths(firstCoordinate, secondCoordinate) {
    const PRIME_MODULUS_VALUE = 10000000007; // Equivalent to 10e9 + 7

    if ((firstCoordinate + secondCoordinate) % 3 !== 0) {
        return 0;
    }

    let pathStepsN = (2 * secondCoordinate - firstCoordinate) / 3;
    let pathStepsM = (2 * firstCoordinate - secondCoordinate) / 3;

    if (pathStepsN < 0 || pathStepsM < 0) {
        return 0;
    }

    let totalMoves = pathStepsN + pathStepsM;

    const factorialSequence = new Array(totalMoves + 1);
    factorialSequence[0] = 1;
    for (let i = 1; i <= totalMoves; i++) {
        factorialSequence[i] = (factorialSequence[i - 1] * i) % PRIME_MODULUS_VALUE;
    }

    let numeratorTerm = factorialSequence[totalMoves];
    let inverseDenominatorK = getModularInverse(factorialSequence[pathStepsN], PRIME_MODULUS_VALUE);
    let inverseDenominatorNM = getModularInverse(factorialSequence[pathStepsM], PRIME_MODULUS_VALUE);

    let finalResult = (numeratorTerm * inverseDenominatorK) % PRIME_MODULUS_VALUE;
    finalResult = (finalResult * inverseDenominatorNM) % PRIME_MODULUS_VALUE;

    return finalResult;
}

function processInputData(inputString) {
    const parsedArguments = inputString.split(/\s/);
    let inputX = parseInt(parsedArguments[0], 10);
    let inputY = parseInt(parsedArguments[1], 10);
    console.log(calculateGridPaths(inputX, inputY));
}

processInputData(fileSystemModule.readFileSync('/dev/stdin', 'utf8'));
