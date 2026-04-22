const boardRows = 8;
const boardCols = 8;
const blankCell = 0;
const darkChip = 1; // Corresponds to original 'x'
const lightChip = -1; // Corresponds to original 'o'

const allVectors = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1], /*  [0, 0], */ [0, 1],
    [1, -1], [1, 0], [1, 1]
];

function coordinateToIndex(r, c) {
    return r * boardCols + c;
}

function indexToCoordinate(idx) {
    return { row: Math.floor(idx / boardCols), col: idx % boardCols };
}

function isWithinBoundary(r, c) {
    return r >= 0 && r < boardRows && c >= 0 && c < boardCols;
}

function retrieveChip(currentBoard, r, c) {
    if (!isWithinBoundary(r, c)) {
        return undefined;
    }
    return currentBoard[coordinateToIndex(r, c)];
}

function computePotentialCaptures(currentBoard, initialR, initialC, dr, dc, playerChip, adversaryChip) {
    const capturedChipsInLine = [];
    let currentR = initialR + dr;
    let currentC = initialC + dc;

    while (isWithinBoundary(currentR, currentC)) {
        const chipAtPosition = retrieveChip(currentBoard, currentR, currentC);

        if (chipAtPosition === adversaryChip) {
            capturedChipsInLine.push({ row: currentR, col: currentC });
        } else if (chipAtPosition === playerChip) {
            return capturedChipsInLine;
        } else {
            return [];
        }
        currentR += dr;
        currentC += dc;
    }
    return [];
}

function countCaptures(currentBoard, moveR, moveC, playerChip, adversaryChip) {
    if (retrieveChip(currentBoard, moveR, moveC) !== blankCell) {
        return 0;
    }

    let totalCaptures = 0;
    for (const [dr, dc] of allVectors) {
        const lineCaptures = computePotentialCaptures(currentBoard, moveR, moveC, dr, dc, playerChip, adversaryChip);
        totalCaptures += lineCaptures.length;
    }
    return totalCaptures;
}

function findBestPlacement(currentBoard, currentActiveChip) {
    const adversaryChip = (currentActiveChip === darkChip) ? lightChip : darkChip;
    const possibleMoves = [];

    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            if (retrieveChip(currentBoard, r, c) === blankCell) {
                const captures = countCaptures(currentBoard, r, c, currentActiveChip, adversaryChip);
                if (captures > 0) {
                    possibleMoves.push({ row: r, col: c, captures: captures });
                }
            }
        }
    }

    if (possibleMoves.length === 0) {
        return null;
    }

    if (currentActiveChip === lightChip) { // Original A, prefers min row/col
        possibleMoves.sort((m1, m2) => {
            if (m1.captures !== m2.captures) return m2.captures - m1.captures;
            if (m1.row !== m2.row) return m1.row - m2.row;
            return m1.col - m2.col;
        });
    } else { // Original B, prefers max row/col
        possibleMoves.sort((m1, m2) => {
            if (m1.captures !== m2.captures) return m2.captures - m1.captures;
            if (m1.row !== m2.row) return m2.row - m1.row;
            return m2.col - m1.col;
        });
    }

    const best = possibleMoves[0];
    return [best.row + 1, best.col + 1]; // Return 1-indexed coordinates
}

function executePlacement(initialBoard, placementR, placementC, playerChip, adversaryChip) {
    const updatedBoard = [...initialBoard];

    updatedBoard[coordinateToIndex(placementR, placementC)] = playerChip;

    for (const [dr, dc] of allVectors) {
        const chipsToFlip = computePotentialCaptures(initialBoard, placementR, placementC, dr, dc, playerChip, adversaryChip);
        chipsToFlip.forEach(chipCoord => {
            updatedBoard[coordinateToIndex(chipCoord.row, chipCoord.col)] = playerChip;
        });
    }
    return updatedBoard;
}

function initiateGame(initialBoardString) {
    const boardLines = initialBoardString.trim().split('\n');
    let currentBoardState = Array(boardRows * boardCols).fill(blankCell);
    boardLines.forEach((line, r) => {
        line.split('').forEach((char, c) => {
            if (char === 'x') currentBoardState[coordinateToIndex(r, c)] = darkChip;
            else if (char === 'o') currentBoardState[coordinateToIndex(r, c)] = lightChip;
        });
    });

    let activePlayer = lightChip; // Player 'o' (lightChip) starts first
    let opponentPlayer = darkChip; // Player 'x' (darkChip)
    let consecutivePasses = 0;

    while (consecutivePasses < 2) {
        const potentialMove = findBestPlacement(currentBoardState, activePlayer);

        if (potentialMove === null) {
            consecutivePasses++;
        } else {
            consecutivePasses = 0;
            const [moveR, moveC] = [potentialMove[0] - 1, potentialMove[1] - 1];
            currentBoardState = executePlacement(currentBoardState, moveR, moveC, activePlayer, opponentPlayer);
        }

        [activePlayer, opponentPlayer] = [opponentPlayer, activePlayer];
    }

    let finalBoardOutput = '';
    for (let r = 0; r < boardRows; r++) {
        for (let c = 0; c < boardCols; c++) {
            const chip = currentBoardState[coordinateToIndex(r, c)];
            if (chip === darkChip) finalBoardOutput += 'x';
            else if (chip === lightChip) finalBoardOutput += 'o';
            else finalBoardOutput += '.';
        }
        if (r < boardRows - 1) finalBoardOutput += '\n';
    }
    return finalBoardOutput;
}

const initialInputState = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

console.log(initiateGame(initialInputState));