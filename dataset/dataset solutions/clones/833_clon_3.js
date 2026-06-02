const BOARD_ROWS = 12;
const BOARD_COLS = 6;
const NEIGHBOR_OFFSETS = [
    { dr: -1, dc: 0 },
    { dr: 0, dc: -1 },
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 }
];

function checkBounds(r, c) {
    return r >= 0 && c >= 0 && r < BOARD_ROWS && c < BOARD_COLS;
}

function detonateChain(currentRow, currentCol, targetColor, boardState) {
    for (const offset of NEIGHBOR_OFFSETS) {
        const nextRow = currentRow + offset.dr;
        const nextCol = currentCol + offset.dc;

        if (!checkBounds(nextRow, nextCol)) {
            continue;
        }

        if (boardState[nextRow][nextCol] === targetColor) {
            boardState[nextRow][nextCol] = ".";
            detonateChain(nextRow, nextCol, targetColor, boardState);
        } else if (boardState[nextRow][nextCol] === "O") {
            boardState[nextRow][nextCol] = ".";
        }
    }
}

function applyGravityToColumn(targetRow, targetCol, boardState) {
    let currentRowScan = targetRow;
    while (currentRowScan > 0) {
        currentRowScan--;
        if (boardState[currentRowScan][targetCol] !== ".") {
            boardState[targetRow][targetCol] = boardState[currentRowScan][targetCol];
            boardState[currentRowScan][targetCol] = ".";
            break;
        }
    }
}

const fileSystem = require('fs');
const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');
const numberOfTestCases = parseInt(inputLines.shift(), 10);

for (let testCaseIdx = 0; testCaseIdx < numberOfTestCases; testCaseIdx++) {
    let currentBoard = [];
    for (let r = 0; r < BOARD_ROWS; r++) {
        currentBoard.push(inputLines.shift().split(''));
    }

    let totalChainReactions = 0;

    while (true) {
        let cellsToDetonate = [];
        let currentChainSize;

        function findConnectedChain(currentRow, currentCol, targetColor, boardState) {
            for (const offset of NEIGHBOR_OFFSETS) {
                const nextRow = currentRow + offset.dr;
                const nextCol = currentCol + offset.dc;

                if (!checkBounds(nextRow, nextCol)) {
                    continue;
                }

                if (boardState[nextRow][nextCol] === targetColor) {
                    currentChainSize++;
                    if (currentChainSize === 4) {
                        cellsToDetonate.push([nextRow, nextCol]);
                    }
                    boardState[nextRow][nextCol] = targetColor + currentChainSize;
                    findConnectedChain(nextRow, nextCol, targetColor, boardState);
                }
            }
        }

        const possibleInitialColors = ["R", "G", "B", "Y", "P"];
        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const cellContent = currentBoard[r][c];
                if (possibleInitialColors.includes(cellContent)) {
                    currentChainSize = 1;
                    currentBoard[r][c] = cellContent + currentChainSize;
                    findConnectedChain(r, c, cellContent, currentBoard);
                }
            }
        }

        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                currentBoard[r][c] = currentBoard[r][c].charAt(0);
            }
        }

        if (cellsToDetonate.length === 0) {
            break;
        }

        totalChainReactions++;

        cellsToDetonate.forEach(cellCoord => {
            const [detonateRow, detonateCol] = cellCoord;
            const originalColor = currentBoard[detonateRow][detonateCol];
            detonateChain(detonateRow, detonateCol, originalColor, currentBoard);
        });

        for (let r = BOARD_ROWS - 1; r >= 0; r--) {
            for (let c = 0; c < BOARD_COLS; c++) {
                if (currentBoard[r][c] === ".") {
                    applyGravityToColumn(r, c, currentBoard);
                }
            }
        }
    }
    console.log(totalChainReactions);
}
