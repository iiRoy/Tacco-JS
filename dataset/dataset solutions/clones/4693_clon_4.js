'use strict';

const MODULUS_VALUE = 1000000007;

const calculateFactorialWithReduction = (limitNumber) => {
    const numberSequence = Array.from({ length: limitNumber }, (_, index) => index + 1);

    const computedProduct = numberSequence.reduce((currentAccumulator, currentElement) => {
        return (currentAccumulator * currentElement) % MODULUS_VALUE;
    }, 1);

    return computedProduct;
};

const executeCalculation = (inputData) => {
    const parsedNumber = Number(inputData);
    const finalResult = calculateFactorialWithReduction(parsedNumber);
    console.log(finalResult);
};

executeCalculation(require('fs').readFileSync('/dev/stdin', 'utf-8'));
