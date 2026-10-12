const PLAYER_ONE = 1;
const PLAYER_TWO = -1;
const EMPTY_CELL = 0;
const BOARD_DIMENSION = 8;

const MOVE_VECTORS = [
    { r: 1, c: 1 },
    { r: 0, c: 1 },
    { r: -1, c: 1 },
    { r: 1, c: 0 },
    { r: -1, c: 0 },
    { r: 1, c: -1 },
    { r: 0, c: -1 },
    { r: -1, c: -1 }
];

const isWithinBounds = (r, c) => r >= 0 && r < BOARD_DIMENSION && c >= 0 && c < BOARD_DIMENSION;

function scanDirectionForFlips(currentBoard, playerToken, startR, startC, dr, dc) {
    const potentialFlips = [];
    let r = startR + dr;
    let c = startC + dc;

    while (isWithinBounds(r, c)) {
        const cellValue = currentBoard[r][c];
        if (cellValue === EMPTY_CELL) {
            return [];
        } else if (cellValue === playerToken) {
            return potentialFlips;
        } else {
            potentialFlips.push({ r, c });
        }
        r += dr;
        c += dc;
    }
    return [];
}

function calculateTotalFlips(currentBoard, playerToken, targetR, targetC) {
    if (currentBoard[targetR][targetC] !== EMPTY_CELL) {
        return 0;
    }

    let totalFlips = 0;
    for (const vector of MOVE_VECTORS) {
        totalFlips += scanDirectionForFlips(currentBoard, playerToken, targetR, targetC, vector.r, vector.c).length;
    }
    return totalFlips;
}

function executeMove(currentBoard, playerToken, targetR, targetC) {
    currentBoard[targetR][targetC] = playerToken;

    for (const vector of MOVE_VECTORS) {
        const piecesToFlip = scanDirectionForFlips(currentBoard, playerToken, targetR, targetC, vector.r, vector.c);
        for (const piece of piecesToFlip) {
            currentBoard[piece.r][piece.c] = playerToken;
        }
    }
}

function runOthelloSimulation(inputData) {
    const lines = inputData.split("\n");
    let boardState = Array.from({ length: BOARD_DIMENSION }, () => Array(BOARD_DIMENSION).fill(EMPTY_CELL));
    let filledCellCount = 0;

    for (let r = 0; r < BOARD_DIMENSION; r++) {
        for (let c = 0; c < BOARD_DIMENSION; c++) {
            const char = lines[r][c];
            if (char === 'o') {
                boardState[r][c] = PLAYER_ONE;
                filledCellCount++;
            } else if (char === 'x') {
                boardState[r][c] = PLAYER_TWO;
                filledCellCount++;
            }
        }
    }

    let currentPlayer = PLAYER_ONE;
    let consecutivePasses = false;

    while (filledCellCount < BOARD_DIMENSION * BOARD_DIMENSION) {
        const allPotentialMoves = [];
        for (let r = 0; r < BOARD_DIMENSION; r++) {
            for (let c = 0; c < BOARD_DIMENSION; c++) {
                if (boardState[r][c] === EMPTY_CELL) {
                    const flips = calculateTotalFlips(boardState, currentPlayer, r, c);
                    if (flips > 0) {
                        allPotentialMoves.push({ r, c, flips });
                    }
                }
            }
        }

        let chosenMove = null;
        if (allPotentialMoves.length > 0) {
            if (currentPlayer === PLAYER_ONE) {
                chosenMove = allPotentialMoves.reduce((best, current) => {
                    if (current.flips > best.flips) return current;
                    if (current.flips === best.flips) {
                        if (current.r < best.r) return current;
                        if (current.r === best.r && current.c < best.c) return current;
                    }
                    return best;
                }, { flips: -1, r: BOARD_DIMENSION, c: BOARD_DIMENSION });
            } else {
                chosenMove = allPotentialMoves.reduce((best, current) => {
                    if (current.flips > best.flips) return current;
                    if (current.flips === best.flips) {
                        if (current.r > best.r) return current;
                        if (current.r === best.r && current.c > best.c) return current;
                    }
                    return best;
                }, { flips: -1, r: -1, c: -1 });
            }
        }

        if (chosenMove && chosenMove.flips > 0) {
            consecutivePasses = false;
            filledCellCount++;
            executeMove(boardState, currentPlayer, chosenMove.r, chosenMove.c);
        } else {
            if (consecutivePasses) {
                break;
            }
            consecutivePasses = true;
        }
        currentPlayer *= (-1);
    }

    for (let r = 0; r < BOARD_DIMENSION; r++) {
        let rowOutput = "";
        for (let c = 0; c < BOARD_DIMENSION; c++) {
            if (boardState[r][c] === PLAYER_ONE) {
                rowOutput += 'o';
            } else if (boardState[r][c] === PLAYER_TWO) {
                rowOutput += 'x';
            } else {
                rowOutput += '.';
            }
        }
        console.log(rowOutput);
    }
}

runOthelloSimulation(require("fs").readFileSync("/dev/stdin", "utf8"));
