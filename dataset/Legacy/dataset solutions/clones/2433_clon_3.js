'use strict';

const fs = require('fs');

let factorialValues = [];
let modularInverse = [];
let inverseFactorial = [];

const performModularMultiplication = (valA, valB, modulus) => {
    return (valA * valB) % modulus;
};

function prepareCombinatoricsTables(maxVal, currentModulus) {
    factorialValues[0] = 1;
    factorialValues[1] = 1;

    inverseFactorial[0] = 1;
    inverseFactorial[1] = 1;

    modularInverse[1] = 1;

    for (let index = 2; index <= maxVal; ++index) {
        const remainderOfMod = currentModulus % index;
        const divisionQuotient = currentModulus / index;

        const intermediateInverseTerm = performModularMultiplication(modularInverse[remainderOfMod], divisionQuotient, currentModulus);
        modularInverse[index] = (currentModulus - intermediateInverseTerm) % currentModulus;

        factorialValues[index] = performModularMultiplication(factorialValues[index - 1], index, currentModulus);

        inverseFactorial[index] = performModularMultiplication(inverseFactorial[index - 1], modularInverse[index], currentModulus);
    }
}

function computeModularCombination(totalElements, elementsToChoose, currentModulus) {
    if (totalElements < elementsToChoose || elementsToChoose < 0) {
        return 0;
    }

    const invFactorialK = inverseFactorial[elementsToChoose];
    const invFactorialNMinusK = inverseFactorial[totalElements - elementsToChoose];

    const combinedInverseProduct = performModularMultiplication(invFactorialK, invFactorialNMinusK, currentModulus);

    return performModularMultiplication(factorialValues[totalElements], combinedInverseProduct, currentModulus);
}

function calculateGridPaths(inputXCoord, inputYCoord) {
    const largePrimeModulus = 10e9 + 7;

    if ((inputXCoord + inputYCoord) % 3 !== 0) {
        return 0;
    }

    const derivedNSteps = (2 * inputYCoord - inputXCoord) / 3;
    const derivedMSteps = (2 * inputXCoord - inputYCoord) / 3;

    if (derivedNSteps < 0 || derivedMSteps < 0) {
        return 0;
    }

    const totalSteps = derivedNSteps + derivedMSteps;

    prepareCombinatoricsTables(totalSteps, largePrimeModulus);

    const finalPathCount = computeModularCombination(totalSteps, derivedNSteps, largePrimeModulus);

    return finalPathCount;
}

function executeProgram(rawInputString) {
    const parsedInputTokens = rawInputString.split(/\s+/);

    const parsedX = parseInt(parsedInputTokens[0], 10);
    const parsedY = parseInt(parsedInputTokens[1], 10);

    const computedResult = calculateGridPaths(parsedX, parsedY);

    console.log(computedResult);
}

executeProgram(fs.readFileSync('/dev/stdin', 'utf8'));
