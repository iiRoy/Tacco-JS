const fs = require('fs');
const inputContent = fs.readFileSync('/dev/stdin', 'utf8');
const lines = inputContent.trim().split('\n');

const dimension = parseInt(lines.shift(), 10);
const grid = lines.map(line => line.split(' ').map(Number));

const prefixSumGrid = Array.from({ length: dimension }, () => Array(dimension).fill(0));

for (let rowIdx = 0; rowIdx < dimension; rowIdx++) {
    for (let colIdx = 0; colIdx < dimension; colIdx++) {
        let currentVal = grid[rowIdx][colIdx];
        let above = (rowIdx > 0) ? prefixSumGrid[rowIdx - 1][colIdx] : 0;
        let left = (colIdx > 0) ? prefixSumGrid[rowIdx][colIdx - 1] : 0;
        let diag = (rowIdx > 0 && colIdx > 0) ? prefixSumGrid[rowIdx - 1][colIdx - 1] : 0;
        prefixSumGrid[rowIdx][colIdx] = currentVal + above + left - diag;
    }
}

let overallMaximum = -Infinity;

for (let topRow = 0; topRow < dimension; topRow++) {
    for (let bottomRow = topRow; bottomRow < dimension; bottomRow++) {
        let currentColumnSums = Array(dimension).fill(0);

        for (let col = 0; col < dimension; col++) {
            let rectSum = prefixSumGrid[bottomRow][col];
            if (topRow > 0) {
                rectSum -= prefixSumGrid[topRow - 1][col];
            }
            currentColumnSums[col] = rectSum;
        }

        let kadaneMax = -Infinity;
        let tempSum = 0;
        for (let k = 0; k < dimension; k++) {
            tempSum += currentColumnSums[k];
            if (tempSum > kadaneMax) {
                kadaneMax = tempSum;
            }
            if (tempSum < 0) {
                tempSum = 0;
            }
        }
        
        if (kadaneMax > overallMaximum) {
            overallMaximum = kadaneMax;
        }
    }
}

console.log(overallMaximum);