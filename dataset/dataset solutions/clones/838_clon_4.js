const BOARD_DIMENSION = 8;
const GRID_DIMENSION = BOARD_DIMENSION + 2; // For 1-cell 'margin' padding
const CELL_EMPTY = 0;
const PLAYER_X = 1; // Represents original 'x'
const PLAYER_O = 2; // Represents original 'o'
const CELL_MARGIN = -1; // Represents original 'f'

// Directional vectors for 8 possible moves
const directionalVectors = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
];

// Recursively counts flippable pieces in a single direction
function tallyFlippableInDirection(currentRow, currentCol, deltaRow, deltaCol, activePlayer, adversaryPlayer, currentGrid, count = 0) {
    const nextRow = currentRow + deltaRow;
    const nextCol = currentCol + deltaCol;
    const cellContent = currentGrid[nextRow * GRID_DIMENSION + nextCol];

    if (cellContent === CELL_MARGIN || cellContent === CELL_EMPTY) {
        return 0; // Boundary or empty cell reached, no flips
    }
    if (cellContent === adversaryPlayer) {
        return tallyFlippableInDirection(nextRow, nextCol, deltaRow, deltaCol, activePlayer, adversaryPlayer, currentGrid, count + 1);
    }
    if (cellContent === activePlayer) {
        return count; // Own piece found, return accumulated flips
    }
    return 0; // Fallback, should not be hit with valid game states
}

// Evaluates the total flip potential for a given placement
function assessMoveUtility(rowCoord, colCoord, activePlayer, adversaryPlayer, currentGrid) {
    return directionalVectors.reduce((totalScore, [dr, dc]) => {
        return totalScore + tallyFlippableInDirection(rowCoord, colCoord, dr, dc, activePlayer, adversaryPlayer, currentGrid);
    }, 0);
}

// Identifies the optimal placement for a player
function determineOptimalPlacement(activePlayer, adversaryPlayer, currentGrid) {
    let topScore = 0;
    let preferredCoords = null;

    // Generate all 8x8 board positions (1-indexed)
    const allGamePositions = Array.from({ length: BOARD_DIMENSION }, (_, r) => r + 1)
                                .flatMap(r => Array.from({ length: BOARD_DIMENSION }, (_, c) => [r, c + 1]));

    // Evaluate each potential move
    const candidateMoves = allGamePositions.map(([r, c]) => {
        if (currentGrid[r * GRID_DIMENSION + c] === CELL_EMPTY) {
            const score = assessMoveUtility(r, c, activePlayer, adversaryPlayer, currentGrid);
            return { r, c, score };
        }
        return null; // Not an empty cell
    }).filter(move => move !== null && move.score > 0); // Keep only valid moves with flips

    // Find the move with the highest score. If scores are equal, the first encountered (top-left first) is chosen.
    if (candidateMoves.length > 0) {
        const bestOption = candidateMoves.reduce((prev, curr) => (prev.score >= curr.score) ? prev : curr);
        preferredCoords = [bestOption.r, bestOption.c];
        topScore = bestOption.score;
    }

    return preferredCoords; // Returns null if no valid moves
}

// Applies a move to the board and performs flips
function executeMoveAndFlip(rowCoord, colCoord, activePlayer, adversaryPlayer, currentGrid) {
    // Place the new stone
    currentGrid[rowCoord * GRID_DIMENSION + colCoord] = activePlayer;

    for (const [dr, dc] of directionalVectors) {
        let potentialFlips = [];
        let distance = 1;
        let foundOpponentSequence = false;

        while (true) {
            const nextRow = rowCoord + dr * distance;
            const nextCol = colCoord + dc * distance;
            const cellContent = currentGrid[nextRow * GRID_DIMENSION + nextCol];

            if (cellContent === CELL_MARGIN || cellContent === CELL_EMPTY) {
                // Hit boundary or empty cell, no flips in this direction
                potentialFlips = []; // Clear candidates
                break;
            } else if (cellContent === adversaryPlayer) {
                // Found opponent's stone, add to potential flips
                potentialFlips.push([nextRow, nextCol]);
                foundOpponentSequence = true;
            } else if (cellContent === activePlayer) {
                // Found current player's stone, sequence ends
                if (foundOpponentSequence) {
                    // Flip all collected pieces
                    for (const [flipR, flipC] of potentialFlips) {
                        currentGrid[flipR * GRID_DIMENSION + flipC] = activePlayer;
                    }
                }
                break;
            }
            distance++;
        }
    }
    return currentGrid; // Return the modified grid
}

// Main game progression logic
function runGameSimulation(initialGrid) {
    let boardState = initialGrid;
    let turnSkipCounter = 0;

    while (true) {
        // Player O's (PLAYER_O) turn
        const playerOMove = determineOptimalPlacement(PLAYER_O, PLAYER_X, boardState);
        if (playerOMove === null) {
            turnSkipCounter++;
        } else {
            turnSkipCounter = 0;
            executeMoveAndFlip(playerOMove[0], playerOMove[1], PLAYER_O, PLAYER_X, boardState);
        }

        if (turnSkipCounter >= 2) break; // Game ends if both players skip consecutively

        // Player X's (PLAYER_X) turn
        const playerXMove = determineOptimalPlacement(PLAYER_X, PLAYER_O, boardState);
        if (playerXMove === null) {
            turnSkipCounter++;
        } else {
            turnSkipCounter = 0;
            executeMoveAndFlip(playerXMove[0], playerXMove[1], PLAYER_X, PLAYER_O, boardState);
        }

        if (turnSkipCounter >= 2) break; // Game ends if both players skip consecutively
    }
    return boardState;
}

// Input processing
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const initialBoardLines = rawInputData.trim().split("\n");

let gameBoard = Array(GRID_DIMENSION * GRID_DIMENSION).fill(CELL_MARGIN);

initialBoardLines.forEach((line, rowIndex) => {
    const charactersInRow = line.split('');
    charactersInRow.forEach((charValue, colIndex) => {
        const boardRowIndex = rowIndex + 1; // 1-indexed for the actual game board area
        const boardColIndex = colIndex + 1; // 1-indexed for the actual game board area
        let cellNumericValue;
        if (charValue === '.') cellNumericValue = CELL_EMPTY;
        else if (charValue === 'x') cellNumericValue = PLAYER_X;
        else if (charValue === 'o') cellNumericValue = PLAYER_O;
        else cellNumericValue = CELL_MARGIN; // Should not occur with valid input

        gameBoard[boardRowIndex * GRID_DIMENSION + boardColIndex] = cellNumericValue;
    });
});

// Run the game
const finalGameBoard = runGameSimulation(gameBoard);

// Output formatting
let resultRows = [];
for (let r = 1; r <= BOARD_DIMENSION; r++) {
    let rowCharacterList = [];
    for (let c = 1; c <= BOARD_DIMENSION; c++) {
        const cellContent = finalGameBoard[r * GRID_DIMENSION + c];
        let charRepresentation;
        if (cellContent === CELL_EMPTY) charRepresentation = '.';
        else if (cellContent === PLAYER_X) charRepresentation = 'x';
        else if (cellContent === PLAYER_O) charRepresentation = 'o';
        else charRepresentation = 'F'; // Should not happen for final 8x8 output
        rowCharacterList.push(charRepresentation);
    }
    resultRows.push(rowCharacterList.join(''));
}
console.log(resultRows.join('\n'));