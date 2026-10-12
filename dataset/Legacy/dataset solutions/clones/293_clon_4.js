const fs = require('fs');

const rawInputData = fs.readFileSync('/dev/stdin', 'utf8');
const lineSegments = rawInputData.trim().split("\n");

let diamondValues = [];
let pathAccumulator = [];

lineSegments.forEach(function(lineText) {
    const rowNumbers = lineText.split(",").map(Number);
    const zeroRow = rowNumbers.map(function() { return 0; });
    diamondValues.push(rowNumbers);
    pathAccumulator.push(zeroRow);
});

pathAccumulator[0][0] = diamondValues[0][0];

const totalRows = diamondValues.length;
const midRowThreshold = Math.floor((totalRows - 1) / 2);

for (let rowIdx = 0; rowIdx < totalRows - 1; rowIdx++) {
    for (let colIdx = 0; colIdx < diamondValues[rowIdx].length; colIdx++) {
        if (pathAccumulator[rowIdx][colIdx] === 0 && (rowIdx !== 0 || colIdx !== 0)) {
            continue;
        }

        if (rowIdx < midRowThreshold) {
            pathAccumulator[rowIdx + 1][colIdx] = Math.max(
                pathAccumulator[rowIdx + 1][colIdx],
                pathAccumulator[rowIdx][colIdx] + diamondValues[rowIdx + 1][colIdx]
            );

            pathAccumulator[rowIdx + 1][colIdx + 1] = Math.max(
                pathAccumulator[rowIdx + 1][colIdx + 1],
                pathAccumulator[rowIdx][colIdx] + diamondValues[rowIdx + 1][colIdx + 1]
            );
        } else {
            if (colIdx - 1 >= 0) {
                pathAccumulator[rowIdx + 1][colIdx - 1] = Math.max(
                    pathAccumulator[rowIdx + 1][colIdx - 1],
                    pathAccumulator[rowIdx][colIdx] + diamondValues[rowIdx + 1][colIdx - 1]
                );
            }

            if (colIdx < diamondValues[rowIdx].length - 1) {
                pathAccumulator[rowIdx + 1][colIdx] = Math.max(
                    pathAccumulator[rowIdx + 1][colIdx],
                    pathAccumulator[rowIdx][colIdx] + diamondValues[rowIdx + 1][colIdx]
                );
            }
        }
    }
}

let overallMaximum = 0;
for (const finalSum of pathAccumulator[totalRows - 1]) {
    overallMaximum = Math.max(overallMaximum, finalSum);
}

console.log(overallMaximum);
