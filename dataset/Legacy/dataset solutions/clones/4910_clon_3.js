'use strict'
const processInput = rawInputData => {
    const inputLines = rawInputData.trim().split("\n");
    const firstLineParts = inputLines[0].split(' ');

    const numIterations = parseInt(firstLineParts[0], 10);
    const initialValue = parseInt(firstLineParts[1], 10);

    const multiplierFactor = initialValue - 1;

    let computedResult = initialValue;

    const calculateIterativeProduct = (startingValue, iterationsCount, factor) => {
        let currentProduct = startingValue;
        for (let loopIndex = 1; loopIndex < iterationsCount; loopIndex++) {
            currentProduct *= factor;
        }
        return currentProduct;
    };

    computedResult = calculateIterativeProduct(computedResult, numIterations, multiplierFactor);

    console.log(computedResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
