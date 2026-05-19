"use strict";

const processSequenceQueries = (inputData) => {
    const inputLines = inputData.split("\n");

    const [sequenceLength, queryCount] = inputLines[0].split(" ").map(Number);
    const charSequence = inputLines[1];
    
    const queryRanges = inputLines.slice(2, 2 + queryCount).map(line => line.split(" ").map(Number));

    const acOccurrenceMarkers = Array.from({ length: sequenceLength }, (_, k) => {
        return (charSequence[k] === "A" && charSequence[k + 1] === "C") ? 1 : 0;
    });

    const prefixACCounts = acOccurrenceMarkers.reduce((accumulator, markerValue, index) => {
        accumulator.push(accumulator[index] + markerValue);
        return accumulator;
    }, [0]);

    queryRanges.forEach(rangePair => {
        const [leftBound, rightBound] = rangePair;
        console.log(prefixACCounts[rightBound - 1] - prefixACCounts[leftBound - 1]);
    });
};

processSequenceQueries(require('fs').readFileSync('/dev/stdin', 'utf8'));
