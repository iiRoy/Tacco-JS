// Function to identify the maximum contiguous sequence of '1's
// starting from a specific cell (startRow, startCol) within the grid,
// checking in four distinct diagonal and orthogonal directions.
function findLongestChain(startRow, startCol) {
    // These arrays define the relative changes in row and column indices
    // for the four directions: right, diagonal-down-left, down, diagonal-down-right.
    const rowMovement = [0, 1, 1, 1];
    const colMovement = [1, -1, 0, 1];
    let currentMaxChain = 0; // Variable to store the longest chain found from this starting point.

    // Iterate through each of the four possible directions.
    for (let directionIdx = 0; directionIdx < 4; directionIdx++) {
        let chainLength = 0; // Counter for the length of the current chain in this direction.

        // Step outwards from the starting cell in the current direction.
        // The loop continues as long as we are within the assumed 'boardSize' bounds.
        for (let stepCount = 0; stepCount <= boardSize; stepCount++) {
            const targetRow = startRow + (rowMovement[directionIdx] * stepCount);
            const targetCol = startCol + (colMovement[directionIdx] * stepCount);

            // Check if the calculated coordinates are outside the boundaries of the game board.
            if (targetRow < 0 || targetCol < 0 || targetRow >= boardSize || targetCol >= boardSize) {
                break; // If out of bounds, stop checking this direction.
            }

            // If the cell at the target coordinates contains a '1'.
            if (gameBoard[targetRow][targetCol] === 1) {
                chainLength++; // Increment the chain length.
            } else {
                break; // If it's not a '1', the chain is broken, so stop.
            }
        }
        // After checking one direction, update the overall maximum chain if the current one is longer.
        currentMaxChain = Math.max(currentMaxChain, chainLength);
        // Reset chainLength for the next direction (though it's re-initialized by the inner loop).
        chainLength = 0;
    }
    return currentMaxChain; // Return the longest chain found from (startRow, startCol).
}

// Assume 'sourceInputString' is a global variable containing the entire input data.
// It will be trimmed and split into individual lines.
const lineData = sourceInputString.trim().split('\n');

// Global-like variables to store the current grid's dimensions and its contents.
// These are declared outside the loop so 'findLongestChain' can access them.
let boardSize;
let gameBoard;

// The main loop processes multiple grid configurations until a specific termination condition is met.
while (true) {
    // Retrieve the first line, which should be the size of the current square board.
    // Convert it to an integer.
    boardSize = parseInt(lineData.shift(), 10);

    // If the board size is zero, it's a signal to stop processing further inputs.
    if (boardSize === 0) {
        break;
    }

    // Initialize the 2D array (matrix) that will represent the current game board.
    gameBoard = [];
    for (let rowIdx = 0; rowIdx < boardSize; rowIdx++) {
        // For each row, take a line from the input, split it into characters,
        // and convert each character to a number to form the row.
        gameBoard[rowIdx] = lineData.shift().split('').map(charVal => parseInt(charVal, 10));
    }

    let overallHighestStreak = 0; // This variable will hold the maximum streak found across the entire board.

    // Iterate through every single cell (row by row, column by column) on the game board.
    for (let rowIdx = 0; rowIdx < boardSize; rowIdx++) {
        for (let colIdx = 0; colIdx < boardSize; colIdx++) {
            // If the current cell contains a '1', it's a potential starting point for a streak.
            if (gameBoard[rowIdx][colIdx] === 1) {
                // Calculate the longest streak originating from this cell and update the overall highest.
                overallHighestStreak = Math.max(overallHighestStreak, findLongestChain(rowIdx, colIdx));
            }
        }
    }
    // After processing the entire board, output the final maximum streak found.
    console.log(overallHighestStreak);
}