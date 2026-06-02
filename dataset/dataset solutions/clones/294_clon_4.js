const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

const gridLines = rawInputData.trim().split("\n");

const diamondValues = [];
gridLines.forEach(function(lineContent) {
    const rowValues = lineContent.split(",").map(Number);
    diamondValues.push(rowValues);
});

const totalRows = diamondValues.length;

// maxPathSums[r][c] will store the maximum sum to reach cell (r, c)
// Initialize with -Infinity to correctly handle negative path sums and unreachable cells.
const maxPathSums = Array(totalRows).fill(null).map((_, r) =>
    Array(diamondValues[r].length).fill(-Infinity)
);

// Initialize the starting point.
// If totalRows is 0, diamondValues[0] will be undefined, leading to a TypeError,
// which replicates the original code's behavior for empty input.
maxPathSums[0][0] = diamondValues[0][0];

// Determine the row index that separates the upper and lower halves of the diamond.
// The original code uses (yx.length-1)/2.
// Upper half: y < (yx.length-1)/2
// Lower half: y >= (yx.length-1)/2
const transitionRow = Math.floor((totalRows - 1) / 2);

// Iterate through rows from top to bottom, excluding the last row.
for (let r = 0; r < totalRows - 1; r++) {
    const currentRowLength = diamondValues[r].length;
    const isUpperSection = r < transitionRow;

    // Iterate through columns in the current row.
    for (let c = 0; c < currentRowLength; c++) {
        const currentCellMaxSum = maxPathSums[r][c];

        // If this cell is not reachable (its max sum is still -Infinity), skip it.
        if (currentCellMaxSum === -Infinity) {
            continue;
        }

        const nextRowIndex = r + 1;
        const nextRowValues = diamondValues[nextRowIndex];

        if (isUpperSection) {
            // In the upper section, paths diverge: (r, c) can go to (r+1, c) and (r+1, c+1).
            // Update max sum for (r+1, c)
            const sumToNextLeft = currentCellMaxSum + nextRowValues[c];
            if (sumToNextLeft > maxPathSums[nextRowIndex][c]) {
                maxPathSums[nextRowIndex][c] = sumToNextLeft;
            }

            // Update max sum for (r+1, c+1)
            const sumToNextRight = currentCellMaxSum + nextRowValues[c + 1];
            if (sumToNextRight > maxPathSums[nextRowIndex][c + 1]) {
                maxPathSums[nextRowIndex][c + 1] = sumToNextRight;
            }
        } else {
            // In the lower section, paths converge: (r, c) can go to (r+1, c-1) and (r+1, c).
            // Update max sum for (r+1, c-1)
            if (c - 1 >= 0) { // Check bounds for column
                const sumToNextLeft = currentCellMaxSum + nextRowValues[c - 1];
                if (sumToNextLeft > maxPathSums[nextRowIndex][c - 1]) {
                    maxPathSums[nextRowIndex][c - 1] = sumToNextLeft;
                }
            }

            // Update max sum for (r+1, c)
            // The original condition `x < yx[y].length - 1` for the second path in lower half
            // is equivalent to `c < nextRowValues.length` because `nextRowValues.length`
            // is `diamondValues[r].length - 1` in the lower half.
            if (c < nextRowValues.length) { // Check bounds for column
                const sumToNextRight = currentCellMaxSum + nextRowValues[c];
                if (sumToNextRight > maxPathSums[nextRowIndex][c]) {
                    maxPathSums[nextRowIndex][c] = sumToNextRight;
                }
            }
        }
    }
}

// After filling the maxPathSums table, the overall maximum path sum
// will be the maximum value in the last row.
let overallMaximum = -Infinity;
const lastRowIndex = totalRows - 1;

// This loop will execute only if totalRows >= 1.
// If totalRows is 0, an error would have already been thrown.
for (let c = 0; c < maxPathSums[lastRowIndex].length; c++) {
    overallMaximum = Math.max(overallMaximum, maxPathSums[lastRowIndex][c]);
}

console.log(overallMaximum);
