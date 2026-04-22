// This file implements a simplified Reversi/Othello game engine.
// It determines optimal moves for two players ('x' and 'o') and applies them
// until no valid moves are left for two consecutive turns.

// --- Global Game State and Configuration ---
let gameBoardGrid = []; // Represents the 2D game board, including padding.

// --- Game Parameters and Markers ---
const BOARD_DIMENSION = 8; // The actual playable area is 8x8.
const PADDING_MARKER = 'B'; // Character used for board boundaries (changed from 'f').
const EMPTY_SPACE_CHAR = '.'; // Character representing an empty cell.
const PLAYER_ONE_CHAR = 'x'; // Token for the first player.
const PLAYER_TWO_CHAR = 'o'; // Token for the second player.
const GAME_END_PASS_LIMIT = 2; // Game concludes after this many consecutive passes.

// --- Directional Vectors for Board Traversal ---
// These arrays define the 8 possible directions to check from a given cell.
const ROW_DELTA_VECTORS = [-1, -1, -1, 0, 0, 1, 1, 1];
const COL_DELTA_VECTORS = [-1, 0, 1, -1, 1, -1, 0, 1];

/**
 * Validates if a given (row, column) coordinate is within the padded board's array bounds.
 * Note: This checks array access safety, not game-logic validity (e.g., within 1-8).
 * @param {number} targetRow - The row index to check.
 * @param {number} targetCol - The column index to check.
 * @returns {boolean} - True if the coordinates are within the board array's bounds, false otherwise.
 */
function isValidBoardCoordinate(targetRow, targetCol) {
    const totalBoardSize = BOARD_DIMENSION + 2; // Includes padding rows/cols.
    return targetRow >= 0 && targetRow < totalBoardSize &&
           targetCol >= 0 && targetCol < totalBoardSize;
}

/**
 * Calculates the number of opponent pieces that would be flipped
 * if a token is placed at (r, c) by the current player.
 * @param {number} moveRow - The row index of the potential move.
 * @param {number} moveCol - The column index of the potential move.
 * @param {string} activePlayerToken - The token of the player making the move.
 * @param {string} opposingPlayerToken - The token of the opponent.
 * @returns {number} - The total count of pieces that would be flipped across all directions.
 */
function calculateMoveImpact(moveRow, moveCol, activePlayerToken, opposingPlayerToken) {
    let cumulativeFlips = 0; // Total flips from this potential move.

    // Examine each of the 8 possible directions.
    for (let directionIndex = 0; directionIndex < ROW_DELTA_VECTORS.length; directionIndex++) {
        const dR = ROW_DELTA_VECTORS[directionIndex]; // Row change for this direction.
        const dC = COL_DELTA_VECTORS[directionIndex]; // Column change for this direction.
        let flipsInCurrentDirection = 0; // Count of opponent pieces in the current direction.
        let distanceMultiplier = 1; // Step distance from the starting cell.

        // Traverse in the current direction.
        while (true) {
            const nextR = moveRow + dR * distanceMultiplier;
            const nextC = moveCol + dC * distanceMultiplier;

            // Safety check: ensure we don't access outside the array (though PADDING_MARKER should prevent this).
            if (!isValidBoardCoordinate(nextR, nextC)) {
                break;
            }

            const cellValue = gameBoardGrid[nextR][nextC];

            // If we hit a boundary or an empty cell, no flips are possible in this direction.
            if (cellValue === PADDING_MARKER || cellValue === EMPTY_SPACE_CHAR) {
                break;
            }
            // If an opponent's piece is found, increment the count for this direction.
            else if (cellValue === opposingPlayerToken) {
                flipsInCurrentDirection++;
            }
            // If the active player's own piece is found:
            else if (cellValue === activePlayerToken) {
                // If there were opponent pieces between the move and this piece, they are flipped.
                cumulativeFlips += flipsInCurrentDirection;
                break; // Stop traversing in this direction.
            }
            distanceMultiplier++; // Move to the next cell in this direction.
        }
    }
    return cumulativeFlips;
}

/**
 * Identifies the optimal move for Player One ('x') by scanning the board.
 * @returns {number[]} - An array [row, col] representing the best move, or an empty array if no valid move exists.
 */
function findPlayerOneOptimalMove() {
    let maxScoreAchieved = 0; // Stores the highest flip count found.
    let bestMoveLocation = []; // Stores the coordinates of the move yielding maxScoreAchieved.

    // Iterate through all possible board positions (1-indexed for game logic, 1 to 8).
    for (let r = 1; r <= BOARD_DIMENSION; r++) {
        for (let c = 1; c <= BOARD_DIMENSION; c++) {
            // A move is only valid on an empty cell.
            if (gameBoardGrid[r][c] !== EMPTY_SPACE_CHAR) {
                continue; // Skip occupied cells.
            }

            // Calculate the potential impact of this move for Player One.
            const currentMoveScore = calculateMoveImpact(r, c, PLAYER_ONE_CHAR, PLAYER_TWO_CHAR);

            // If this move is better than previous ones, update the optimal choice.
            if (currentMoveScore > maxScoreAchieved) {
                bestMoveLocation = [r, c];
                maxScoreAchieved = currentMoveScore;
            }
        }
    }
    return bestMoveLocation;
}

/**
 * Identifies the optimal move for Player Two ('o') by scanning the board in reverse order.
 * @returns {number[]} - An array [row, col] representing the best move, or an empty array if no valid move exists.
 */
function findPlayerTwoOptimalMove() {
    let bestPotentialScore = 0; // Maximum flips found for Player Two.
    let chosenMoveCoords = []; // Coordinates of the move with bestPotentialScore.

    // Iterate through the board in reverse order (from bottom-right to top-left).
    for (let targetRow = BOARD_DIMENSION; targetRow >= 1; targetRow--) {
        for (let targetCol = BOARD_DIMENSION; targetCol >= 1; targetCol--) {
            const cellValue = gameBoardGrid[targetRow][targetCol];

            // Moves can only be made on empty cells.
            if (cellValue === EMPTY_SPACE_CHAR) {
                // Determine the number of pieces flipped if 'o' is placed here.
                const currentMoveScore = calculateMoveImpact(targetRow, targetCol, PLAYER_TWO_CHAR, PLAYER_ONE_CHAR);

                // Update if this move leads to more flips.
                if (currentMoveScore > bestPotentialScore) {
                    chosenMoveCoords = [targetRow, targetCol];
                    bestPotentialScore = currentMoveScore;
                }
            }
        }
    }
    return chosenMoveCoords;
}

/**
 * Executes a player's move on the board, placing their token and flipping opponent pieces.
 * @param {number} placementRow - The row index where the token is to be placed.
 * @param {number} placementCol - The column index where the token is to be placed.
 * @param {string} opponentToken - The character representing the opponent's piece.
 * @param {string} playerToken - The character representing the current player's piece.
 */
function applyPlayerMove(placementRow, placementCol, opponentToken, playerToken) {
    // Place the current player's token at the chosen location.
    gameBoardGrid[placementRow][placementCol] = playerToken;

    // Traverse all 8 directions to identify and flip opponent pieces.
    for (let dirIdx = 0; dirIdx < ROW_DELTA_VECTORS.length; dirIdx++) {
        const dR = ROW_DELTA_VECTORS[dirIdx];
        const dC = COL_DELTA_VECTORS[dirIdx];
        let currentStep = 1;
        let encounteredOpponent = false; // Flag to track if opponent pieces were found.

        // Continue scanning in this direction.
        while (true) {
            const nextR = placementRow + dR * currentStep;
            const nextC = placementCol + dC * currentStep;

            // Ensure coordinates are within array bounds.
            if (!isValidBoardCoordinate(nextR, nextC)) {
                break;
            }

            const cellContent = gameBoardGrid[nextR][nextC];

            // If a boundary or empty cell is hit, no flips in this direction.
            if (cellContent === PADDING_MARKER || cellContent === EMPTY_SPACE_CHAR) {
                break;
            }
            // If an opponent's piece is found, mark it.
            else if (cellContent === opponentToken) {
                encounteredOpponent = true;
            }
            // If the player's own token is found AND opponent pieces were encountered:
            else if (cellContent === playerToken) {
                if (encounteredOpponent) {
                    // Flip all the opponent pieces found between the move and this token.
                    for (let flipDistance = 1; flipDistance < currentStep; flipDistance++) {
                        gameBoardGrid[placementRow + dR * flipDistance][placementCol + dC * flipDistance] = playerToken;
                    }
                }
                break; // Stop in this direction.
            }
            currentStep++; // Move to the next cell.
        }
    }
}

// --- Board Initialization ---
// The initial state of the game board. In a real application, this would be user input.
const initialBoardConfiguration = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

/**
 * Constructs the padded game board grid from a raw input string.
 * @param {string} rawBoardString - The string representation of the 8x8 board.
 * @returns {Array<Array<string>>} - The 10x10 padded game board.
 */
function initializePaddedBoard(rawBoardString) {
    const rawRows = rawBoardString.trim().split("\n");
    const paddedBoard = [];

    // Create the top padding row.
    paddedBoard.push(Array(BOARD_DIMENSION + 2).fill(PADDING_MARKER));

    // Process each input row, adding side padding.
    rawRows.forEach(boardLine => {
        const currentRow = [PADDING_MARKER, ...boardLine.split(''), PADDING_MARKER];
        paddedBoard.push(currentRow);
    });

    // Create the bottom padding row.
    paddedBoard.push(Array(BOARD_DIMENSION + 2).fill(PADDING_MARKER));

    return paddedBoard;
}

// Set up the global game board at the start.
gameBoardGrid = initializePaddedBoard(initialBoardConfiguration);

let consecutiveNoMoveTurns = 0; // Tracks consecutive turns where no player could make a move.

// --- Main Game Loop ---
// The game proceeds in turns until it ends due to two consecutive passes.
while (true) {
    // --- Player One's Turn (X) ---
    const playerXMove = findPlayerOneOptimalMove();

    if (playerXMove.length === 0) {
        consecutiveNoMoveTurns++; // Player X cannot make a move.
    } else {
        consecutiveNoMoveTurns = 0; // A move was made, reset pass counter.
        applyPlayerMove(playerXMove[0], playerXMove[1], PLAYER_TWO_CHAR, PLAYER_ONE_CHAR);
    }

    // Check if the game has ended after Player X's turn.
    if (consecutiveNoMoveTurns === GAME_END_PASS_LIMIT) {
        break; // Exit game loop.
    }

    // --- Player Two's Turn (O) ---
    const playerOMove = findPlayerTwoOptimalMove();

    if (playerOMove.length === 0) {
        consecutiveNoMoveTurns++; // Player O cannot make a move.
    } else {
        consecutiveNoMoveTurns = 0; // A move was made, reset pass counter.
        applyPlayerMove(playerOMove[0], playerOMove[1], PLAYER_ONE_CHAR, PLAYER_TWO_CHAR);
    }

    // Check if the game has ended after Player O's turn.
    if (consecutiveNoMoveTurns === GAME_END_PASS_LIMIT) {
        break; // Exit game loop.
    }
}

// --- Final Board Output ---

/**
 * Processes the final padded game board to produce a clean, displayable string.
 * @param {Array<Array<string>>} currentBoardState - The game board grid including padding.
 * @returns {string} - A string representation of the 8x8 game board without padding.
 */
function generateFinalBoardDisplay(currentBoardState) {
    // Extract the central 8x8 playable area by slicing off padding rows and columns.
    const playableArea = currentBoardState
        .slice(1, BOARD_DIMENSION + 1) // Remove top and bottom padding rows.
        .map(row => row.slice(1, BOARD_DIMENSION + 1)); // Remove left and right padding columns from each row.

    // Join the characters in each row, then join the rows with newline characters.
    return playableArea.map(row => row.join('')).join("\n");
}

// Print the final state of the game board to the console.
console.log(generateFinalBoardDisplay(gameBoardGrid));