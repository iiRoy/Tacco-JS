const fileSource = require('node:fs').readFileSync('/dev/stdin').toString();
const contentSegments = fileSource.trim().split('\n');

const dimensionCount = Number(contentSegments[0]);
const valueMatrix = contentSegments.slice(1).map(lineText =>
    lineText.split(' ').map(Number)
);

const calculateMax1DSum = (inputSequence) => {
    let currentSumCandidate = -Infinity;
    let overallHighestSum = -Infinity;

    for (const itemValue of inputSequence) {
        currentSumCandidate = Math.max(itemValue, currentSumCandidate + itemValue);
        overallHighestSum = Math.max(overallHighestSum, currentSumCandidate);
    }
    return overallHighestSum;
};

let finalMaximumResult = -Infinity;

for (let rowStart = 0; rowStart < dimensionCount; ++rowStart) {
    let columnAggregations = Array.from({ length: dimensionCount }, () => 0);

    for (let rowEnd = rowStart; rowEnd < dimensionCount; ++rowEnd) {
        for (let columnIndex = 0; columnIndex < dimensionCount; ++columnIndex) {
            columnAggregations[columnIndex] += valueMatrix[rowEnd][columnIndex];
        }

        const sliceMax = calculateMax1DSum(columnAggregations);
        finalMaximumResult = Math.max(finalMaximumResult, sliceMax);
    }
}

console.log(finalMaximumResult);