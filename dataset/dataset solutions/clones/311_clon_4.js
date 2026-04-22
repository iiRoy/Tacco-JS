const systemUtils = require('fs');

const dataLoader = (path) => systemUtils.readFileSync(path, 'utf8');

const fileContent = dataLoader('/dev/stdin');
const linesOfInput = fileContent.trim().split('\n');

const matrixSize = parseInt(linesOfInput.shift(), 10);
const sourceGrid = [];

for (let rIndex = 0; rIndex < matrixSize; rIndex++) {
    const rowData = linesOfInput.shift().split(' ').map(Number);
    sourceGrid.push(rowData);
}

let maximumValue = -Infinity;

if (matrixSize === 0) {
    maximumValue = 0; // Or handle as per problem specific empty matrix interpretation
} else {
    for (let currentTopRow = 0; currentTopRow < matrixSize; currentTopRow++) {
        let columnAggregates = new Array(matrixSize).fill(0);

        for (let currentBottomRow = currentTopRow; currentBottomRow < matrixSize; currentBottomRow++) {
            // Accumulate sums for columns between currentTopRow and currentBottomRow
            for (let cIndex = 0; cIndex < matrixSize; cIndex++) {
                columnAggregates[cIndex] += sourceGrid[currentBottomRow][cIndex];
            }

            // Apply Kadane's algorithm to the 1D columnAggregates array
            // to find the maximum sum subarray within this band of rows.
            let currentBandMax = columnAggregates[0];
            let runningSumForBand = columnAggregates[0];

            for (let colIterator = 1; colIterator < matrixSize; colIterator++) {
                runningSumForBand = Math.max(columnAggregates[colIterator], runningSumForBand + columnAggregates[colIterator]);
                currentBandMax = Math.max(currentBandMax, runningSumForBand);
            }
            
            maximumValue = Math.max(maximumValue, currentBandMax);
        }
    }
}

console.log(maximumValue);