const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineData = fileContent.trim().split("\n");

let initialGridSize = Number(lineData.shift());

const effectiveGridSize = initialGridSize + 1;
const valueGrid = Array.from({ length: effectiveGridSize }, () => Array(effectiveGridSize).fill(0));

for (let r = 1; r < effectiveGridSize; r++) {
    const rowValues = lineData.shift().split(" ").map(Number);
    for (let c = 1; c < effectiveGridSize; c++) {
        valueGrid[r][c] = rowValues[c - 1];
    }
}

const prefixSumGrid = Array.from({ length: effectiveGridSize }, () => Array(effectiveGridSize).fill(0));

for (let rIdx = 0; rIdx < effectiveGridSize; rIdx++) {
    for (let cIdx = 1; cIdx < effectiveGridSize; cIdx++) {
        prefixSumGrid[rIdx][cIdx] = prefixSumGrid[rIdx][cIdx - 1] + valueGrid[rIdx][cIdx];
    }
}

for (let rIdx = 1; rIdx < effectiveGridSize; rIdx++) {
    for (let cIdx = 0; cIdx < effectiveGridSize; cIdx++) {
        prefixSumGrid[rIdx][cIdx] = prefixSumGrid[rIdx - 1][cIdx] + prefixSumGrid[rIdx][cIdx];
    }
}

function getSubRectangleSum(topRow, leftCol, bottomRow, rightCol, psGrid) {
    const totalSum = psGrid[bottomRow][rightCol];
    const topExcludedSum = psGrid[topRow][rightCol];
    const leftExcludedSum = psGrid[bottomRow][leftCol];
    const overlapCorrectedSum = psGrid[topRow][leftCol];
    return totalSum - topExcludedSum - leftExcludedSum + overlapCorrectedSum;
}

let overallMaximum = -Infinity;

for (let r1 = 0; r1 < effectiveGridSize; r1++) {
    for (let c1 = 0; c1 < effectiveGridSize; c1++) {
        for (let r2 = r1 + 1; r2 < effectiveGridSize; r2++) {
            for (let c2 = c1 + 1; c2 < effectiveGridSize; c2++) {
                const currentRectangleSum = getSubRectangleSum(r1, c1, r2, c2, prefixSumGrid);
                if (overallMaximum < currentRectangleSum) {
                    overallMaximum = currentRectangleSum;
                }
            }
        }
    }
}

console.log(overallMaximum);
