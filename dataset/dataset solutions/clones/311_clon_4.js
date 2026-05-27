const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.trim().split('\n');

const matrixDimension = Number(contentLines[0]);
const inputGrid = [];

for (let r = 1; r <= matrixDimension; r++) {
    inputGrid.push(contentLines[r].split(' ').map(Number));
}

let overallMaximumSubarraySum = -Infinity;

for (let topBoundaryRow = 0; topBoundaryRow < matrixDimension; topBoundaryRow++) {
    const currentColumnSums = new Array(matrixDimension).fill(0);

    for (let bottomBoundaryRow = topBoundaryRow; bottomBoundaryRow < matrixDimension; bottomBoundaryRow++) {
        for (let colIndex = 0; colIndex < matrixDimension; colIndex++) {
            currentColumnSums[colIndex] += inputGrid[bottomBoundaryRow][colIndex];
        }

        let maxSliceSum = -Infinity;
        let runningSliceSum = 0;

        for (let k = 0; k < matrixDimension; k++) {
            runningSliceSum += currentColumnSums[k];
            maxSliceSum = Math.max(maxSliceSum, runningSliceSum);
            if (runningSliceSum < 0) {
                runningSliceSum = 0;
            }
        }
        
        overallMaximumSubarraySum = Math.max(overallMaximumSubarraySum, maxSliceSum);
    }
}

console.log(overallMaximumSubarraySum);
