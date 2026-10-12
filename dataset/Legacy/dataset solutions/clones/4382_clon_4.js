"use strict";

const processAndAnalyze = (rawInputData) => {
    const inputLines = rawInputData.trim().split("\n");
    const numericSequence = inputLines[1].split(" ").map(Number).sort((valA, valB) => valA - valB);

    const distinctElements = Array.from(new Set(numericSequence));

    const highestFrequency = distinctElements.reduce((currentMaximum, referenceValue) => {
        const currentElementCount = numericSequence.filter(
            (individualElement) => Math.abs(individualElement - referenceValue) <= 1
        ).length;
        return Math.max(currentMaximum, currentElementCount);
    }, 0);

    console.log(highestFrequency);
};

processAndAnalyze(require('fs').readFileSync('/dev/stdin', 'utf8'));
