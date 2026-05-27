function checkLine(playerID, coordX, coordY, coordZ) {
    // Define 3D direction vectors for checking consecutive pieces.
    // These vectors represent the 26 possible directions in a 3D grid, excluding (0,0,0).
    // The original code constructs 24 specific directions through concatenation.
    let deltaX = [-1, 0, 1, -1, 1, -1, 0, 1];
    let deltaY = [-1, -1, -1, 0, 0, 1, 1, 1];
    let deltaZ = [0, 0, 0, 0, 0, 0, 0, 0];

    // Extend direction vectors for the Z-axis (up/down and diagonals)
    deltaY = deltaY.concat([-1, 0, 1, -1, 1, -1, 0, 1]);
    deltaZ = deltaZ.concat([-1, -1, -1, 0, 0, 1, 1, 1]);
    deltaX = deltaX.concat([0, 0, 0, 0, 0, 0, 0, 0]);

    // Further extend for the remaining Z-axis directions
    deltaZ = deltaZ.concat([-1, 0, 1, -1, 1, -1, 0, 1]);
    deltaX = deltaX.concat([-1, -1, -1, 0, 0, 1, 1, 1]);
    deltaY = deltaY.concat([0, 0, 0, 0, 0, 0, 0, 0]);

    let maxConsecutive = 0; // Stores the maximum consecutive pieces found in any direction

    // Iterate through all defined 3D directions
    for (let idx = 0; idx < deltaX.length; idx++) {
        let currentX = coordX;
        let currentY = coordY;
        let currentZ = coordZ;

        // Traverse backwards from the placed piece to find the start of the potential line
        while (true) {
            currentX -= deltaX[idx];
            currentY -= deltaY[idx];
            currentZ -= deltaZ[idx];

            // Break if the coordinates go out of the game board boundaries
            if (currentX < 0 || currentY < 0 || currentZ < 0) break;
            if (currentX >= boardSize || currentY >= boardSize || currentZ >= boardSize) break;
        }

        let currentCount = 0; // Counter for consecutive pieces in the current direction

        // Traverse forwards from the found start (or just past the boundary)
        while (true) {
            currentX += deltaX[idx];
            currentY += deltaY[idx];
            currentZ += deltaZ[idx];

            // Break if the coordinates go out of the game board boundaries
            if (currentX < 0 || currentY < 0 || currentZ < 0) break;
            if (currentX >= boardSize || currentY >= boardSize || currentZ >= boardSize) break;

            // Check if the piece at the current position belongs to the current player
            if (gameBoard[currentX][currentY][currentZ] === playerID) {
                currentCount++; // Increment count if it's the player's piece
            } else {
                currentCount = 0; // Reset count if a different piece or empty space is encountered
            }

            // Update the maximum consecutive count found so far
            maxConsecutive = Math.max(maxConsecutive, currentCount);
        }
    }
    return maxConsecutive;
}

// Read input from standard input using Node.js 'fs' module
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = fileContent.trim().split("\n");

// Global variables for game state, accessible by the checkLine function
let boardSize;      // Represents 'n' from the original problem: N x N board dimensions
let winCondition;   // Represents 'm' from the original problem: M consecutive pieces to win
let totalMoves;     // Represents 'p' from the original problem: P total moves in the game
let gameBoard;      // Represents 'ball' from the original problem: The 3D game board

// Main game loop, processes multiple game scenarios until "0 0 0" is encountered
while (true) {
    let dimensionsStr = inputLines.shift(); // Get board dimensions and win condition string
    if (dimensionsStr === "0 0 0") {
        break; // Exit loop if the termination condition "0 0 0" is met
    }

    // Parse board dimensions and win condition from the input string
    const parsedDimensions = dimensionsStr.split(" ").map(Number);
    boardSize = parsedDimensions[0];
    winCondition = parsedDimensions[1];
    totalMoves = parsedDimensions[2];

    // Initialize the 3D game board (boardSize x boardSize x totalMoves)
    gameBoard = [];
    for (let rowIdx = 0; rowIdx < boardSize; rowIdx++) {
        gameBoard[rowIdx] = [];
        for (let colIdx = 0; colIdx < boardSize; colIdx++) {
            gameBoard[rowIdx][colIdx] = [];
            for (let depthIdx = 0; depthIdx < totalMoves; depthIdx++) {
                gameBoard[rowIdx][colIdx][depthIdx] = 0; // 0 for empty, 1 for player 1, 2 for player 2
            }
        }
    }

    let currentPlayer = 1;      // Player 1 starts (represented as "Black")
    let isDrawPossible = true;  // Flag to track if the game ends in a draw

    // Process each move for the current game scenario
    for (let moveNum = 0; moveNum < totalMoves; moveNum++) {
        const moveCoordsStr = inputLines.shift();
        const [moveXRaw, moveYRaw] = moveCoordsStr.split(" ").map(Number);
        const moveX = moveXRaw - 1; // Adjust to 0-indexed coordinates
        const moveY = moveYRaw - 1; // Adjust to 0-indexed coordinates

        let currentDepth = 0;
        // Find the lowest available slot in the specified column (stacking pieces)
        while (true) {
            if (gameBoard[moveX][moveY][currentDepth] !== 0) {
                currentDepth++; // Move up if the current slot is occupied
            } else {
                break; // Found an empty slot
            }
        }

        // Place the current player's piece at the found depth
        gameBoard[moveX][moveY][currentDepth] = currentPlayer;

        // Check for a win condition after placing the piece
        if (checkLine(currentPlayer, moveX, moveY, currentDepth) >= winCondition) {
            // Output the winner and the move number
            console.log((currentPlayer === 2) ? "White" : "Black", moveNum + 1);
            isDrawPossible = false; // Game is not a draw as a winner is found
            break; // End the current game scenario
        }

        // Switch players: 1 becomes 2, 2 becomes 1 (using the trick 2/playerID)
        currentPlayer = 2 / currentPlayer;
    }

    // If the loop finishes without a winner, it's a draw
    if (isDrawPossible) {
        console.log("Draw");
    }
}
