function solveGridPath(currentGridHeight, currentGridData) {
    const visitedCells = new Set();
    let minSteps = "NA";

    const queue = [];
    for (let r = 0; r < 2; r++) {
        queue.push([r, 0, 0]);
    }

    const getCellKey = (row, col) => `${row},${col}`;

    while (queue.length > 0) {
        const [currentRow, currentCol, stepCount] = queue.shift();

        const cellKey = getCellKey(currentRow, currentCol);

        if (visitedCells.has(cellKey)) {
            continue;
        }
        visitedCells.add(cellKey);

        if (currentCol === currentGridHeight - 1 && currentGridData[currentRow][currentCol] !== 2) {
            minSteps = stepCount;
            break;
        }

        let effectiveColAfterMovement = currentCol;
        const cellValue = currentGridData[currentRow][currentCol];

        if (cellValue === 1) {
            let tempCol = currentCol;
            let reachedEndOfRow = false;
            while (true) {
                tempCol++;
                if (tempCol === currentGridHeight - 1) {
                    reachedEndOfRow = true;
                    break;
                }
                if (currentGridData[currentRow][tempCol] !== 1) {
                    tempCol--;
                    break;
                }
            }
            if (reachedEndOfRow) {
                continue;
            }
            effectiveColAfterMovement = tempCol;
        } else if (cellValue === 2) {
            let tempCol = currentCol;
            while (true) {
                tempCol--;
                if (currentGridData[currentRow][tempCol] !== 2) {
                    break;
                }
            }
            effectiveColAfterMovement = tempCol;
        }

        const otherRowIndex = 1 - currentRow;
        for (let i = 0; i <= 2; i++) {
            queue.push([otherRowIndex, effectiveColAfterMovement + i, stepCount + 1]);
        }
    }
    return minSteps;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");

const parseGridRow = (lineString) => lineString.split(" ").map(Number);

while (true) {
    const currentGridHeight = Number(inputLines.shift());
    if (currentGridHeight === 0) {
        break;
    }

    const currentGridData = [];
    currentGridData[0] = parseGridRow(inputLines.shift());
    currentGridData[1] = parseGridRow(inputLines.shift());

    console.log(solveGridPath(currentGridHeight, currentGridData));
}
