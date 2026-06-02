const BOARD_SIZE = 8;
const BOARD_EDGE_CHAR = "f";
const EMPTY_CELL_CHAR = ".";

let boardState = [];

function forEachDirection(callback) {
    const directionY = [-1, -1, -1, 0, 0, 1, 1, 1];
    const directionX = [-1, 0, 1, -1, 1, -1, 0, 1];
    for (let dirIndex = 0; dirIndex < BOARD_SIZE; dirIndex++) {
        callback(directionY[dirIndex], directionX[dirIndex]);
    }
}

function calculateCaptureCount(yCoord, xCoord, playerPiece, opponentPiece) {
    let totalCaptures = 0;

    forEachDirection((currentDirY, currentDirX) => {
        let capturesInDirection = 0;
        let stepDistance = 1;

        while (true) {
            const targetCellY = yCoord + currentDirY * stepDistance;
            const targetCellX = xCoord + currentDirX * stepDistance;
            const targetCellValue = boardState[targetCellY]?.[targetCellX];

            if (targetCellValue === BOARD_EDGE_CHAR || targetCellValue === EMPTY_CELL_CHAR || targetCellValue === undefined) {
                break;
            } else if (targetCellValue === opponentPiece) {
                capturesInDirection++;
            } else if (targetCellValue === playerPiece) {
                totalCaptures += capturesInDirection;
                break;
            }
            stepDistance++;
        }
    });
    return totalCaptures;
}

function findBestMoveForX() {
    let maxCaptures = 0;
    let bestMoveCoordinates = [];

    for (let row = 1; row <= BOARD_SIZE; row++) {
        for (let col = 1; col <= BOARD_SIZE; col++) {
            if (boardState[row][col] !== EMPTY_CELL_CHAR) {
                continue;
            }
            const currentCaptures = calculateCaptureCount(row, col, "x", "o");
            if (currentCaptures > maxCaptures) {
                bestMoveCoordinates = [row, col];
                maxCaptures = currentCaptures;
            }
        }
    }
    return bestMoveCoordinates;
}

function findBestMoveForO() {
    let maxCaptures = 0;
    let bestMoveCoordinates = [];

    for (let row = BOARD_SIZE; row >= 1; row--) {
        for (let col = BOARD_SIZE; col >= 1; col--) {
            const currentCaptures = calculateCaptureCount(row, col, "o", "x");
            if (boardState[row][col] !== EMPTY_CELL_CHAR) {
                continue;
            }
            if (currentCaptures > maxCaptures) {
                bestMoveCoordinates = [row, col];
                maxCaptures = currentCaptures;
            }
        }
    }
    return bestMoveCoordinates;
}

function applyMoveAndFlipPieces(yCoord, xCoord, opponentPiece, playerPiece) {
    boardState[yCoord][xCoord] = playerPiece;

    forEachDirection((currentDirY, currentDirX) => {
        let stepDistance = 1;
        let foundOpponentPiece = false;

        while (true) {
            const targetCellY = yCoord + currentDirY * stepDistance;
            const targetCellX = xCoord + currentDirX * stepDistance;
            const targetCellValue = boardState[targetCellY]?.[targetCellX];

            if (targetCellValue === BOARD_EDGE_CHAR || targetCellValue === EMPTY_CELL_CHAR || targetCellValue === undefined) {
                break;
            } else if (targetCellValue === opponentPiece) {
                foundOpponentPiece = true;
            } else if (targetCellValue === playerPiece) {
                if (foundOpponentPiece) {
                    let flipStep = stepDistance - 1;
                    while (flipStep >= 1) {
                        boardState[yCoord + currentDirY * flipStep][xCoord + currentDirX * flipStep] = playerPiece;
                        flipStep--;
                    }
                }
                break;
            }
            stepDistance++;
        }
    });
}

function initializeBoard(rawInput) {
    const inputLines = rawInput.trim().split("\n");
    const paddedBoundaryRow = Array(BOARD_SIZE + 2).fill(BOARD_EDGE_CHAR);

    boardState.push(paddedBoundaryRow);

    inputLines.forEach(line => {
        const paddedLine = BOARD_EDGE_CHAR + line + BOARD_EDGE_CHAR;
        boardState.push(paddedLine.split(""));
    });

    boardState.push(paddedBoundaryRow);
}

function displayFinalBoardState() {
    boardState.shift();
    boardState.pop();

    const formattedOutput = boardState.map(row => row.join("")).join("\n").replace(/f/g, "");
    console.log(formattedOutput);
}

const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
initializeBoard(rawInputString);

let consecutivePasses = 0;

while (true) {
    const xMoveResult = findBestMoveForX();
    if (xMoveResult.length === 0) {
        consecutivePasses++;
    } else {
        consecutivePasses = 0;
        applyMoveAndFlipPieces(xMoveResult[0], xMoveResult[1], "x", "o");
    }

    const oMoveResult = findBestMoveForO();
    if (oMoveResult.length === 0) {
        consecutivePasses++;
    } else {
        consecutivePasses = 0;
        applyMoveAndFlipPieces(oMoveResult[0], oMoveResult[1], "o", "x");
    }

    if (consecutivePasses >= 2) {
        break;
    }
}

displayFinalBoardState();
