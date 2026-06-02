function parseAllProblems(rawInputText) {
    const inputLines = rawInputText.trim().split('\n');
    const problemInstances = [];
    let currentLineIndex = 0;

    while (true) {
        const dimensions = inputLines[currentLineIndex++].split(' ').map(Number);
        const currentWidth = dimensions[0];
        const currentHeight = dimensions[1];

        if (currentWidth === 0 && currentHeight === 0) {
            break;
        }

        const terrainGridData = [];
        for (let r = 0; r < currentHeight; r++) {
            terrainGridData.push(inputLines[currentLineIndex++].split(' ').map(Number));
        }
        problemInstances.push({
            width: currentWidth,
            height: currentHeight,
            grid: terrainGridData
        });
    }
    return problemInstances;
}

function computePathCount(rowIdx, colIdx, gridMap, memoizationTable, mapWidth, mapHeight) {
    if (rowIdx < 0 || colIdx < 0 || colIdx >= mapWidth) {
        return 0;
    }
    if (gridMap[rowIdx][colIdx] === 1) {
        return 0;
    }

    if (memoizationTable[rowIdx][colIdx] !== undefined) {
        return memoizationTable[rowIdx][colIdx];
    }

    if (rowIdx === 0) {
        memoizationTable[rowIdx][colIdx] = (gridMap[rowIdx][colIdx] === 0) ? 1 : 0;
        return memoizationTable[rowIdx][colIdx];
    }

    let currentCellPathSum = 0;
    const cellType = gridMap[rowIdx][colIdx];

    let pathFromLeftUp = 0;
    if (colIdx > 0 && gridMap[rowIdx - 1][colIdx - 1] !== 2) {
        pathFromLeftUp = computePathCount(rowIdx - 1, colIdx - 1, gridMap, memoizationTable, mapWidth, mapHeight);
    }

    let pathFromUp = 0;
    if (gridMap[rowIdx - 1][colIdx] !== 2) {
        pathFromUp = computePathCount(rowIdx - 1, colIdx, gridMap, memoizationTable, mapWidth, mapHeight);
    }

    let pathFromRightUp = 0;
    if (colIdx < mapWidth - 1 && gridMap[rowIdx - 1][colIdx + 1] !== 2) {
        pathFromRightUp = computePathCount(rowIdx - 1, colIdx + 1, gridMap, memoizationTable, mapWidth, mapHeight);
    }

    let pathFromTwoUp = 0;
    if (rowIdx >= 2 && gridMap[rowIdx - 2][colIdx] !== 2) {
        pathFromTwoUp = computePathCount(rowIdx - 2, colIdx, gridMap, memoizationTable, mapWidth, mapHeight);
    }

    if (cellType === 0) {
        currentCellPathSum = pathFromLeftUp + pathFromUp + pathFromRightUp + pathFromTwoUp;
    } else if (cellType === 2) {
        currentCellPathSum = pathFromUp + pathFromTwoUp;
    }

    memoizationTable[rowIdx][colIdx] = currentCellPathSum;
    return currentCellPathSum;
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const allProblemSets = parseAllProblems(rawInputContent);

allProblemSets.forEach(problemSet => {
    const { width: currentProblemWidth, height: currentProblemHeight, grid: currentTerrainGrid } = problemSet;

    const pathMemoTable = Array.from({ length: currentProblemHeight }, () => Array(currentProblemWidth).fill(undefined));

    for (let r = 0; r < currentProblemHeight; r++) {
        for (let c = 0; c < currentProblemWidth; c++) {
            computePathCount(r, c, currentTerrainGrid, pathMemoTable, currentProblemWidth, currentProblemHeight);
        }
    }

    let finalResultAccumulator = 0;

    if (currentProblemHeight >= 2) {
        finalResultAccumulator += pathMemoTable[currentProblemHeight - 2].reduce((rowSum, cellValue, colIdx) => {
            return rowSum + (currentTerrainGrid[currentProblemHeight - 2][colIdx] === 2 ? cellValue : 0);
        }, 0);
    }

    if (currentProblemHeight >= 1) {
        finalResultAccumulator += pathMemoTable[currentProblemHeight - 1].reduce((rowSum, cellValue, colIdx) => {
            const cellType = currentTerrainGrid[currentProblemHeight - 1][colIdx];
            return rowSum + ((cellType === 0 || cellType === 2) ? cellValue : 0);
        }, 0);
    }

    console.log(finalResultAccumulator);
});
