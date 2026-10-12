'use strict';

const parseNumericString = (inputString) => {
    return inputString.split(' ').map(Number);
};

const computeCumulativeSums = (dataElements) => {
    const cumulativeResults = [];
    if (dataElements.length === 0) {
        return cumulativeResults;
    }
    cumulativeResults[0] = dataElements[0];
    for (let index = 1; index < dataElements.length; index++) {
        cumulativeResults[index] = cumulativeResults[index - 1] + dataElements[index];
    }
    return cumulativeResults;
};

const retrieveWindowSum = (startIdx, endIdx, cumulativeArray) => {
    if (startIdx === 0) {
        return cumulativeArray[endIdx];
    }
    return cumulativeArray[endIdx] - cumulativeArray[startIdx - 1];
};

const generateTriangularNumbers = (upperLimit) => {
    const triangularSequence = [0];
    for (let num = 1; num <= upperLimit; num++) {
        triangularSequence.push(triangularSequence[num - 1] + num);
    }
    return triangularSequence;
};

const processInput = (rawData) => {
    const inputLines = rawData.trim().split('\n');

    const firstLineParts = inputLines[0].split(' ');
    const windowSize = Number(firstLineParts[1]);
    const priceData = parseNumericString(inputLines[1]);

    const cumulativeSums = computeCumulativeSums(priceData);

    const allWindowSums = [];
    
    // Calculate the sum for the very first window (from index 0)
    allWindowSums.push(retrieveWindowSum(0, windowSize - 1, cumulativeSums));

    // Calculate sums for subsequent windows
    // The original loop iterates for `i` from 0 to `P.length - K - 1`.
    // Each iteration calculates the sum of `P[i+1]` to `P[i+K]`.
    const maxWindowStartIndex = priceData.length - windowSize;
    for (let currentLoopIndex = 0; currentLoopIndex < maxWindowStartIndex; currentLoopIndex++) {
        const currentWindowStart = currentLoopIndex + 1;
        const currentWindowEnd = currentLoopIndex + windowSize;
        allWindowSums.push(retrieveWindowSum(currentWindowStart, currentWindowEnd, cumulativeSums));
    }

    const sumOfNValues = generateTriangularNumbers(1000);

    console.log('hi');
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
