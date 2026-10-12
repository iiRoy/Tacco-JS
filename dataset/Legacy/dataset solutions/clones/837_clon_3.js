const deltaX = [1, 1, 1, 0, 0, -1, -1, -1];
const deltaY = [1, 0, -1, 1, -1, 1, 0, -1];

const BOARD_DIMENSION = 8;
const MIN_BOARD_COORD = 1;
const MAX_BOARD_COORD = 8;
const EMPTY_CELL = 0;
const PLAYER_ONE_PIECE = 1;
const PLAYER_TWO_PIECE = -1;
const TOTAL_CELLS = BOARD_DIMENSION * BOARD_DIMENSION;

const isWithinBounds = (row, col) =>
    row >= MIN_BOARD_COORD && row <= MAX_BOARD_COORD &&
    col >= MIN_BOARD_COORD && col <= MAX_BOARD_COORD;

function calculatePotentialFlips(boardState, activePlayer, targetRow, targetCol) {
    let totalFlips = 0;
    const opponentPlayer = activePlayer * (-1);

    for (let directionIndex = 0; directionIndex < BOARD_DIMENSION; directionIndex++) {
        let currentDirectionFlips = 0;
        let currentX = targetCol + deltaX[directionIndex];
        let currentY = targetRow + deltaY[directionIndex];

        while (isWithinBounds(currentY, currentX)) {
            const cellValue = boardState[currentY][currentX];
            if (cellValue === activePlayer) {
                totalFlips += currentDirectionFlips;
                break;
            } else if (cellValue === opponentPlayer) {
                currentDirectionFlips++;
            } else {
                break;
            }
            currentX += deltaX[directionIndex];
            currentY += deltaY[directionIndex];
        }
    }
    return totalFlips;
}

function applyMoveToBoard(boardState, activePlayer, targetRow, targetCol) {
    const opponentPlayer = activePlayer * (-1);

    for (let directionIndex = 0; directionIndex < BOARD_DIMENSION; directionIndex++) {
        let currentDirectionFlips = 0;
        let currentX = targetCol + deltaX[directionIndex];
        let currentY = targetRow + deltaY[directionIndex];
        let foundOwnPiece = false;

        while (isWithinBounds(currentY, currentX)) {
            const cellValue = boardState[currentY][currentX];
            if (cellValue === activePlayer) {
                foundOwnPiece = true;
                break;
            } else if (cellValue === opponentPlayer) {
                currentDirectionFlips++;
            } else {
                break;
            }
            currentX += deltaX[directionIndex];
            currentY += deltaY[directionIndex];
        }

        if (foundOwnPiece && currentDirectionFlips > 0) {
            currentX = targetCol + deltaX[directionIndex];
            currentY = targetRow + deltaY[directionIndex];

            for (let flipCount = 0; flipCount < currentDirectionFlips; flipCount++) {
                boardState[currentY][currentX] = activePlayer;
                currentX += deltaX[directionIndex];
                currentY += deltaY[directionIndex];
            }
        }
    }
    boardState[targetRow][targetCol] = activePlayer;
}

const togglePlayer = (player) => player * (-1);

function Main(input) {
    const inputLines = input.split("\n");
    
    const boardState = Array.from({ length: MAX_BOARD_COORD + 1 }, () => Array(MAX_BOARD_COORD + 1).fill(EMPTY_CELL));

    let occupiedCellsCount = 0;

    for (let row = MIN_BOARD_COORD; row <= MAX_BOARD_COORD; row++) {
        const currentRowInput = inputLines[row - 1];
        for (let col = MIN_BOARD_COORD; col <= MAX_BOARD_COORD; col++) {
            const char = currentRowInput[col - 1];
            if (char === 'o') {
                occupiedCellsCount++;
                boardState[row][col] = PLAYER_ONE_PIECE;
            } else if (char === 'x') {
                occupiedCellsCount++;
                boardState[row][col] = PLAYER_TWO_PIECE;
            } else {
                boardState[row][col] = EMPTY_CELL;
            }
        }
    }

    let activePlayer = PLAYER_ONE_PIECE;
    let consecutivePass = false;

    while (occupiedCellsCount < TOTAL_CELLS) {
        let maxPossibleFlips = 0;
        let bestMoveRow = -1;
        let bestMoveCol = -1;

        if (activePlayer === PLAYER_ONE_PIECE) {
            for (let row = MIN_BOARD_COORD; row <= MAX_BOARD_COORD; row++) {
                for (let col = MIN_BOARD_COORD; col <= MAX_BOARD_COORD; col++) {
                    if (boardState[row][col] === EMPTY_CELL) {
                        const flipsForCurrentMove = calculatePotentialFlips(boardState, activePlayer, row, col);
                        if (flipsForCurrentMove > maxPossibleFlips) {
                            maxPossibleFlips = flipsForCurrentMove;
                            bestMoveRow = row;
                            bestMoveCol = col;
                        }
                    }
                }
            }
        } else {
            for (let row = MIN_BOARD_COORD; row <= MAX_BOARD_COORD; row++) {
                for (let col = MIN_BOARD_COORD; col <= MAX_BOARD_COORD; col++) {
                    if (boardState[row][col] === EMPTY_CELL) {
                        const flipsForCurrentMove = calculatePotentialFlips(boardState, activePlayer, row, col);
                        if (flipsForCurrentMove >= maxPossibleFlips) {
                            maxPossibleFlips = flipsForCurrentMove;
                            bestMoveRow = row;
                            bestMoveCol = col;
                        }
                    }
                }
            }
        }

        if (maxPossibleFlips > 0) {
            consecutivePass = false;
            occupiedCellsCount++;
            applyMoveToBoard(boardState, activePlayer, bestMoveRow, bestMoveCol);
        } else {
            if (consecutivePass) {
                break;
            }
            consecutivePass = true;
        }
        activePlayer = togglePlayer(activePlayer);
    }

    for (let row = MIN_BOARD_COORD; row <= MAX_BOARD_COORD; row++) {
        let outputRowString = '';
        for (let col = MIN_BOARD_COORD; col <= MAX_BOARD_COORD; col++) {
            const cellValue = boardState[row][col];
            if (cellValue === PLAYER_ONE_PIECE) {
                outputRowString += 'o';
            } else if (cellValue === PLAYER_TWO_PIECE) {
                outputRowString += 'x';
            } else {
                outputRowString += '.';
            }
        }
        console.log(outputRowString);
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
