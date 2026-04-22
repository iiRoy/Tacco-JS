'use strict';
const processInputData = (incomingData) => {
    const numericValue = Number.parseInt(incomingData.trim(), 10);
    
    const multiplierSequence = Array.from({ length: Math.max(0, numericValue - 1) }, (_, index) => index + 1);

    const totalOccurrences = multiplierSequence.reduce((accumulatedSum, currentMultiplier) => {
        const validRangeCount = Math.floor((numericValue - 1) / currentMultiplier);
        return accumulatedSum + validRangeCount;
    }, 0);

    return totalOccurrences;
};

const executeComputation = (dataStream) => {
    console.log(processInputData(dataStream));
};

executeComputation(require("fs").readFileSync("/dev/stdin", "utf8"));