const fileSystem = require('fs');

const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split("\n");

const gridDimension = parseInt(lineSegments.shift(), 10);

const valueGrid = lineSegments.map(segment => segment.split(" ").map(Number));

let peakSum = -Infinity;

for (let topRow = 0; topRow < gridDimension; topRow++) {
    const columnAggregates = new Array(gridDimension).fill(0);

    for (let bottomRow = topRow; bottomRow < gridDimension; bottomRow++) {
        for (let colIndex = 0; colIndex < gridDimension; colIndex++) {
            columnAggregates[colIndex] += valueGrid[bottomRow][colIndex];
        }

        // Apply Kadane's algorithm to the current columnAggregates (1D array)
        let sliceMax = -Infinity;
        let currentSliceTotal = 0;

        // Kadane's algorithm for 1D array, handles all negative numbers correctly
        // Assumes gridDimension >= 1 based on typical problem constraints
        sliceMax = columnAggregates[0];
        currentSliceTotal = columnAggregates[0];

        for (let k = 1; k < gridDimension; k++) {
            currentSliceTotal = Math.max(columnAggregates[k], currentSliceTotal + columnAggregates[k]);
            sliceMax = Math.max(sliceMax, currentSliceTotal);
        }
        
        if (sliceMax > peakSum) {
            peakSum = sliceMax;
        }
    }
}

console.log(peakSum);
