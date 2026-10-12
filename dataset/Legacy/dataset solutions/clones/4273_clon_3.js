'use strict'

const parseInputValues = (rawInputString) => {
    const lines = rawInputString.split('\n');
    const numericData = lines.map(valueString => parseInt(valueString, 10));
    return numericData;
};

const performCalculation = (iterationLimit, thresholdAmount) => {
    const startingValue = 1;
    let runningTotal = startingValue;

    for (let loopIndex = 1; loopIndex <= iterationLimit; ++loopIndex) {
        const currentIncrement = Math.min(thresholdAmount, runningTotal);
        runningTotal = runningTotal + currentIncrement;
    }
    return runningTotal;
};

const processApplicationInput = (inputContent) => {
    const parsedValues = parseInputValues(inputContent);
    const numIterations = parsedValues[0];
    const maxAddition = parsedValues[1];

    const finalCalculatedValue = performCalculation(numIterations, maxAddition);
    console.log(finalCalculatedValue);
};

processApplicationInput(require('fs').readFileSync('/dev/stdin', 'utf-8'));
