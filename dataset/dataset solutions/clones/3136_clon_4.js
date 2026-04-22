'use strict';

const getNumberFromChars = (characterStream) => {
    let currentNumberAccumulator = 0;
    for (let currentIdx = 0; currentIdx < characterStream.length; currentIdx++) {
        currentNumberAccumulator = currentNumberAccumulator * 10 + (characterStream.charCodeAt(currentIdx) - '0'.charCodeAt(0));
    }
    return currentNumberAccumulator;
};

const calculateDifference = (operandOne, operandTwo) => {
    if (operandTwo === 0) return operandOne;
    if (operandTwo > 0) return calculateDifference(operandOne - 1, operandTwo - 1);
    return calculateDifference(operandOne + 1, operandTwo + 1);
};

const calculateProduct = (factorX, factorY) => {
    if (factorY === 0) return 0;
    if (factorY < 0) return calculateProduct(calculateDifference(0, factorX), calculateDifference(0, factorY));
    return factorX + calculateProduct(factorX, calculateDifference(factorY, 1));
};

const processAndCompute = (rawInputText) => {
    const digitSequences = rawInputText.match(/\d+/g);
    const numericalRepresentations = digitSequences.map(getNumberFromChars);

    const outerDimensionAlpha = numericalRepresentations[0];
    const outerDimensionBeta = numericalRepresentations[1];
    const innerDimensionAlpha = numericalRepresentations[2];
    const innerDimensionBeta = numericalRepresentations[3];

    const diffAlpha = calculateDifference(outerDimensionAlpha, innerDimensionAlpha);
    const diffBeta = calculateDifference(outerDimensionBeta, innerDimensionBeta);

    return calculateProduct(diffAlpha, diffBeta);
};

const fileSystemAccess = globalThis.require('fs');
const inputContent = fileSystemAccess.readFileSync('/dev/stdin', 'utf8');

globalThis.console.log(processAndCompute(inputContent));