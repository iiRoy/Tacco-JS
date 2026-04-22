'use strict';

const scoreCalculator = (sourceData) => {
    const firstNumericalToken = sourceData.trim().split(/\s+/)[0];
    const numericalValue = Number(firstNumericalToken);

    const intermediateCalculation = Math.floor((numericalValue - 400) / 200);
    const finalResult = 8 - intermediateCalculation;

    return finalResult;
};

const fileSystemUtility = require('fs');
const rawInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');
const processedOutput = scoreCalculator(rawInputContent);
console.log(processedOutput);