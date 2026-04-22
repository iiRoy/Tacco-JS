const fs = require('fs');

// Helper for checking if a coordinate is within the game board limits
const checkBoundary = (coordinateValue, limitSize) => coordinateValue >= 0 && coordinateValue < limitSize;

// Function to extract all cell values along a specified 3D line segment
const extractLineValuesFunctional = (pointX, pointY, pointZ, deltaX, deltaY, deltaZ, gameBoardDimension, currentGridState) => {
    const collectedValues = [];

    // Step 1: Traverse backward along the line to find the starting point within bounds
    let currentScanX = pointX;
    let currentScanY = pointY;
    let currentScanZ = pointZ;
    while (true) {
        const nextScanX = currentScanX - deltaX;
        const nextScanY = currentScanY - deltaY;
        const nextScanZ = currentScanZ - deltaZ;
        if (!checkBoundary(nextScanX, gameBoardDimension) || !checkBoundary(nextScanY, gameBoardDimension) || !checkBoundary(nextScanZ, gameBoardDimension)) {
            break; // Out of bounds, so currentScanX/Y/Z is the first point in bounds (or the point just before it if the initial point was already out)
        }
        currentScanX = nextScanX;
        currentScanY = nextScanY;
        currentScanZ = nextScanZ;
    }

    // Step 2: Traverse forward from the determined starting point and collect cell values
    while (checkBoundary(currentScanX, gameBoardDimension) && checkBoundary(currentScanY, gameBoardDimension) && checkBoundary(currentScanZ, gameBoardDimension)) {
        collectedValues.push(currentGridState[currentScanX][currentScanY][currentScanZ]);
        currentScanX += deltaX;
        currentScanY += deltaY;
        currentScanZ += deltaZ;
    }
    return collectedValues;
};

// Function to calculate the maximum consecutive occurrences of a target value in a 1D sequence
const calculateMaxConsecutiveFunctional = (dataSequence, targetItem) => {
    return dataSequence.reduce((accumulator, item) => {
        const currentStreak = (item === targetItem) ? accumulator.current + 1 : 0;
        const maxStreak = Math.max(accumulator.max, currentStreak);
        return { current: currentStreak, max: maxStreak };
    }, { current: 0, max: 0 }).max; // Initialize current and max streaks to 0
};

// Main function to evaluate game board for win conditions (equivalent to original 'bomb' function)
const evaluateGameStatus = (playerPiece, initialX, initialY, initialZ, gameBoardDimension, gameGridState) => {
    // These 24 vectors represent the specific directions checked by the original code's array construction.
    const allCardinalDirections = [
        [-1,-1,0], [0,-1,0], [1,-1,0], [-1,0,0], [1,0,0], [-1,1,0], [0,1,0], [1,1,0],
        [0,-1,-1], [0,0,-1], [0,1,-1], [0,-1,0], [0,1,0], [0,-1,1], [0,0,1], [0,1,1],
        [-1,0,-1], [-1,0,0], [-1,0,1], [0,0,-1], [0,0,1], [1,0,-1], [1,0,0], [1,0,1]
    ];

    let highestAchievedStreak = 0;

    // Iterate through each direction vector
    for (const [dirX, dirY, dirZ] of allCardinalDirections) {
        // Extract all values along the current line
        const currentPathItems = extractLineValuesFunctional(initialX, initialY, initialZ, dirX, dirY, dirZ, gameBoardDimension, gameGridState);
        // Calculate the maximum streak of the player's piece in this line
        const pathMaxStreak = calculateMaxConsecutiveFunctional(currentPathItems, playerPiece);
        // Update the overall highest streak found across all directions
        highestAchievedStreak = Math.max(highestAchievedStreak, pathMaxStreak);
    }
    return highestAchievedStreak;
};

// Function encapsulating the entire game simulation logic
function runGameSimulation(rawInputData) {
    const inputLines = rawInputData.trim().split('\n');
    let currentLinePointer = 0;

    // Helper to get the next line from input
    const retrieveNextLine = () => inputLines[currentLinePointer++];

    // Helper to parse space-separated numbers
    const parseNumericParameters = (lineContent) => lineContent.split(' ').map(Number);

    // Recursive helper to find the Z-coordinate for dropping a piece
    const findDropHeight = (xCoord, yCoord, currentHeight, boardMaximumDimension, gameBoardReference) => {
        if (currentHeight >= boardMaximumDimension || gameBoardReference[xCoord][yCoord][currentHeight] === 0) {
            return currentHeight;
        }
        return findDropHeight(xCoord, yCoord, currentHeight + 1, boardMaximumDimension, gameBoardReference);
    };

    while (true) {
        const [boardDimension, requiredStreak, totalPlays] = parseNumericParameters(retrieveNextLine());

        // Termination condition for the simulation
        if (boardDimension === 0 && requiredStreak === 0 && totalPlays === 0) {
            break;
        }

        // Initialize the 3D game board using a functional Array.from approach
        const gameArena = Array.from({ length: boardDimension }, () =>
            Array.from({ length: boardDimension }, () =>
                Array.from({ length: boardDimension }, () => 0) // Initialize all cells to 0 (empty)
            )
        );

        let activePlayer = 1; // Player 1 (Black) starts
        let isGameDrawn = true;

        // Loop through each play/move
        for (let moveCount = 0; moveCount < totalPlays; moveCount++) {
            const [dropColumn, dropRow] = parseNumericParameters(retrieveNextLine());
            const dropX = dropColumn - 1; // Adjust to 0-indexed
            const dropY = dropRow - 1;   // Adjust to 0-indexed

            // Find the lowest available Z-coordinate (height) for dropping a piece
            const dropZ = findDropHeight(dropX, dropY, 0, boardDimension, gameArena);

            // Place the current player's piece on the board
            gameArena[dropX][dropY][dropZ] = activePlayer;

            // Check if placing this piece resulted in a win
            if (evaluateGameStatus(activePlayer, dropX, dropY, dropZ, boardDimension, gameArena) >= requiredStreak) {
                console.log((activePlayer === 2) ? "White" : "Black", moveCount + 1);
                isGameDrawn = false; // A winner was found
                break; // End the current game
            }

            // Switch to the next player (1 becomes 2, 2 becomes 1)
            activePlayer = (activePlayer === 1) ? 2 : 1;
        }

        // If no winner was found after all plays, it's a draw
        if (isGameDrawn) {
            console.log("Draw");
        }
    }
}

// Read input from stdin and start the game simulation
const rawInput = fs.readFileSync('/dev/stdin', 'utf8');
runGameSimulation(rawInput);