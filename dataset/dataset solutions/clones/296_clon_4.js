const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawData.trim().split('\n');

const numericGrid = lineSegments.map(segment =>
    segment.split(',').map(val => Number(val))
);

const totalRows = numericGrid.length;
const pathSumsMatrix = Array(totalRows).fill(null).map((_, r) => Array(r + 1).fill(-Infinity));

pathSumsMatrix[0][0] = numericGrid[0][0];

const midpointThreshold = (totalRows - 1) / 2;

for (let r = 0; r < totalRows - 1; r++) {
    for (let c = 0; c <= r; c++) {
        if (pathSumsMatrix[r][c] === -Infinity) continue;

        const currentAccumulatedSum = pathSumsMatrix[r][c];

        if (r < midpointThreshold) { // Upper section of the pyramid
            // Move to (r+1, c)
            pathSumsMatrix[r + 1][c] = Math.max(pathSumsMatrix[r + 1][c], currentAccumulatedSum + numericGrid[r + 1][c]);
            // Move to (r+1, c+1)
            pathSumsMatrix[r + 1][c + 1] = Math.max(pathSumsMatrix[r + 1][c + 1], currentAccumulatedSum + numericGrid[r + 1][c + 1]);
        } else { // Lower section of the pyramid (r >= midpointThreshold)
            // Move to (r+1, c-1)
            if (c > 0) { // Ensure column index c-1 is valid
                pathSumsMatrix[r + 1][c - 1] = Math.max(pathSumsMatrix[r + 1][c - 1], currentAccumulatedSum + numericGrid[r + 1][c - 1]);
            }
            // Move to (r+1, c)
            // This path is taken if 'c' is not the rightmost element of the current row 'r'.
            // The original condition `x < yx[y].length - 1` translates to `c < r` because `yx[y].length` is `y+1`.
            if (c < r) { 
                pathSumsMatrix[r + 1][c] = Math.max(pathSumsMatrix[r + 1][c], currentAccumulatedSum + numericGrid[r + 1][c]);
            }
        }
    }
}

let ultimateMaxSum = -Infinity;
for (let c = 0; c < totalRows; c++) {
    ultimateMaxSum = Math.max(ultimateMaxSum, pathSumsMatrix[totalRows - 1][c]);
}

console.log(ultimateMaxSum);
