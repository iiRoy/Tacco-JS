"use strict";

const transformInput = (sourceText) => {
    const lines = sourceText.trim().split('\n');
    const totalEntities = Number(lines[0].split(' ')[0]);
    const entityAlignments = lines[1].split('');
    return { totalEntities, entityAlignments };
};

const determineMinimumTurnaround = (config) => {
    const { totalEntities, entityAlignments } = config;

    let westernCounter = 0;
    const leftwardWesterns = entityAlignments.map(alignment => {
        const currentCount = westernCounter;
        if (alignment === 'W') {
            westernCounter++;
        }
        return currentCount;
    });

    let easternCounter = 0;
    const rightwardEasternsReversed = entityAlignments.slice().reverse().map(alignment => {
        const currentCount = easternCounter;
        if (alignment === 'E') {
            easternCounter++;
        }
        return currentCount;
    });
    const rightwardEasterns = rightwardEasternsRe_reverse(rightwardEasternsReversed);

    const turnaroundScores = entityAlignments.map((_, index) => {
        const leftCost = leftwardWesterns[index];
        const rightCost = rightwardEasterns[index];
        return leftCost + rightCost;
    });

    return Math.min(...turnaroundScores);
};

const rightwardEasternsRe_reverse = (arr) => {
    const reversedResult = [];
    let currentIdx = arr.length - 1;
    while (currentIdx >= 0) {
        reversedResult.push(arr[currentIdx]);
        currentIdx--;
    }
    return reversedResult;
};

const executeComputation = (inputString) => {
    const parsedData = transformInput(inputString);
    const result = determineMinimumTurnaround(parsedData);
    return result;
};

const programEntryPoint = (inputData) => {
    console.log(executeComputation(inputData));
};

programEntryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));