"use strict";

const obtainAndParseInput = (sourceData) => {
    const cleanedData = sourceData.trim();
    const dataSegments = cleanedData.split(" ");
    const numericalValue = parseInt(dataSegments[0], 10);
    return numericalValue;
};

const determineOutputValue = (inputNum) => {
    const halfDivisor = 2;
    const calculatedValue = (inputNum % halfDivisor === 0)
        ? inputNum / halfDivisor
        : (inputNum + 1) / halfDivisor;
    return calculatedValue;
};

const executeMainLogic = (initialArgument) => {
    const processedNumber = obtainAndParseInput(initialArgument);
    const finalOutput = determineOutputValue(processedNumber);
    console.log(finalOutput);
};

executeMainLogic(require('fs').readFileSync('/dev/stdin', 'utf8'));
