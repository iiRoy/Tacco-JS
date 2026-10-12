const GRID_ROWS = 12;
const GRID_COLS = 6;
const EMPTY_CELL_MARKER = ".";

let gameGrid;
let currentChainCount;
let pendingExplosions;

function isValidCoordinate(row, col) {
    return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
}

function exploreChain(startRow, startCol, targetColor) {
    const rowOffsets = [-1, 0, 0, 1];
    const colOffsets = [0, -1, 1, 0];

    for (let i = 0; i < 4; i++) {
        const nextRow = startRow + rowOffsets[i];
        const nextCol = startCol + colOffsets[i];

        if (!isValidCoordinate(nextRow, nextCol)) {
            continue;
        }

        if (gameGrid[nextRow][nextCol] === targetColor) {
            currentChainCount++;
            if (currentChainCount === 4) {
                pendingExplosions.push([nextRow, nextCol]);
            }
            gameGrid[nextRow][nextCol] = targetColor + currentChainCount;
            exploreChain(nextRow, nextCol, targetColor);
        }
    }
}

function clearChain(startRow, startCol, targetColor) {
    const rowOffsets = [-1, 0, 0, 1];
    const colOffsets = [0, -1, 1, 0];

    for (let i = 0; i < 4; i++) {
        const nextRow = startRow + rowOffsets[i];
        const nextCol = startCol + colOffsets[i];

        if (!isValidCoordinate(nextRow, nextCol)) {
            continue;
        }

        const cellContent = gameGrid[nextRow][nextCol];
        if (cellContent === targetColor) {
            gameGrid[nextRow][nextCol] = EMPTY_CELL_MARKER;
            clearChain(nextRow, nextCol, targetColor);
        } else if (cellContent === "O") {
            gameGrid[nextRow][nextCol] = EMPTY_CELL_MARKER;
        }
    }
}

function shiftDown(startRow, colIndex) {
    let destinationRow = startRow;
    let currentRow = startRow;
    while (currentRow > 0) {
        currentRow--;
        if (gameGrid[currentRow][colIndex] !== EMPTY_CELL_MARKER) {
            gameGrid[destinationRow][colIndex] = gameGrid[currentRow][colIndex];
            gameGrid[currentRow][colIndex] = EMPTY_CELL_MARKER;
            break;
        }
    }
}

function processCellForChainDetection(r, c) {
    const cellValue = gameGrid[r][c];
    if (cellValue.length === 1 && cellValue !== EMPTY_CELL_MARKER && cellValue !== "O") {
        currentChainCount = 1;
        gameGrid[r][c] = cellValue + currentChainCount;
        exploreChain(r, c, cellValue);
    }
}

const fileInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileInput.trim().split("\n");

let numGames = Number(inputLines.shift());

for (let gameIndex = 0; gameIndex < numGames; gameIndex++) {
    gameGrid = [];
    for (let r = 0; r < GRID_ROWS; r++) {
        const gridRowChars = inputLines.shift().split("");
        gameGrid.push(gridRowChars);
    }

    let totalExplosions = 0;

    while (true) {
        pendingExplosions = [];
        currentChainCount = 0;

        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                processCellForChainDetection(r, c);
            }
        }

        for (let r = 0; r < GRID_ROWS; r++) {
            for (let c = 0; c < GRID_COLS; c++) {
                gameGrid[r][c] = String(gameGrid[r][c]).charAt(0);
            }
        }

        if (pendingExplosions.length === 0) {
            break;
        }

        totalExplosions++;

        pendingExplosions.forEach(function(coords) {
            const rowToClear = coords[0];
            const colToClear = coords[1];
            const colorToClear = gameGrid[rowToClear][colToClear];
            if (colorToClear !== EMPTY_CELL_MARKER) {
                clearChain(rowToClear, colToClear, colorToClear);
            }
        });

        for (let c = 0; c < GRID_COLS; c++) {
            for (let r = GRID_ROWS - 1; r >= 0; r--) {
                if (gameGrid[r][c] === EMPTY_CELL_MARKER) {
                    shiftDown(r, c);
                }
            }
        }
    }
    console.log(totalExplosions);
}
