'use strict';

function determineOptimalPathValue(totalElements, heightSequence, valueSequence) {
    const calculationCache = new Map();

    const computePathValue = (idx) => {
        if (calculationCache.has(idx)) {
            return calculationCache.get(idx);
        }

        const currentValue = valueSequence[idx];
        const currentHeight = heightSequence[idx];
        
        const maxPreviousPathValue = Array.from({ length: idx }, (_, prevIdx) => prevIdx)
            .reduce((maxSoFar, prevIdx) => {
                if (currentHeight > heightSequence[prevIdx]) {
                    return Math.max(maxSoFar, computePathValue(prevIdx));
                }
                return maxSoFar;
            }, 0);

        const finalValueForCurrentPath = currentValue + maxPreviousPathValue;
        calculationCache.set(idx, finalValueForCurrentPath);
        return finalValueForCurrentPath;
    };

    const allPathEndValues = Array.from({ length: totalElements }, (_, i) => computePathValue(i));
    const overallHighestScore = Math.max(...allPathEndValues);

    return overallHighestScore;
}

function processInputAndDisplayResult(rawData) {
    const dataLines = rawData.split("\n");
    const elementCount = parseInt(dataLines[0]);
    const heightData = dataLines[1].split(' ').map(str => parseInt(str));
    const valueData = dataLines[2].split(' ').map(str => parseInt(str));

    const finalAnswer = determineOptimalPathValue(elementCount, heightData, valueData);
    console.log(finalAnswer);
}

processInputAndDisplayResult(require('node:fs').readFileSync('/dev/stdin', 'utf8'));