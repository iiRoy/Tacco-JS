let minDiffResult;
const fileSystemModule = require('fs');

const rawFileContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawFileContent.split("\n");

const parseWindowSizeFromHeader = (headerParts) => {
    const sizeValue = parseInt(headerParts[1], 10);
    return sizeValue;
};

const firstLineSegments = inputLinesArray[0].split(" ");
const windowLength = parseWindowSizeFromHeader(firstLineSegments);

inputLinesArray.shift();

const numericDataPoints = inputLinesArray
    .map(lineString => Number(lineString))
    .sort((valueA, valueB) => valueA - valueB);

minDiffResult = Infinity;

const maxPossibleWindowStart = numericDataPoints.length - windowLength;

for (let currentWindowStartIndex = 0; currentWindowStartIndex <= maxPossibleWindowStart; currentWindowStartIndex++) {
    const currentWindowEndIndex = currentWindowStartIndex + windowLength - 1;
    const calculatedWindowDifference = numericDataPoints[currentWindowEndIndex] - numericDataPoints[currentWindowStartIndex];
    minDiffResult = Math.min(minDiffResult, calculatedWindowDifference);
}

console.log(minDiffResult);
