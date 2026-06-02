"use strict";

const evaluateCondition = (seriesData, comparisonLimit) => {
    const firstMeasurement = seriesData[0];
    const fifthMeasurement = seriesData[4];
    return fifthMeasurement > comparisonLimit + firstMeasurement;
};

const processInput = inputData => {
    const allLines = inputData.split('\n');
    const finalValue = Number(allLines.pop());
    const numericSeries = allLines.map(Number);
    
    const resultFlag = evaluateCondition(numericSeries, finalValue);
    
    const messageRegistry = new Map();
    messageRegistry.set(true, ":(");
    messageRegistry.set(false, "Yay!");
    
    console.log(messageRegistry.get(resultFlag));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
