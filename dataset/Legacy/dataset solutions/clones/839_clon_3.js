const BOARD_DIMENSION = 8;
const PADDING_CHARACTER = 'f';
const EMPTY_SPOT = '.';
const ALL_DIRECTIONS = [
    { dr: -1, dc: -1 }, { dr: -1, dc: 0 }, { dr: -1, dc: 1 },
    { dr: 0, dc: -1 }, { dr: 0, dc: 1 },
    { dr: 1, dc: -1 }, { dr: 1, dc: 0 }, { dr: 1, dc: 1 }
];

function calculateFlipCount(targetRow, targetCol, opponentPiece, currentPlayerPiece) {
    let totalFlipped = 0;
    for (const direction of ALL_DIRECTIONS) {
        let currentPathFlipCount = 0;
        let stepMultiplier = 1;
        while (true) {
            const checkRow = targetRow + direction.dr * stepMultiplier;
            const checkCol = targetCol + direction.dc * stepMultiplier;
            const cellContent = gameBoard[checkRow][checkCol];

            if (cellContent === PADDING_CHARACTER || cellContent === EMPTY_SPOT) {
                break;
            } else if (cellContent === opponentPiece) {
                currentPathFlipCount++;
            } else if (cellContent === currentPlayerPiece) {
                totalFlipped += currentPathFlipCount;
                break;
            }
            stepMultiplier++;
        }
    }
    return totalFlipped;
}

function applyMoveAndFlipPieces(targetRow, targetCol, opponentPiece, currentPlayerPiece) {
    gameBoard[targetRow][targetCol] = currentPlayerPiece;

    for (const direction of ALL_DIRECTIONS) {
        let stepMultiplier = 1;
        let potentialFlips = [];
        let foundEndPiece = false;

        while (true) {
            const checkRow = targetRow + direction.dr * stepMultiplier;
            const checkCol = targetCol + direction.dc * stepMultiplier;
            const cellContent = gameBoard[checkRow][checkCol];

            if (cellContent === PADDING_CHARACTER || cellContent === EMPTY_SPOT) {
                break;
            } else if (cellContent === opponentPiece) {
                potentialFlips.push({ r: checkRow, c: checkCol });
            } else if (cellContent === currentPlayerPiece) {
                foundEndPiece = true;
                break;
            }
            stepMultiplier++;
        }

        if (foundEndPiece && potentialFlips.length > 0) {
            for (const coord of potentialFlips) {
                gameBoard[coord.r][coord.c] = currentPlayerPiece;
            }
        }
    }
}

function findBestMove(playerPiece, opponentPiece, rowIterStart, rowIterEnd, colIterStart, colIterEnd, rowIterStep, colIterStep) {
    let maxFlipScore = 0;
    let bestMoveCoordinates = [];

    for (let row = rowIterStart; row !== rowIterEnd + rowIterStep; row += rowIterStep) {
        for (let col = colIterStart; col !== colIterEnd + colIterStep; col += colIterStep) {
            if (gameBoard[row][col] !== EMPTY_SPOT) {
                continue;
            }
            const currentFlipCount = calculateFlipCount(row, col, opponentPiece, playerPiece);
            if (currentFlipCount > maxFlipScore) {
                bestMoveCoordinates = [row, col];
                maxFlipScore = currentFlipCount;
            }
        }
    }
    return bestMoveCoordinates;
}

function findBestMoveForPlayerO() {
    return findBestMove("o", "x", 1, BOARD_DIMENSION, 1, BOARD_DIMENSION, 1, 1);
}

function findBestMoveForPlayerX() {
    return findBestMove("x", "o", BOARD_DIMENSION, 1, BOARD_DIMENSION, 1, -1, -1);
}

// var input = require('fs').readFileSync('/dev/stdin', 'utf8');
const rawInput = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

const inputLines = rawInput.trim().split("\n");
let gameBoard = [];

gameBoard.push(Array(BOARD_DIMENSION + 2).fill(PADDING_CHARACTER));

inputLines.forEach(function(line) {
    const paddedLine = PADDING_CHARACTER + line + PADDING_CHARACTER;
    gameBoard.push(paddedLine.split(""));
});

gameBoard.push(Array(BOARD_DIMENSION + 2).fill(PADDING_CHARACTER));

let consecutivePasses = 0;

while (true) {
    const playerOMove = findBestMoveForPlayerO();
    if (playerOMove.length === 0) {
        consecutivePasses++;
    } else {
        consecutivePasses = 0;
        applyMoveAndFlipPieces(playerOMove[0], playerOMove[1], "x", "o");
    }
    if (consecutivePasses === 2) {
        break;
    }

    const playerXMove = findBestMoveForPlayerX();
    if (playerXMove.length === 0) {
        consecutivePasses++;
    } else {
        consecutivePasses = 0;
        applyMoveAndFlipPieces(playerXMove[0], playerXMove[1], "o", "x");
    }
    if (consecutivePasses === 2) {
        break;
    }
}

gameBoard.shift();
gameBoard.pop();
console.log(gameBoard.map(row => row.join("").replace(/f/g, "")).join("\n"));
