function evaluateGridRegions(gridDataMatrix, gridRows, gridCols) {
    const cellMap = gridDataMatrix.map(lineText => lineText.split(''));
    const visitedFlags = Array(gridRows).fill(0).map(() => Array(gridCols).fill(false));
    let distinctRegionCount = 0;

    const rowMovements = [-1, 1, 0, 0];
    const colMovements = [0, 0, -1, 1];

    for (let currentRIndex = 0; currentRIndex < gridRows; currentRIndex++) {
        for (let currentCIndex = 0; currentCIndex < gridCols; currentCIndex++) {
            const currentCellIdentifier = cellMap[currentRIndex][currentCIndex];

            if ((currentCellIdentifier === '@' || currentCellIdentifier === '#' || currentCellIdentifier === '*') && !visitedFlags[currentRIndex][currentCIndex]) {
                distinctRegionCount++;
                const explorationQueue = [];
                explorationQueue.push([currentRIndex, currentCIndex]);
                visitedFlags[currentRIndex][currentCIndex] = true;

                while (explorationQueue.length > 0) {
                    const [focusR, focusC] = explorationQueue.shift();
                    const initialRegionId = currentCellIdentifier;

                    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
                        const adjacentR = focusR + rowMovements[directionIndex];
                        const adjacentC = focusC + colMovements[directionIndex];

                        if (adjacentR >= 0 && adjacentR < gridRows &&
                            adjacentC >= 0 && adjacentC < gridCols &&
                            !visitedFlags[adjacentR][adjacentC] &&
                            cellMap[adjacentR][adjacentC] === initialRegionId) {
                            visitedFlags[adjacentR][adjacentC] = true;
                            explorationQueue.push([adjacentR, adjacentC]);
                        }
                    }
                }
            }
        }
    }
    return distinctRegionCount;
}

const sourceContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = sourceContent.trim().split('\n');
let contentCursor = 0;

while (true) {
    const dimensionSpecs = contentLines[contentCursor++].split(' ').map(Number);
    const totalRows = dimensionSpecs[0];
    const totalCols = dimensionSpecs[1];

    if (totalRows === 0 && totalCols === 0) {
        break;
    }

    const currentCaseGridLines = [];
    for (let r = 0; r < totalRows; r++) {
        currentCaseGridLines.push(contentLines[contentCursor++]);
    }

    const finalResult = evaluateGridRegions(currentCaseGridLines, totalRows, totalCols);
    console.log(finalResult);
}