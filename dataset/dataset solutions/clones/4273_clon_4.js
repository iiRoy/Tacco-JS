'use strict'

const processInputAndCalculate = (rawData) => {
    const numericValues = rawData.split('\n').map(Number);
    const iterationLimit = numericValues[0];
    const growthConstant = numericValues[1];

    if (growthConstant === 1) {
        return 1 + iterationLimit;
    }

    let currentAccumulation = 1;
    let stepsTaken = 0;

    while (currentAccumulation < growthConstant && stepsTaken < iterationLimit) {
        currentAccumulation *= 2;
        stepsTaken++;
    }

    if (stepsTaken === iterationLimit) {
        return currentAccumulation;
    } else {
        const remainingSteps = iterationLimit - stepsTaken;
        return currentAccumulation + (remainingSteps * growthConstant);
    }
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf-8');
console.log(processInputAndCalculate(inputData));
