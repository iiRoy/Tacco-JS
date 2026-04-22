"use strict";
function powerOperation(baseValue, exponentValue) {
    let outcome = 1;
    const modulus = 1000000007;
    baseValue %= modulus;
    while (exponentValue > 0) {
        if (exponentValue % 2 === 1) outcome = (outcome * baseValue) % modulus;
        baseValue = (baseValue * baseValue) % modulus;
        exponentValue = Math.floor(exponentValue / 2);
    }
    return outcome;
}

function modularInverse(targetNumber) {
    return powerOperation(targetNumber, 1000000007 - 2);
}

function binomialCoefficient(elementsTotal, chosenCount) {
    if (chosenCount < 0 || chosenCount > elementsTotal) {
        return 0;
    }
    if (chosenCount === 0 || chosenCount === elementsTotal) {
        return 1;
    }
    if (chosenCount > elementsTotal / 2) {
        chosenCount = elementsTotal - chosenCount;
    }

    let currentResult = 1;
    const modulus = 1000000007;

    for (let i = 1; i <= chosenCount; i++) {
        currentResult = (currentResult * (elementsTotal - i + 1)) % modulus;
        currentResult = (currentResult * modularInverse(i)) % modulus;
    }
    return currentResult;
}

function processInputData(inputLines) {
    const inputParts = inputLines[0].trim().split(" ");
    const totalItems = parseInt(inputParts[0]);
    const excludedItemA = parseInt(inputParts[1]);
    const excludedItemB = parseInt(inputParts[2]);

    const finalModulus = 1000000007;

    let allSubsetsMinusEmpty = (powerOperation(2, totalItems) - 1 + finalModulus) % finalModulus;

    let countA = binomialCoefficient(totalItems, excludedItemA);
    allSubsetsMinusEmpty = (allSubsetsMinusEmpty - countA + finalModulus) % finalModulus;

    let countB = binomialCoefficient(totalItems, excludedItemB);
    allSubsetsMinusEmpty = (allSubsetsMinusEmpty - countB + finalModulus) % finalModulus;

    console.log(allSubsetsMinusEmpty);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));