let gameBoard = [];

const BOARD_DIMENSION = 8;
const FRAME_CHAR = 'f';
const EMPTY_CELL = '.';

/**
 * Determines the optimal move for the 'x' player by evaluating all possible empty cells.
 * It searches the board in a standard top-left to bottom-right order (rows 1-8, columns 1-8).
 * @returns {Array<number>} An array [row, col] representing the coordinates of the best move,
 *                          or an empty array if no valid moves are found for 'x'.
 */
function findBestPlacementForPlayerX() {
    // Initialize variables to track the highest number of captures and the corresponding move.
    let maximumCapturedStones = 0;
    let chosenLocation = [];

    // Iterate through each cell within the playable 8x8 area of the board.
    for (let currentRow = 1; currentRow <= BOARD_DIMENSION; currentRow++) {
        for (let currentCol = 1; currentCol <= BOARD_DIMENSION; currentCol++) {
            const currentCellContent = gameBoard[currentRow][currentCol];

            // A move is only valid if the target cell is currently empty.
            if (currentCellContent !== EMPTY_CELL) {
                continue; // Skip occupied cells.
            }

            // Calculate how many opponent pieces ('o') would be captured if 'x' places a stone here.
            const capturesInThisSpot = calculatePotentialCaptures(currentRow, currentCol, 'o', 'x');

            // If this move results in more captures than any previous move, update the best move.
            if (capturesInThisSpot > maximumCapturedStones) {
                chosenLocation = [currentRow, currentCol];
                maximumCapturedStones = capturesInThisSpot;
            }
        }
    }
    // Return the coordinates of the move that maximizes captures.
    return chosenLocation;
}

/**
 * Determines the optimal move for the 'o' player.
 * It searches the board in a reverse bottom-right to top-left order (rows 8-1, columns 8-1).
 * @returns {Array<number>} An array [row, col] representing the coordinates of the best move,
 *                          or an empty array if no valid moves are found for 'o'.
 */
function findBestPlacementForPlayerO() {
    // Initialize variables to track the highest number of captures and the corresponding move.
    let maximumCapturedStones = 0;
    let chosenLocation = [];

    // Iterate through each cell in the playable 8x8 area, starting from the bottom-right.
    for (let currentRow = BOARD_DIMENSION; currentRow >= 1; currentRow--) {
        for (let currentCol = BOARD_DIMENSION; currentCol >= 1; currentCol--) {
            const currentCellContent = gameBoard[currentRow][currentCol];

            // A move is only valid if the target cell is currently empty.
            if (currentCellContent !== EMPTY_CELL) {
                continue; // Skip occupied cells.
            }

            // Calculate how many opponent pieces ('x') would be captured if 'o' places a stone here.
            const capturesInThisSpot = calculatePotentialCaptures(currentRow, currentCol, 'x', 'o');

            // If this move results in more captures than any previous move, update the best move.
            if (capturesInThisSpot > maximumCapturedStones) {
                chosenLocation = [currentRow, currentCol];
                maximumCapturedStones = capturesInThisSpot;
            }
        }
    }
    // Return the coordinates of the move that maximizes captures.
    return chosenLocation;
}

/**
 * Calculates the total number of opponent pieces that would be captured
 * if a player places a stone at the specified (row, col) position.
 * @param {number} startRow The row index of the potential move.
 * @param {number} startCol The column index of the potential move.
 * @param {string} opponentPieceType The character representing the opponent's stone.
 * @param {string} playerPieceType The character representing the current player's stone.
 * @returns {number} The aggregate count of capturable pieces across all 8 directions.
 */
function calculatePotentialCaptures(startRow, startCol, opponentPieceType, playerPieceType) {
    // Define the 8 directional offsets for rows and columns.
    const rowOffsetDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colOffsetDirections = [-1, 0, 1, -1, 1, -1, 0, 1];
    let totalCaptures = 0; // Accumulator for all captured pieces.

    // Examine each of the 8 possible directions from the starting point.
    for (let directionIdx = 0; directionIdx < 8; directionIdx++) {
        const currentYDirection = rowOffsetDirections[directionIdx];
        const currentXDirection = colOffsetDirections[directionIdx];
        let piecesCapturedInLine = 0; // Count of opponent pieces in the current line of sight.
        let distanceMultiplier = 1; // Represents how far we are from the startRow, startCol.

        // Traverse outwards in the current direction.
        while (true) {
            const nextCheckRow = startRow + currentYDirection * distanceMultiplier;
            const nextCheckCol = startCol + currentXDirection * distanceMultiplier;

            // Ensure we are within the extended board boundaries (including frames).
            if (nextCheckRow < 0 || nextCheckRow > BOARD_DIMENSION + 1 ||
                nextCheckCol < 0 || nextCheckCol > BOARD_DIMENSION + 1) {
                break; // Out of bounds, stop checking this direction.
            }

            const cellValueAtCurrentPoint = gameBoard[nextCheckRow][nextCheckCol];

            // If we encounter a frame or an empty cell, this line is not a valid capture path.
            if (cellValueAtCurrentPoint === FRAME_CHAR || cellValueAtCurrentPoint === EMPTY_CELL) {
                break;
            }
            // If an opponent's piece is found, increment the count for this line.
            else if (cellValueAtCurrentPoint === opponentPieceType) {
                piecesCapturedInLine++;
            }
            // If the current player's own piece is found, and we've collected some opponent pieces,
            // then a capture is valid in this direction.
            else if (cellValueAtCurrentPoint === playerPieceType) {
                totalCaptures += piecesCapturedInLine; // Add the captured pieces from this line.
                break; // Stop traversing this direction.
            }
            // Move further in the current direction.
            distanceMultiplier++;
        }
    }
    return totalCaptures;
}

/**
 * Executes a player's move: places their stone and flips all captured opponent pieces.
 * @param {number} moveRow The row where the new stone is placed.
 * @param {number} moveCol The column where the new stone is placed.
 * @param {string} opponentPieceType The character representing the opponent's stone.
 * @param {string} playerPieceType The character representing the current player's stone.
 */
function executeMoveAndFlipStones(moveRow, moveCol, opponentPieceType, playerPieceType) {
    // Place the current player's stone at the designated location.
    gameBoard[moveRow][moveCol] = playerPieceType;

    // Define the 8 directional offsets.
    const rowDirectionOffsets = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colDirectionOffsets = [-1, 0, 1, -1, 1, -1, 0, 1];

    // Check each of the 8 directions for pieces to flip.
    for (let dirIndex = 0; dirIndex < 8; dirIndex++) {
        const currentYOffset = rowDirectionOffsets[dirIndex];
        const currentXOffset = colDirectionOffsets[dirIndex];
        let encounteredOpponent = false; // Flag to indicate if opponent pieces were found in this line.
        let currentDistance = 1; // Distance from the placed stone.

        // Traverse outwards in the current direction.
        while (true) {
            const checkRowPosition = moveRow + currentYOffset * currentDistance;
            const checkColPosition = moveCol + currentXOffset * currentDistance;

            // Ensure we are within the extended board boundaries.
            if (checkRowPosition < 0 || checkRowPosition > BOARD_DIMENSION + 1 ||
                checkColPosition < 0 || checkColPosition > BOARD_DIMENSION + 1) {
                break; // Out of bounds.
            }

            const cellValueHere = gameBoard[checkRowPosition][checkColPosition];

            // If a frame or empty cell is hit, no capture line exists in this direction.
            if (cellValueHere === FRAME_CHAR || cellValueHere === EMPTY_CELL) {
                break;
            }
            // If an opponent's piece is found, mark the flag and continue.
            else if (cellValueHere === opponentPieceType) {
                encounteredOpponent = true;
            }
            // If the current player's own piece is found, and opponent pieces were encountered,
            // then flip the intermediate pieces.
            else if (cellValueHere === playerPieceType) {
                if (encounteredOpponent) {
                    // Iterate backwards from the piece just before the current player's piece
                    // up to the newly placed stone, flipping all opponent pieces.
                    let flipStepBack = currentDistance - 1;
                    while (flipStepBack >= 1) {
                        gameBoard[moveRow + currentYOffset * flipStepBack][moveCol + currentXOffset * flipStepBack] = playerPieceType;
                        flipStepBack--;
                    }
                }
                break; // Stop checking this direction.
            }
            // Move to the next step in this direction.
            currentDistance++;
        }
    }
}

// --- Main Program Execution ---
(function() {
    // Read the entire input from stdin as a string.
    const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Split the input into an array of strings, one for each line, and remove extra whitespace.
    const boardLayoutLines = rawInputData.trim().split('\n');

    // Initialize the game board with a top frame row.
    // The frame characters ('f') simplify boundary checks within the game logic.
    gameBoard.push(Array(BOARD_DIMENSION + 2).fill(FRAME_CHAR));

    // Process each input line to construct the 8x8 playable area of the board,
    // adding frame characters to the left and right of each row.
    boardLayoutLines.forEach(function(lineString) {
        const framedRowString = FRAME_CHAR + lineString + FRAME_CHAR;
        gameBoard.push(framedRowString.split(''));
    });

    // Add a bottom frame row to complete the board's setup.
    gameBoard.push(Array(BOARD_DIMENSION + 2).fill(FRAME_CHAR));

    // A counter for consecutive passes. The game ends when this reaches 2.
    let consecutivePassCounter = 0;

    // The main game loop: continues until two players pass consecutively.
    while (true) {
        // Player 'x's turn: try to find and make a move.
        const playerXChoice = findBestPlacementForPlayerX();
        if (playerXChoice.length === 0) {
            // No valid moves for Player 'x'. Increment pass counter.
            consecutivePassCounter++;
            // console.log("Player X has no valid moves and passes."); // Debugging info
        } else {
            // Player 'x' makes a valid move. Reset pass counter.
            consecutivePassCounter = 0;
            executeMoveAndFlipStones(playerXChoice[0], playerXChoice[1], 'o', 'x');
            // console.log(`Player X places at (${playerXChoice[0]}, ${playerXChoice[1]})`); // Debugging info
        }

        // Player 'o's turn: try to find and make a move.
        const playerOChoice = findBestPlacementForPlayerO();
        if (playerOChoice.length === 0) {
            // No valid moves for Player 'o'. Increment pass counter.
            consecutivePassCounter++;
            // console.log("Player O has no valid moves and passes."); // Debugging info
        } else {
            // Player 'o' makes a valid move. Reset pass counter.
            consecutivePassCounter = 0;
            executeMoveAndFlipStones(playerOChoice[0], playerOChoice[1], 'x', 'o');
            // console.log(`Player O places at (${playerOChoice[0]}, ${playerOChoice[1]})`); // Debugging info
        }

        // Check if the game termination condition (two consecutive passes) has been met.
        if (consecutivePassCounter >= 2) {
            break; // Exit the game loop.
        }
    }

    // After the game ends, remove the top and bottom frame rows from the board
    // before preparing the final output.
    gameBoard.shift(); // Removes the first element (top frame row)
    gameBoard.pop();   // Removes the last element (bottom frame row)

    // Format the final game board into a string for printing.
    // Each row is joined into a string, then all frame characters are removed from it.
    // Finally, the rows are joined by newline characters.
    const formattedOutputBoard = gameBoard
        .map(rowArray => rowArray.join('').replace(new RegExp(FRAME_CHAR, 'g'), ''))
        .join('\n');

    console.log(formattedOutputBoard);
})();