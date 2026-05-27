function findBestMoveForPlayerOne() {
    let maximumFlips = 0;
    const bestMoveCoordinates = [];

    for (let rowIdx = 1; rowIdx <= 8; rowIdx++) {
        for (let colIdx = 1; colIdx <= 8; colIdx++) {
            if (boardStateGrid[rowIdx][colIdx] !== ".") {
                continue;
            }
            const currentFlipCount = countPotentialFlips(rowIdx, colIdx, "x", "o");
            if (currentFlipCount > maximumFlips) {
                bestMoveCoordinates[0] = rowIdx;
                bestMoveCoordinates[1] = colIdx;
                maximumFlips = currentFlipCount;
            }
        }
    }
    return bestMoveCoordinates;
}

function findBestMoveForPlayerTwo() {
    let maximumFlips = 0;
    const bestMoveCoordinates = [];

    for (let rowIdx = 8; rowIdx >= 1; rowIdx--) {
        for (let colIdx = 8; colIdx >= 1; colIdx--) {
            const currentFlipCount = countPotentialFlips(rowIdx, colIdx, "o", "x");
            if (boardStateGrid[rowIdx][colIdx] !== ".") {
                continue;
            }
            if (currentFlipCount > maximumFlips) {
                bestMoveCoordinates[0] = rowIdx;
                bestMoveCoordinates[1] = colIdx;
                maximumFlips = currentFlipCount;
            }
        }
    }
    return bestMoveCoordinates;
}

// This helper function calculates the total number of pieces that would be flipped
// if a player places a piece at (yCoord, xCoord).
function countPotentialFlips(yCoord, xCoord, playerPiece, opponentPiece) {
    const rowDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colDirections = [-1, 0, 1, -1, 1, -1, 0, 1];
    let totalFlips = 0;

    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        const currentDeltaY = rowDirections[directionIndex];
        const currentDeltaX = colDirections[directionIndex];
        let flipsInPath = 0;
        let stepMultiplier = 1;

        while (true) {
            const cellContent = boardStateGrid[yCoord + currentDeltaY * stepMultiplier][xCoord + currentDeltaX * stepMultiplier];
            if (cellContent === "f" || cellContent === ".") {
                break;
            } else if (cellContent === opponentPiece) {
                flipsInPath++;
            } else if (cellContent === playerPiece) {
                totalFlips += flipsInPath;
                break;
            }
            stepMultiplier++;
        }
    }
    return totalFlips;
}

// This function applies a move to the game board and flips the captured pieces.
function applyMoveAndFlipPieces(yCoord, xCoord, opponentPiece, playerPiece) {
    boardStateGrid[yCoord][xCoord] = playerPiece;
    const rowDirections = [-1, -1, -1, 0, 0, 1, 1, 1];
    const colDirections = [-1, 0, 1, -1, 1, -1, 0, 1];

    for (let directionIndex = 0; directionIndex < 8; directionIndex++) {
        const currentDeltaY = rowDirections[directionIndex];
        const currentDeltaX = colDirections[directionIndex];
        let stepMultiplier = 1;
        let opponentEncountered = false;

        while (true) {
            const cellContent = boardStateGrid[yCoord + currentDeltaY * stepMultiplier][xCoord + currentDeltaX * stepMultiplier];
            if (cellContent === "f" || cellContent === ".") {
                break;
            } else if (cellContent === opponentPiece) {
                opponentEncountered = true;
            } else if (cellContent === playerPiece) {
                if (opponentEncountered) {
                    let backtrackMultiplier = stepMultiplier;
                    while (backtrackMultiplier--) {
                        boardStateGrid[yCoord + currentDeltaY * backtrackMultiplier][xCoord + currentDeltaX * backtrackMultiplier] = playerPiece;
                    }
                }
                break;
            }
            stepMultiplier++;
        }
    }
}

// The initial state of the game board as a string.
const gameBoardInputString = '........\n........\n........\n...ox...\n...xo...\n........\n........\n........';

// Process the input string to create a 2D array representation of the board.
const inputLines = gameBoardInputString.trim().split("\n");
const boardStateGrid = [];

// Add a border of 'f' characters around the board for easier boundary checking.
boardStateGrid.push("ffffffffff".split(""));
inputLines.forEach(function(lineContent) {
    const paddedLine = "f" + lineContent + "f";
    boardStateGrid.push(paddedLine.split(""));
});
boardStateGrid.push("ffffffffff".split(""));

// Counter for consecutive passes, indicating when the game should end.
let consecutivePasses = 0;

// Main game loop: players take turns making moves until the game ends.
while (true) {
    // Player 'x' (first player) attempts to make a move.
    const playerOneMove = findBestMoveForPlayerOne();
    if (playerOneMove.length === 0) {
        consecutivePasses++; // No valid move, increment pass counter.
    } else {
        consecutivePasses = 0; // Move made, reset pass counter.
        applyMoveAndFlipPieces(playerOneMove[0], playerOneMove[1], "o", "x");
    }

    // Check for game end condition (two consecutive passes).
    if (consecutivePasses === 2) {
        break;
    }

    // Player 'o' (second player) attempts to make a move.
    const playerTwoMove = findBestMoveForPlayerTwo();
    if (playerTwoMove.length === 0) {
        consecutivePasses++; // No valid move, increment pass counter.
    } else {
        consecutivePasses = 0; // Move made, reset pass counter.
        applyMoveAndFlipPieces(playerTwoMove[0], playerTwoMove[1], "x", "o");
    }

    // Check for game end condition.
    if (consecutivePasses === 2) {
        break;
    }
}

// Prepare the final board state for output.
// Remove the top and bottom border rows.
boardStateGrid.shift();
boardStateGrid.pop();

// Join the rows, then remove any commas (from split("")) and 'f' border characters,
// and print the resulting board to the console.
console.log(boardStateGrid.join("\n").replace(/,|f/g, ""));
