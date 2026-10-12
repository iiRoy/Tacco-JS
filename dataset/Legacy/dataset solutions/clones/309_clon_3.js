const parseGridRow = (lineContent) => {
    return ("0 " + lineContent).split(" ").map(Number);
};

const create2DArray = (rows, cols, initialValue = 0) => {
    const arr = new Array(rows);
    for (let i = 0; i < rows; i++) {
        arr[i] = new Array(cols).fill(initialValue);
    }
    return arr;
};

const getSubgridSum = (r1, c1, r2, c2, psGrid) => {
    const total = psGrid[r2][c2];
    const topExclusion = psGrid[r1][c2];
    const leftExclusion = psGrid[r2][c1];
    const overlapInclusion = psGrid[r1][c1];
    return total - topExclusion - leftExclusion + overlapInclusion;
};

const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputString.trim().split("\n");

const initialMatrixDim = parseInt(inputLines.shift(), 10);
const effectiveGridDim = initialMatrixDim + 1;

const dataGrid = [];
const zeroPaddedRow = new Array(effectiveGridDim).fill(0);
dataGrid.push(zeroPaddedRow);

for (let i = 0; i < initialMatrixDim; i++) {
    dataGrid.push(parseGridRow(inputLines.shift()));
}

const prefixSumGrid = create2DArray(effectiveGridDim, effectiveGridDim, 0);

for (let i = 1; i < effectiveGridDim; i++) {
    for (let j = 1; j < effectiveGridDim; j++) {
        prefixSumGrid[i][j] = dataGrid[i][j] + prefixSumGrid[i - 1][j] + prefixSumGrid[i][j - 1] - prefixSumGrid[i - 1][j - 1];
    }
}

let maximumSubgridSum = -Infinity;

for (let i = 0; i < effectiveGridDim; i++) {
    for (let j = 0; j < effectiveGridDim; j++) {
        for (let y = i + 1; y < effectiveGridDim; y++) {
            for (let x = j + 1; x < effectiveGridDim; x++) {
                const currentSubgridSum = getSubgridSum(i, j, y, x, prefixSumGrid);
                maximumSubgridSum = Math.max(maximumSubgridSum, currentSubgridSum);
            }
        }
    }
}

console.log(maximumSubgridSum);
