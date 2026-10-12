const BOARD_ROWS = 12;
const BOARD_COLS = 6;
const ROW_OFFSETS = [-1, 0, 0, 1];
const COL_OFFSETS = [0, -1, 1, 0];

function isWithinBounds(r, c) {
    return r >= 0 && r < BOARD_ROWS && c >= 0 && c < BOARD_COLS;
}

function discoverConnectedBlocks(startR, startC, blockType, currentBoard) {
    const explorationQueue = [[startR, startC]];
    const visitedCells = new Set();
    const chainCoordinates = [];
    let chainSize = 0;

    visitedCells.add(`${startR},${startC}`);

    let head = 0;
    while (head < explorationQueue.length) {
        const [currentRow, currentCol] = explorationQueue[head++];
        chainCoordinates.push([currentRow, currentCol]);
        chainSize++;

        for (let k = 0; k < 4; k++) {
            const neighborRow = currentRow + ROW_OFFSETS[k];
            const neighborCol = currentCol + COL_OFFSETS[k];
            const neighborKey = `${neighborRow},${neighborCol}`;

            if (isWithinBounds(neighborRow, neighborCol) &&
                currentBoard[neighborRow][neighborCol] === blockType &&
                !visitedCells.has(neighborKey)) {
                visitedCells.add(neighborKey);
                explorationQueue.push([neighborRow, neighborCol]);
            }
        }
    }
    return { size: chainSize, locations: chainCoordinates };
}

function removeConnectedBlocks(startR, startC, blockType, currentBoard) {
    const removalQueue = [[startR, startC]];
    const processedCells = new Set();

    processedCells.add(`${startR},${startC}`);
    currentBoard[startR][startC] = ".";

    let head = 0;
    while (head < removalQueue.length) {
        const [currentRow, currentCol] = removalQueue[head++];

        for (let k = 0; k < 4; k++) {
            const neighborRow = currentRow + ROW_OFFSETS[k];
            const neighborCol = currentCol + COL_OFFSETS[k];
            const neighborKey = `${neighborRow},${neighborCol}`;

            if (isWithinBounds(neighborRow, neighborCol) && !processedCells.has(neighborKey)) {
                const neighborBlock = currentBoard[neighborRow][neighborCol];
                if (neighborBlock === blockType || neighborBlock === "O") {
                    processedCells.add(neighborKey);
                    currentBoard[neighborRow][neighborCol] = ".";
                    removalQueue.push([neighborRow, neighborCol]);
                }
            }
        }
    }
}

function applyBoardGravity(currentBoard) {
    for (let col = 0; col < BOARD_COLS; col++) {
        const columnBlocks = [];
        for (let row = BOARD_ROWS - 1; row >= 0; row--) {
            if (currentBoard[row][col] !== ".") {
                columnBlocks.unshift(currentBoard[row][col]);
            }
        }

        for (let row = 0; row < BOARD_ROWS - columnBlocks.length; row++) {
            currentBoard[row][col] = ".";
        }
        for (let row = 0; row < columnBlocks.length; row++) {
            currentBoard[BOARD_ROWS - columnBlocks.length + row][col] = columnBlocks[row];
        }
    }
}

function runGameSimulation(initialBoardState) {
    let currentBoardState = initialBoardState.map(row => [...row]);
    let totalClearPhases = 0;

    while (true) {
        const cellsToClear = new Set();
        const visitedForDiscovery = new Set();

        for (let r = 0; r < BOARD_ROWS; r++) {
            for (let c = 0; c < BOARD_COLS; c++) {
                const currentBlock = currentBoardState[r][c];
                const cellKey = `${r},${c}`;

                if (currentBlock !== "." && currentBlock !== "O" && !visitedForDiscovery.has(cellKey)) {
                    const chainResult = discoverConnectedBlocks(r, c, currentBlock, currentBoardState);

                    chainResult.locations.forEach(([cr, cc]) => visitedForDiscovery.add(`${cr},${cc}`));

                    if (chainResult.size >= 4) {
                        chainResult.locations.forEach(([cr, cc]) => cellsToClear.add(`${cr},${cc}`));
                    }
                }
            }
        }

        if (cellsToClear.size === 0) {
            break;
        }

        totalClearPhases++;

        const uniqueClearCoords = Array.from(cellsToClear).map(s => s.split(',').map(Number));
        
        for (const [clearR, clearC] of uniqueClearCoords) {
            if (currentBoardState[clearR][clearC] !== ".") {
                removeConnectedBlocks(clearR, clearC, currentBoardState[clearR][clearC], currentBoardState);
            }
        }

        applyBoardGravity(currentBoardState);
    }

    return totalClearPhases;
}

const fileInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileInput.trim().split("\n");

const numberOfGames = parseInt(inputLines.shift(), 10);

for (let gameIdx = 0; gameIdx < numberOfGames; gameIdx++) {
    const initialBoard = [];
    for (let rowIdx = 0; rowIdx < BOARD_ROWS; rowIdx++) {
        initialBoard.push(inputLines.shift().split(""));
    }
    console.log(runGameSimulation(initialBoard));
}
