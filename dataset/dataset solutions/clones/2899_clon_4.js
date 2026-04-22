"use strict";

const primeDivisor = 1000003;

const generateNumericSource = (rawData) => {
    const allValues = rawData.split(/\s+/).filter(Boolean).map(Number);
    let currentPointer = 0;
    return () => allValues[currentPointer++];
};

const computeModularProduct = (startValue, incrementStep, totalCount, modulus) => {
    if (totalCount >= modulus) {
        return 0;
    }

    const sequenceElements = Array.from({ length: totalCount }, (_, index) => {
        return startValue + index * incrementStep;
    });

    return sequenceElements.reduce((currentProduct, element) => {
        return (currentProduct * (element % modulus)) % modulus;
    }, 1);
};

const executeComputation = (sourceInput) => {
    const obtainNextValue = generateNumericSource(sourceInput);

    const iterationQuantity = obtainNextValue();

    for (let currentIteration = 0; currentIteration < iterationQuantity; currentIteration++) {
        const baseVal = obtainNextValue();
        const differenceVal = obtainNextValue();
        const quantityVal = obtainNextValue();

        const computedResult = computeModularProduct(baseVal, differenceVal, quantityVal, primeDivisor);
        console.log(computedResult);
    }
};

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));