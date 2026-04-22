const PLAYER_ONE_MARKER = 1;
const PLAYER_TWO_MARKER = 2;
const EMPTY_CELL = 0;

/**
 * Checks if a given set of 3D coordinates falls within the specified board dimensions.
 * @param {number} coordX - The X-coordinate to check.
 * @param {number} coordY - The Y-coordinate to check.
 * @param {number} coordZ - The Z-coordinate to check.
 * @param {number} boardDimX - The maximum X-dimension of the board (exclusive).
 * @param {number} boardDimY - The maximum Y-dimension of the board (exclusive).
 * @param {number} boardDimZ - The maximum Z-dimension of the board (exclusive).
 * @returns {boolean} True if coordinates are within bounds, false otherwise.
 */
function checkBounds(coordX, coordY, coordZ, boardDimX, boardDimY, boardDimZ) {
    // Ensure X, Y, and Z coordinates are non-negative and less than their respective dimensions.
    return coordX >= 0 && coordX < boardDimX &&
           coordY >= 0 && coordY < boardDimY &&
           coordZ >= 0 && coordZ < boardDimZ;
}

/**
 * Initializes a 3D game board with specified dimensions and a default fill value.
 * @param {number} xSize - The size of the board along the X-axis.
 * @param {number} ySize - The size of the board along the Y-axis.
 * @param {number} zSize - The size of the board along the Z-axis.
 * @param {number} [fillValue=EMPTY_CELL] - The value to fill each cell with (default is 0).
 * @returns {Array<Array<Array<number>>>} A newly created 3D array representing the game board.
 */
function createGameBoard(xSize, ySize, zSize, fillValue = EMPTY_CELL) {
    let board = new Array(xSize);
    for (let i = 0; i < xSize; i++) {
        board[i] = new Array(ySize);
        for (let j = 0; j < ySize; j++) {
            board[i][j] = new Array(zSize).fill(fillValue);
        }
    }
    return board;
}

// These arrays define the 16 unique 3D direction vectors used for checking winning lines.
// They are derived from the original code's sequential array concatenations,
// which effectively built these specific sets of offsets.
const xOffsetChanges = [
    -1, 0, 1, -1, 0, 0, 0, 0, -1, -1, -1, 0, 1, -1, 1, -1
];
const yOffsetChanges = [
    -1, -1, -1, 0, -1, 0, 1, -1, 0, 0, 0, 0, -1, -1, -1, -1
];
const zOffsetChanges = [
    0, 0, 0, 0, -1, -1, -1, 0, -1, 0, 1, -1, -1, -1, 1, 1
];

/**
 * Evaluates the game board to find the longest consecutive sequence of a player's pieces
 * passing through a specific point in any of the predefined 3D directions.
 * @param {number} activePlayerID - The marker (1 or 2) of the player whose pieces are being counted.
 * @param {number} lastPieceX - The X-coordinate of the last piece placed.
 * @param {number} lastPieceY - The Y-coordinate of the last piece placed.
 * @param {number} lastPieceZ - The Z-coordinate of the last piece placed.
 * @param {Array<Array<Array<number>>>} gameGridReference - The 3D game board array.
 * @param {number} dimensionX - The X-dimension size of the board.
 * @param {number} dimensionY - The Y-dimension size of the board.
 * @param {number} dimensionZ - The Z-dimension size of the board.
 * @param {number} requiredWinLength - The minimum number of consecutive pieces required for a win.
 * @returns {number} The maximum number of consecutive pieces found in any direction.
 */
function evaluateWinCondition(activePlayerID, lastPieceX, lastPieceY, lastPieceZ, gameGridReference, dimensionX, dimensionY, dimensionZ, requiredWinLength) {
    let longestStreakFound = 0; // Tracks the longest sequence found across all directions

    // Iterate through each of the 16 predefined 3D directions
    for (let directionIndex = 0; directionIndex < xOffsetChanges.length; directionIndex++) {
        const deltaX = xOffsetChanges[directionIndex]; // X-component of the current direction vector
        const deltaY = yOffsetChanges[directionIndex]; // Y-component of the current direction vector
        const deltaZ = zOffsetChanges[directionIndex]; // Z-component of the current direction vector

        // Count consecutive pieces in the 'positive' direction (from the last placed piece)
        let forwardCount = 0;
        for (let stepMultiplier = 1; stepMultiplier < requiredWinLength; stepMultiplier++) { // Optimized: no need to check beyond the required win length
            const currentCheckX = lastPieceX + stepMultiplier * deltaX;
            const currentCheckY = lastPieceY + stepMultiplier * deltaY;
            const currentCheckZ = lastPieceZ + stepMultiplier * deltaZ;

            // If the checked coordinate is out of bounds or the piece doesn't match the active player's,
            // the sequence is broken in this direction.
            if (!checkBounds(currentCheckX, currentCheckY, currentCheckZ, dimensionX, dimensionY, dimensionZ) ||
                gameGridReference[currentCheckX][currentCheckY][currentCheckZ] !== activePlayerID) {
                break;
            }
            forwardCount++; // Increment count if piece matches
        }

        // Count consecutive pieces in the 'negative' direction (opposite from the last placed piece)
        let backwardCount = 0;
        for (let stepMultiplier = 1; stepMultiplier < requiredWinLength; stepMultiplier++) { // Optimized
            const currentCheckX = lastPieceX - stepMultiplier * deltaX;
            const currentCheckY = lastPieceY - stepMultiplier * deltaY;
            const currentCheckZ = lastPieceZ - stepMultiplier * deltaZ;

            // Similar boundary and piece matching check for the backward direction.
            if (!checkBounds(currentCheckX, currentCheckY, currentCheckZ, dimensionX, dimensionY, dimensionZ) ||
                gameGridReference[currentCheckX][currentCheckY][currentCheckZ] !== activePlayerID) {
                break;
            }
            backwardCount++; // Increment count if piece matches
        }

        // Calculate the total sequence length for this line, including the newly placed piece itself.
        const currentLineStreak = 1 + forwardCount + backwardCount;
        // Update the overall longest streak found.
        longestStreakFound = Math.max(longestStreakFound, currentLineStreak);
    }
    return longestStreakFound;
}

/**
 * Processes multiple game sessions based on the provided input content.
 * Each session defines a new game board and a series of player moves.
 * @param {string} inputContent - The raw string content read from the input source.
 */
function processGameSessions(inputContent) {
    const gameInputLines = inputContent.trim().split("\n"); // Split input into individual lines
    let lineCursor = 0; // Pointer to the current line being processed in gameInputLines

    // Main loop to handle multiple game sessions
    while (true) {
        // Read the line containing board dimensions and winning length
        const dimensionsString = gameInputLines[lineCursor++];

        // Check for the termination condition ("0 0 0") for all game sessions
        if (dimensionsString === "0 0 0") {
            break; // Exit the loop if the termination string is encountered
        }

        // Parse the dimensions string into numerical values
        const parsedDimensions = dimensionsString.split(" ").map(Number);
        const boardDimensionN = parsedDimensions[0]; // N: X and Y dimensions of the board
        const requiredWinM = parsedDimensions[1];    // M: Length of consecutive pieces needed to win
        const totalMovesP = parsedDimensions[2];     // P: Z-dimension of the board AND total number of moves in this game

        // Input validation for game parameters
        if (boardDimensionN <= 0 || requiredWinM <= 0 || totalMovesP <= 0) {
            // If dimensions are invalid, skip the current game session and move to the next.
            // In a real application, an error message might be printed.
            continue;
        }

        // Initialize the 3D game board for the current session
        const gameBoard = createGameBoard(boardDimensionN, boardDimensionN, totalMovesP);

        // Read all player move coordinates for the current game session
        const playerMoveCoordinates = [];
        for (let i = 0; i < totalMovesP; i++) {
            const moveLine = gameInputLines[lineCursor++];
            // Basic validation: ensure the move line exists and is not empty
            if (!moveLine || moveLine.trim() === '') {
                // If input is malformed, skip remaining moves for this session and try the next.
                // This ensures the program doesn't crash on invalid input format.
                lineCursor = gameInputLines.length; // Advance cursor past end to prevent infinite loop
                break;
            }
            playerMoveCoordinates.push(moveLine.split(" ").map(Number));
        }

        // If the number of read moves does not match the expected `totalMovesP`,
        // it indicates an issue with the input, so this session is skipped.
        if (playerMoveCoordinates.length !== totalMovesP) {
            continue;
        }

        let currentPlayer = PLAYER_ONE_MARKER; // Player 1 starts the game
        let gameEndedInDraw = true;           // Flag to track if the game concludes without a winner

        // Process each player's move in the current game session
        for (let moveNumber = 0; moveNumber < totalMovesP; moveNumber++) {
            const currentMove = playerMoveCoordinates[moveNumber];
            const dropColumn = currentMove[0] - 1; // Convert 1-indexed column to 0-indexed
            const dropRow = currentMove[1] - 1;   // Convert 1-indexed row to 0-indexed

            // Find the lowest available Z-level (depth) in the specified column (drop)
            let dropLevelZ = 0;
            while (dropLevelZ < totalMovesP && gameBoard[dropColumn][dropRow][dropLevelZ] !== EMPTY_CELL) {
                dropLevelZ++;
            }

            // Guard clause: If the column is full, the move cannot be made.
            // This scenario implies an invalid game state given the totalMovesP,
            // or an edge case not explicitly handled by the original code.
            // For a robust clone, this should be handled.
            if (dropLevelZ >= totalMovesP) {
                // In a competitive programming context, this error might not occur with valid test cases.
                // For a Type III clone, adding such a check is a valid structural addition.
                console.log("Error: Column is full, cannot place piece. Game state inconsistent.");
                gameEndedInDraw = false; // Game ends abnormally, not a draw
                break; // Terminate current game session
            }

            // Place the current player's piece onto the game board
            gameBoard[dropColumn][dropRow][dropLevelZ] = currentPlayer;

            // Evaluate if placing this piece results in a win for the current player
            const maxConsecutivePieces = evaluateWinCondition(
                currentPlayer,
                dropColumn,
                dropRow,
                dropLevelZ,
                gameBoard,
                boardDimensionN,
                boardDimensionN,
                totalMovesP, // The Z-dimension for the board is totalMovesP
                requiredWinM
            );

            if (maxConsecutivePieces >= requiredWinM) {
                // If a player has achieved the required win length, declare the winner.
                const winnerName = (currentPlayer === PLAYER_TWO_MARKER) ? "White" : "Black";
                console.log(winnerName, moveNumber + 1); // Output winner and the move number
                gameEndedInDraw = false; // A winner was found, so it's not a draw
                break; // End the current game session
            }

            // Switch to the next player for the subsequent move
            currentPlayer = (currentPlayer === PLAYER_ONE_MARKER) ? PLAYER_TWO_MARKER : PLAYER_ONE_MARKER;
        }

        // If the game loop finishes without a winner being declared, it's a draw.
        if (gameEndedInDraw) {
            console.log("Draw");
        }
    }
}

// Read the entire input file synchronously from standard input.
const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
// Begin processing the game sessions with the retrieved input.
processGameSessions(fileInputContent);