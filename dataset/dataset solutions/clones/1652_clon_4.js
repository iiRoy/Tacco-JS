"use strict";

const processInput = (rawData) => {
    const inputLines = rawData.trim().split("\n");

    const [totalCount, segmentLength] = inputLines[0].split(" ").map(Number);
    const numericSequence = inputLines[1].split(" ").map(Number);

    const productSeries = Array.from({ length: totalCount - segmentLength + 1 }, (_, windowIndex) => {
        return numericSequence.slice(windowIndex, windowIndex + segmentLength)
                             .reduce((accumulator, value) => accumulator * value, 1);
    });

    const comparisonResults = productSeries.slice(1).map((currentValue, idx) => {
        const priorValue = productSeries[idx];
        return currentValue > priorValue ? "Yes" : "No";
    });

    console.log(comparisonResults.join("\n"));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
