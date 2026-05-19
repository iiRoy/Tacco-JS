const ROW_OFFSETS = [-1, 0, 1, 0];
const COL_OFFSETS = [0, 1, 0, -1];

let gridMatrix;
let gridDimension;

function traverseGrid(currentRow, currentCol, currentDirectionIndex) {
    if (gridMatrix[currentRow][currentCol] !== "+") {
        return;
    }

    const nextRowCoord = currentRow + ROW_OFFSETS[currentDirectionIndex];
    const nextColCoord = currentCol + COL_OFFSETS[currentDirectionIndex];

    const isOutOfBounds = nextRowCoord < 0 || nextColCoord < 0 || nextRowCoord >= gridDimension || nextColCoord >= gridDimension;

    if (isOutOfBounds) {
        const newDirectionIndex = (currentDirectionIndex + 1) % 4;
        traverseGrid(currentRow, currentCol, newDirectionIndex);
    } else {
        if (gridMatrix[nextRowCoord][nextColCoord] === "#") {
            const backtrackRow = nextRowCoord - ROW_OFFSETS[currentDirectionIndex];
            const backtrackCol = nextColCoord - COL_OFFSETS[currentDirectionIndex];
            gridMatrix[backtrackRow][backbacktrackCol] = "+";

            let newStartRow, newStartCol, newInitialDirection;

            switch (currentDirectionIndex) {
                case 3:
                    newStartRow = nextRowCoord - 2 * ROW_OFFSETS[currentDirectionIndex] - 1;
                    newStartCol = nextColCoord - 2 * COL_OFFSETS[currentDirectionIndex];
                    newInitialDirection = 0;
                    break;
                case 0:
                    newStartRow = nextRowCoord - 2 * ROW_OFFSETS[currentDirectionIndex];
                    newStartCol = nextColCoord - 2 * COL_OFFSETS[currentDirectionIndex] + 1;
                    newInitialDirection = 1;
                    break;
                case 1:
                    newStartRow = nextRowCoord - 2 * ROW_OFFSETS[currentDirectionIndex] + 1;
                    newStartCol = nextColCoord - 2 * COL_OFFSETS[currentDirectionIndex];
                    newInitialDirection = 2;
                    break;
                case 2:
                    newStartRow = nextRowCoord - 2 * ROW_OFFSETS[currentDirectionIndex];
                    newStartCol = nextColCoord - 2 * COL_OFFSETS[currentDirectionIndex] - 1;
                    newInitialDirection = 3;
                    break;
            }
            traverseGrid(newStartRow, newStartCol, newInitialDirection);

        } else {
            gridMatrix[currentRow][currentCol] = "#";
            lastVisitedCell = [currentRow, currentCol];
            traverseGrid(nextRowCoord, nextColCoord, currentDirectionIndex);
        }
    }
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');

const numericInputData = rawInput.trim().split("\n").map(Number);

let remainingTestCases = numericInputData.shift();

while (remainingTestCases--) {
    gridDimension = numericInputData.shift();

    if (gridDimension === 1) {
        console.log("#");
        continue;
    }

    gridMatrix = [];
    for (let rIdx = 0; rIdx < gridDimension; rIdx++) {
        const row = [];
        for (let cIdx = 0; cIdx < gridDimension; cIdx++) {
            row.push("+");
        }
        gridMatrix.push(row);
    }

    let lastVisitedCell = [];

    traverseGrid(gridDimension - 1, 0, 0);

    if (gridDimension % 2 === 0) {
        if (lastVisitedCell && lastVisitedCell.length === 2) {
            const [lastRow, lastCol] = lastVisitedCell;
            gridMatrix[lastRow][lastCol] = "+";
        }
    }

    const formattedGridRows = gridMatrix.map(row => row.join(""));
    const finalOutputString = formattedGridRows.join("\n").replace(/\+/g, " ");

    console.log(finalOutputString);
}
