const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = fileContents.trim().split("\n");

let numericGrid = [];
for (const currentLine of dataLines) {
    const parsedNumbers = currentLine.split(",").map(valueText => parseInt(valueText, 10));
    numericGrid.push(parsedNumbers);
}

const totalGridRows = numericGrid.length;
let cachedMaxSums = Array(totalGridRows).fill(0).map((_, rowIndex) =>
    Array(numericGrid[rowIndex].length).fill(Number.MIN_SAFE_INTEGER)
);

cachedMaxSums[0][0] = numericGrid[0][0];

const pivotRowThreshold = (totalGridRows - 1) / 2;

for (let currentRow = 0; currentRow < totalGridRows - 1; currentRow++) {
    for (let currentCol = 0; currentCol < numericGrid[currentRow].length; currentCol++) {
        if (cachedMaxSums[currentRow][currentCol] === Number.MIN_SAFE_INTEGER) {
            continue;
        }

        const currentAccumulatedValue = cachedMaxSums[currentRow][currentCol];

        if (currentRow < pivotRowThreshold) {
            const nextRow1 = currentRow + 1;
            const nextCol1 = currentCol;
            const newSum1 = currentAccumulatedValue + numericGrid[nextRow1][nextCol1];
            cachedMaxSums[nextRow1][nextCol1] = Math.max(cachedMaxSums[nextRow1][nextCol1], newSum1);

            const nextRow2 = currentRow + 1;
            const nextCol2 = currentCol + 1;
            const newSum2 = currentAccumulatedValue + numericGrid[nextRow2][nextCol2];
            cachedMaxSums[nextRow2][nextCol2] = Math.max(cachedMaxSums[nextRow2][nextCol2], newSum2);

        } else {
            const nextRow1 = currentRow + 1;
            const nextCol1 = currentCol - 1;
            if (nextCol1 >= 0) {
                const newSum1 = currentAccumulatedValue + numericGrid[nextRow1][nextCol1];
                cachedMaxSums[nextRow1][nextCol1] = Math.max(cachedMaxSums[nextRow1][nextCol1], newSum1);
            }

            const nextRow2 = currentRow + 1;
            const nextCol2 = currentCol;
            if (currentCol < numericGrid[currentRow].length - 1 && nextCol2 < numericGrid[nextRow2].length) {
                const newSum2 = currentAccumulatedValue + numericGrid[nextRow2][nextCol2];
                cachedMaxSums[nextRow2][nextCol2] = Math.max(cachedMaxSums[nextRow2][nextCol2], newSum2);
            }
        }
    }
}

let finalMaximumPathSum = Number.MIN_SAFE_INTEGER;
for (const sumValue of cachedMaxSums[totalGridRows - 1]) {
    finalMaximumPathSum = Math.max(finalMaximumPathSum, sumValue);
}

console.log(finalMaximumPathSum);