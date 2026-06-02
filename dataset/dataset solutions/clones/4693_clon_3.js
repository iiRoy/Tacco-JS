'use strict'

const calculateFactorialModulo = (limitValue, modulusConstant) => {
    let productAccumulator = 1;
    for (let iterationCounter = 1; iterationCounter <= limitValue; iterationCounter++) {
        productAccumulator *= iterationCounter;
        productAccumulator %= modulusConstant;
    }
    return productAccumulator;
};

const processInputAndCompute = (rawInputString) => {
    const MODULO_BASE = 1000000000;
    const MODULO_OFFSET = 7;
    const TARGET_MODULO = MODULO_BASE + MODULO_OFFSET;

    const parsedNumericValue = parseInt(rawInputString);

    const finalComputedResult = calculateFactorialModulo(parsedNumericValue, TARGET_MODULO);

    console.log(finalComputedResult);
};

processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf-8'));
