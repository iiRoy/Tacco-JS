const BOARD_DIMENSION = 8; // Defines the size of the playing board (8x8)
const BOARD_PADDING_CHAR = 'f'; // Character used for the boundary padding around the board
const EMPTY_CELL_CHAR = '.';    // Character representing an empty cell on the board

// Read raw game input from the standard input stream
const rawGameInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input: trim whitespace and split into individual lines
const gameBoardLines = rawGameInputData.trim().split('\n');

// Initialize the game board with a surrounding frame of padding characters.
// This simplifies boundary checks during game logic.
let gameBoardState = [];

// Add the top padding row to the game board
const topBoundaryRow = Array(BOARD_DIMENSION + 2).fill(BOARD_PADDING_CHAR);
gameBoardState.push(topBoundaryRow);

// Populate the main game area rows from the input lines, adding left and right padding
gameBoardLines.forEach((line) => {
    const processedRow = [BOARD_PADDING_CHAR, ...line.split(''), BOARD_PADDING_CHAR];
    gameBoardState.push(processedRow);
});

// Add the bottom padding row to the game board
const bottomBoundaryRow = Array(BOARD_DIMENSION + 2).fill(BOARD_PADDING_CHAR);
gameBoardState.push(bottomBoundaryRow);

// Counter to track consecutive turns where no valid move was made by either player
let consecutiveSkippedTurns = 0;

/**
 * Calculates the number of opponent pieces that would be flipped if a piece
 * is placed at a given coordinate (r, c) by the currentPlayerPiece.
 * It checks all 8 cardinal and diagonal directions.
 * @param {number} rCoord - The row index for the potential move.
 * @param {number} cCoord - The column index for the potential move.
 * @param {string} currentPlayerPiece - The character representing the current player ('x' or 'o').
 * @param {string} opponentPlayerPiece - The character representing the opponent ('o' or 'x').
 * @returns {number} The total count of opponent pieces that would be flipped.
 */
function determineFlipPotential(rCoord, cCoord, currentPlayerPiece, opponentPlayerPiece) {
    // Define row and column offsets for the 8 directions (N, NE, E, SE, S, SW, W, NW)
    const rowDirectionOffsets = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colDirectionOffsets = [-1, 0, 1, -1, 1, -1, 0, 1];

    let totalFlippedPieces = 0; // Accumulator for flips across all directions

    // Iterate through each of the 8 possible directions
    for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
        const deltaRow = rowDirectionOffsets[dirIndex];
        const deltaCol = colDirectionOffsets[dirIndex];

        let currentDirectionFlips = 0; // Counts opponent pieces encountered in the current direction
        let stepDistance = 1;          // Multiplier for moving further in the current direction

        // Traverse cells in the current direction
        while (true) {
            const currentRowCheck = rCoord + deltaRow * stepDistance;
            const currentColCheck = cCoord + deltaCol * stepDistance;
            const cellValue = gameBoardState[currentRowCheck][currentColCheck];

            // If a boundary ('f') or an empty cell ('.') is encountered,
            // no valid bracket is formed in this direction.
            if (cellValue === BOARD_PADDING_CHAR || cellValue === EMPTY_CELL_CHAR) {
                break;
            }
            // If an opponent's piece is found, increment the count for this direction
            else if (cellValue === opponentPlayerPiece) {
                currentDirectionFlips++;
            }
            // If the current player's piece is found, it means a bracket has been formed.
            // Add the collected flips for this direction to the total.
            else if (cellValue === currentPlayerPiece) {
                totalFlippedPieces += currentDirectionFlips;
                break; // Stop searching in this direction
            }
            // Move to the next cell in the current direction
            stepDistance++;
        }
    }
    return totalFlippedPieces;
}

/**
 * Finds the best possible move for player 'x' by evaluating all empty cells
 * and determining which one yields the maximum number of flipped pieces.
 * @returns {Array<number>} An array [row, column] of the optimal move, or an empty array if no valid move exists.
 */
function findOptimalXMoveCoordinates() {
    let maximumFlipsAchieved = 0; // Keeps track of the highest flip count found
    let optimalMoveLocation = []; // Stores the [row, col] of the move with max flips

    // Iterate through the actual playing area (excluding the padding rows/columns)
    for (let r = 1; r <= BOARD_DIMENSION; r++) {
        for (let c = 1; c <= BOARD_DIMENSION; c++) {
            // Only consider placing a piece in an empty cell
            if (gameBoardState[r][c] !== EMPTY_CELL_CHAR) {
                continue; // Skip if the cell is already occupied
            }

            // Calculate the number of pieces that would be flipped by placing 'x' here
            const currentMoveFlipCount = determineFlipPotential(r, c, 'x', 'o');

            // If this move flips more pieces than any previous one, update the optimal move
            if (currentMoveFlipCount > maximumFlipsAchieved) {
                optimalMoveLocation = [r, c];
                maximumFlipsAchieved = currentMoveFlipCount;
            }
        }
    }
    return optimalMoveLocation; // Return the coordinates of the best move
}

/**
 * Finds the best possible move for player 'o' by evaluating all empty cells
 * in reverse order (as per original logic) and determining which one yields
 * the maximum number of flipped pieces.
 * @returns {Array<number>} An array [row, column] of the optimal move, or an empty array if no valid move exists.
 */
function findOptimalOMoveCoordinates() {
    let maximumFlipsAchieved = 0;
    let optimalMoveLocation = [];

    // Iterate through the actual playing area in reverse order (excluding padding)
    for (let r = BOARD_DIMENSION; r >= 1; r--) {
        for (let c = BOARD_DIMENSION; c >= 1; c--) {
            // Only consider placing a piece in an empty cell
            if (gameBoardState[r][c] !== EMPTY_CELL_CHAR) {
                continue; // Skip if the cell is already occupied
            }

            // Calculate the number of pieces that would be flipped by placing 'o' here
            const currentMoveFlipCount = determineFlipPotential(r, c, 'o', 'x');

            // If this move flips more pieces than any previous one, update the optimal move
            if (currentMoveFlipCount > maximumFlipsAchieved) {
                optimalMoveLocation = [r, c];
                maximumFlipsAchieved = currentMoveFlipCount;
            }
        }
    }
    return optimalMoveLocation;
}

/**
 * Executes a player's move by placing their piece at the specified coordinates
 * and flipping all opponent pieces that are bracketed by this new placement.
 * @param {number} targetRow - The row index where the piece is to be placed.
 * @param {number} targetCol - The column index where the piece is to be placed.
 * @param {string} opponentPieceSymbol - The character representing the opponent's piece ('o' or 'x').
 * @param {string} playerPieceSymbol - The character representing the current player's piece ('x' or 'o').
 */
function performMoveAndFlipPieces(targetRow, targetCol, opponentPieceSymbol, playerPieceSymbol) {
    // Place the current player's piece on the board at the target location
    gameBoardState[targetRow][targetCol] = playerPieceSymbol;

    // Define the 8 directional vectors for traversing the board
    const rowDirectionVectors = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colDirectionVectors = [-1, 0, 1, -1, 1, -1, 0, 1];

    // Iterate through each of the 8 directions to check for flips
    for (let direction = 0; direction < 8; direction++) {
        const dR = rowDirectionVectors[direction];
        const dC = colDirectionVectors[direction];

        let currentTraversalStep = 1;       // Distance from the newly placed piece
        let opponentPieceEncountered = false; // Flag to track if opponent pieces are found in this direction

        // Traverse in the current direction until a boundary, empty spot, or player's own piece is found
        while (true) {
            const checkRow = targetRow + dR * currentTraversalStep;
            const checkCol = targetCol + dC * currentTraversalStep;
            const currentCellContent = gameBoardState[checkRow][checkCol];

            // If a boundary ('f') or an empty cell ('.') is hit, no bracket is formed.
            if (currentCellContent === BOARD_PADDING_CHAR || currentCellContent === EMPTY_CELL_CHAR) {
                break; // End traversal in this direction
            }
            // If an opponent's piece is found, mark that potential flips are accumulating
            else if (currentCellContent === opponentPieceSymbol) {
                opponentPieceEncountered = true;
            }
            // If the current player's piece is found, and opponent pieces were previously encountered,
            // then a valid bracket has been formed. Flip the pieces in between.
            else if (currentCellContent === playerPieceSymbol) {
                if (opponentPieceEncountered) {
                    // Backtrack from the bracketing piece to the newly placed piece (exclusive of new piece)
                    // and flip all opponent pieces to the current player's piece.
                    let backtrackStep = currentTraversalStep - 1;
                    while (backtrackStep >= 1) { // Loop from `currentTraversalStep - 1` down to `1`
                        gameBoardState[targetRow + dR * backtrackStep][targetCol + dC * backtrackStep] = playerPieceSymbol;
                        backtrackStep--;
                    }
                }
                break; // Stop searching in this direction
            }
            // Move to the next cell in this direction
            currentTraversalStep++;
        }
    }
}

// Main game simulation loop: continues until two consecutive passes occur
while (true) {
    // === Player 'x's turn ===
    const playerXMove = findOptimalXMoveCoordinates();

    if (playerXMove.length === 0) {
        // Player 'x' has no valid moves, increment the pass counter
        consecutiveSkippedTurns++;
    } else {
        // Player 'x' makes a valid move, reset the pass counter
        consecutiveSkippedTurns = 0;
        performMoveAndFlipPieces(playerXMove[0], playerXMove[1], 'o', 'x'); // 'o' is opponent, 'x' is current player
    }

    // === Player 'o's turn ===
    const playerOMove = findOptimalOMoveCoordinates();

    if (playerOMove.length === 0) {
        // Player 'o' has no valid moves, increment the pass counter
        consecutiveSkippedTurns++;
    } else {
        // Player 'o' makes a valid move, reset the pass counter
        consecutiveSkippedTurns = 0;
        performMoveAndFlipPieces(playerOMove[0], playerOMove[1], 'x', 'o'); // 'x' is opponent, 'o' is current player
    }

    // If both players have passed consecutively (2 passes), the game ends
    if (consecutiveSkippedTurns >= 2) {
        break;
    }
}

// Prepare the final game board for output: remove padding and format into a string
let finalBoardDisplay = [];
// Iterate only through the actual playing area (from 1 to BOARD_DIMENSION)
for (let r = 1; r <= BOARD_DIMENSION; r++) {
    // Extract the relevant row segment (excluding padding columns) and join characters
    const rowString = gameBoardState[r].slice(1, BOARD_DIMENSION + 1).join('');
    finalBoardDisplay.push(rowString);
}

// Print the final state of the game board
console.log(finalBoardDisplay.join('\n'));