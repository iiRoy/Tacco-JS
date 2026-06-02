function detectPopGroups(boardGrid) {
    const rowCount = boardGrid.length;
    const colCount = boardGrid[0].length;
    const visitedCells = Array.from({ length: rowCount }, () => Array(colCount).fill(false));
    const allPopCoordinates = [];

    const neighborOffsets = [[-1, 0], [0, -1], [0, 1], [1, 0]];

    for (let r = 0; r < rowCount; r++) {
        for (let c = 0; c < colCount; c++) {
            if (boardGrid[r][c] !== '.' && !visitedCells[r][c]) {
                const initialColor = boardGrid[r][c];
                const bfsQueue = [[r, c]];
                const currentGroupCells = [];
                visitedCells[r][c] = true;

                let queuePointer = 0;
                while (queuePointer < bfsQueue.length) {
                    const [currentY, currentX] = bfsQueue[queuePointer++];
                    currentGroupCells.push([currentY, currentX]);

                    for (const [dy, dx] of neighborOffsets) {
                        const nextY = currentY + dy;
                        const nextX = currentX + dx;

                        if (nextY >= 0 && nextY < rowCount && nextX >= 0 && nextX < colCount &&
                            !visitedCells[nextY][nextX] && boardGrid[nextY][nextX] === initialColor) {
                            visitedCells[nextY][nextX] = true;
                            bfsQueue.push([nextY, nextX]);
                        }
                    }
                }

                if (currentGroupCells.length >= 4) {
                    allPopCoordinates.push(...currentGroupCells);
                }
            }
        }
    }
    return allPopCoordinates;
}

function clearPuyosAndObstacles(boardGrid, coordsToClear) {
    const rowCount = boardGrid.length;
    const colCount = boardGrid[0].length;
    const updatedGrid = boardGrid.map(row => [...row]);
    const neighborOffsets = [[-1, 0], [0, -1], [0, 1], [1, 0]];

    for (const [y, x] of coordsToClear) {
        updatedGrid[y][x] = '.';
    }

    for (const [clearedY, clearedX] of coordsToClear) {
        for (const [dy, dx] of neighborOffsets) {
            const adjY = clearedY + dy;
            const adjX = clearedX + dx;

            if (adjY >= 0 && adjY < rowCount && adjX >= 0 && adjX < colCount && updatedGrid[adjY][adjX] === 'O') {
                updatedGrid[adjY][adjX] = '.';
            }
        }
    }
    return updatedGrid;
}

function applyColumnGravity(boardGrid) {
    const rowCount = boardGrid.length;
    const colCount = boardGrid[0].length;
    const newGravityGrid = Array.from({ length: rowCount }, () => Array(colCount).fill('.'));

    for (let c = 0; c < colCount; c++) {
        const activePuyosInColumn = [];
        for (let r = rowCount - 1; r >= 0; r--) {
            if (boardGrid[r][c] !== '.') {
                activePuyosInColumn.push(boardGrid[r][c]);
            }
        }
        for (let i = 0; i < activePuyosInColumn.length; i++) {
            newGravityGrid[rowCount - 1 - i][c] = activePuyosInColumn[i];
        }
    }
    return newGravityGrid;
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const lines = inputData.trim().split("\n");
const numberOfCases = parseInt(lines.shift(), 10);

for (let caseIndex = 0; caseIndex < numberOfCases; caseIndex++) {
    let currentBoardState = [];
    for (let r = 0; r < 12; r++) {
        currentBoardState.push(lines.shift().split(""));
    }

    let chainCounter = 0;
    while (true) {
        const popCandidates = detectPopGroups(currentBoardState);

        if (popCandidates.length === 0) {
            break;
        }

        chainCounter++;
        currentBoardState = clearPuyosAndObstacles(currentBoardState, popCandidates);
        currentBoardState = applyColumnGravity(currentBoardState);
    }
    console.log(chainCounter);
}
