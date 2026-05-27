"use strict";

const processInputData = (inputString) => {
    const processedLines = inputString.trim().split('\n');
    const firstLineValue = parseInt(processedLines[0], 10); // This value (N) is read but not used, preserving original behavior.
    const numericSequence = processedLines[1].split(' ').map(Number);

    // Core logic: Calculate differences and store unique ones in a Set
    // Replaces the imperative loop and subsequent Set creation.
    const distinctOffsets = numericSequence.reduce((accumulatorSet, currentElement, elementIndex) => {
        accumulatorSet.add(currentElement - (elementIndex + 1));
        return accumulatorSet;
    }, new Set());

    // Post-processing: Sum the absolute values of the unique differences
    // Replaces the array conversion, map, and reduce chain.
    let absoluteSummation = 0;
    for (const offsetValue of distinctOffsets) {
        absoluteSummation += Math.abs(offsetValue);
    }

    console.log(absoluteSummation);
};

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
