const fileSystem = require('fs');

function computePathCount(rowIdx, colIdx, gridWidth, gridHeight, gridData, memoizationTable) {
    if (rowIdx < 0 || colIdx < 0 || colIdx >= gridWidth) {
        return 0;
    }

    const memoKey = `${rowIdx},${colIdx}`;
    if (memoizationTable.has(memoKey)) {
        return memoizationTable.get(memoKey);
    }

    const currentCellType = gridData[rowIdx][colIdx];

    if (currentCellType === 1) {
        memoizationTable.set(memoKey, 0);
        return 0;
    }

    let accumulatedPaths = 0;

    if (rowIdx === 0) {
        accumulatedPaths = (currentCellType === 0) ? 1 : 0;
    } else {
        const previousRowIdx = rowIdx - 1;
        const twoRowsAgoIdx = rowIdx - 2;

        let termA = 0;
        if (colIdx > 0 && gridData[previousRowIdx][colIdx - 1] !== 2) {
            termA = computePathCount(previousRowIdx, colIdx - 1, gridWidth, gridHeight, gridData, memoizationTable);
        }

        let termB = 0;
        if (gridData[previousRowIdx][colIdx] !== 2) {
            termB = computePathCount(previousRowIdx, colIdx, gridWidth, gridHeight, gridData, memoizationTable);
        }

        let termC = 0;
        if (colIdx < gridWidth - 1 && gridData[previousRowIdx][colIdx + 1] !== 2) {
            termC = computePathCount(previousRowIdx, colIdx + 1, gridWidth, gridHeight, gridData, memoizationTable);
        }

        let termD = 0;
        if (twoRowsAgoIdx >= 0 && gridData[twoRowsAgoIdx][colIdx] === 2) {
            termD = computePathCount(twoRowsAgoIdx, colIdx, gridWidth, gridHeight, gridData, memoizationTable);
        }

        if (currentCellType === 0) {
            accumulatedPaths = termA + termB + termC + termD;
        } else if (currentCellType === 2) {
            accumulatedPaths = termB + termD;
        }
    }

    memoizationTable.set(memoKey, accumulatedPaths);
    return accumulatedPaths;
}

const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

const allProblemSets = [];
let currentLineIndex = 0;

while (true) {
    const dimensionsLine = inputLines[currentLineIndex++].split(' ').map(Number);
    const gridWidth = dimensionsLine[0];
    const gridHeight = dimensionsLine[1];

    if (gridWidth === 0 && gridHeight === 0) {
        break;
    }

    const problemGrid = [];
    for (let r = 0; r < gridHeight; r++) {
        problemGrid.push(inputLines[currentLineIndex++].split(' ').map(Number));
    }
    allProblemSets.push({ width: gridWidth, height: gridHeight, grid: problemGrid });
}

for (const problemInstance of allProblemSets) {
    const { width: currentWidth, height: currentHeight, grid: currentGrid } = problemInstance;
    const pathMemo = new Map();

    let finalSum = 0;

    if (currentHeight >= 2) {
        for (let c = 0; c < currentWidth; c++) {
            if (currentGrid[currentHeight - 2][c] === 2) {
                finalSum += computePathCount(currentHeight - 2, c, currentWidth, currentHeight, currentGrid, pathMemo);
            }
        }
    }

    if (currentHeight >= 1) {
        for (let c = 0; c < currentWidth; c++) {
            const cellValue = currentGrid[currentHeight - 1][c];
            if (cellValue === 0 || cellValue === 2) {
                finalSum += computePathCount(currentHeight - 1, c, currentWidth, currentHeight, currentGrid, pathMemo);
            }
        }
    }
    console.log(finalSum);
}
