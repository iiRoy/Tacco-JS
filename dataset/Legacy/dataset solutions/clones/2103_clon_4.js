'use strict';

function processInput(rawText) {
    const numericValues = rawText.trim().split(' ').map(Number);
    return {
        valA: numericValues[0],
        valB: numericValues[1]
    };
}

function computeResult(data) {
    const { valA, valB } = data;

    // This variable corresponds to 'min' in the original code and is also unused in the core logic.
    const lowerThreshold = Math.floor(valB / 0.10);

    // This variable corresponds to 'max' in the original code, defining the upper limit of the search.
    const searchCeiling = Math.floor(valA / 0.08);

    // Generate a sequence of integers starting from 1 up to searchCeiling.
    // The length is capped at 0 if searchCeiling is negative (e.g., for A=0, searchCeiling=0, length=0).
    const potentialCandidates = Array.from({ length: Math.max(0, searchCeiling) }, (_, index) => index + 1);

    // Find the first candidate that satisfies both conditions.
    const foundMatch = potentialCandidates.find(currentValue => {
        const eightPercentFloor = Math.floor(currentValue * 0.08);
        const tenPercentFloor = Math.floor(currentValue * 0.10);
        return eightPercentFloor === valA && tenPercentFloor === valB;
    });

    // Return the found value or -1 if no match was found, replicating the original's behavior.
    return foundMatch !== undefined ? foundMatch : -1;
}

function entryPoint(inputString) {
    const parsedData = processInput(inputString);
    const finalOutput = computeResult(parsedData);
    console.log(finalOutput);
}

entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
