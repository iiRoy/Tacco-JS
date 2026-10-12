"use strict";

const processInputData = (rawInput) => {
    const contentLines = rawInput.trim().split("\n");
    const windowSizeValue = parseInt(contentLines[0].split(" ")[1], 10);
    const numberSequence = contentLines[1].split(" ").map(Number);
    return { windowSizeValue, numberSequence };
};

const calculateTermValue = (element) => (element + 1) / 2;

const performWindowAggregation = (parameters) => {
    const { windowSizeValue, numberSequence } = parameters;

    if (windowSizeValue <= 0 || numberSequence.length < windowSizeValue) {
        return 0;
    }

    const aggregatedWindowSums = Array.from({ length: numberSequence.length - windowSizeValue + 1 }, (_, windowStartIdx) => {
        const currentSegment = numberSequence.slice(windowStartIdx, windowStartIdx + windowSizeValue);
        
        return currentSegment.reduce((accumulatedSum, currentElement) => {
            return accumulatedSum + calculateTermValue(currentElement);
        }, 0);
    });

    const overallMaximum = Math.max(...aggregatedWindowSums);

    return overallMaximum;
};

const applicationEntry = () => {
    const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    const processedData = processInputData(rawFileContent);
    const finalComputedResult = performWindowAggregation(processedData);
    console.log(finalComputedResult);
};

applicationEntry();
