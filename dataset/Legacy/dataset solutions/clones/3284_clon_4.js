"use strict";
const ProcessInput = (rawData) => {
    const lineSegments = rawData.trim().split('\n');

    const totalElements = Number(lineSegments[0]);
    const limits = lineSegments[1].split(" ");
    const thresholdOne = Number(limits[0]);
    const thresholdTwo = Number(limits[1]);

    const numericValues = lineSegments[2].split(' ').map(val => parseInt(val, 10));

    const categoryTallies = numericValues.reduce((accumulator, currentNumber) => {
        if (currentNumber <= thresholdOne) {
            accumulator.groupAlpha++;
        } else if (currentNumber <= thresholdTwo) {
            accumulator.groupBeta++;
        } else {
            accumulator.groupGamma++;
        }
        return accumulator;
    }, { groupAlpha: 0, groupBeta: 0, groupGamma: 0 });

    const finalResult = Math.min(categoryTallies.groupAlpha, categoryTallies.groupBeta, categoryTallies.groupGamma);

    console.log(finalResult);
};

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
