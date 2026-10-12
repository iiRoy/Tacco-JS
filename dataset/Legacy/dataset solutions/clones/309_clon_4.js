const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const inputLines = rawInput.trim().split('\n');

const matrixDimension = Number(inputLines.shift());

const dataGrid = inputLines.map(line => line.split(' ').map(Number));

const columnAccumulations = Array.from({ length: matrixDimension }, (_, rowIndex) =>
    Array.from({ length: matrixDimension }, (_, colIndex) => {
        if (rowIndex === 0) {
            return dataGrid[rowIndex][colIndex];
        }
        return dataGrid[rowIndex][colIndex] + columnAccumulations[rowIndex - 1][colIndex];
    })
);

const calculateMaxSubarray = (linearArray) => {
    if (linearArray.length === 0) return -Infinity;

    let currentMaximum = linearArray[0];
    let overallMaximum = linearArray[0];

    for (let k = 1; k < linearArray.length; k++) {
        currentMaximum = Math.max(linearArray[k], currentMaximum + linearArray[k]);
        overallMaximum = Math.max(overallMaximum, currentMaximum);
    }
    return overallMaximum;
};

let globalMaximum = -Infinity;

for (let topBoundary = 0; topBoundary < matrixDimension; topBoundary++) {
    for (let bottomBoundary = topBoundary; bottomBoundary < matrixDimension; bottomBoundary++) {
        const currentSliceSums = Array.from({ length: matrixDimension }, (_, colIndex) => {
            const sumToBottom = columnAccumulations[bottomBoundary][colIndex];
            const sumAboveTop = topBoundary > 0 ? columnAccumulations[topBoundary - 1][colIndex] : 0;
            return sumToBottom - sumAboveTop;
        });

        const sliceMaximum = calculateMaxSubarray(currentSliceSums);
        globalMaximum = Math.max(globalMaximum, sliceMaximum);
    }
}

console.log(globalMaximum);
