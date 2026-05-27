'use strict';

const processInput = (rawData) => {
    const lineSegments = rawData.split('\n');

    const initialConfig = lineSegments[0].split(' ');
    const windowSize = Number(initialConfig[1]);

    const numericValues = lineSegments.slice(1)
                                      .map(entry => Number(entry))
                                      .sort((valA, valB) => valA - valB);

    const rangeCalculations = Array.from({ length: numericValues.length - windowSize + 1 }, (_, startIndex) => {
        const currentWindowEnd = numericValues[startIndex + windowSize - 1];
        const currentWindowStart = numericValues[startIndex];
        return currentWindowEnd - currentWindowStart;
    });

    const finalMinimum = rangeCalculations.reduce((accumulator, currentRange) => Math.min(accumulator, currentRange), Infinity);

    console.log(finalMinimum);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
