const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const initialConfigurations = inputData.trim().split("\n");

function findMinimumMoves(startingLayout) {
    const finalLayoutString = "01234567";
    const visitedConfigurations = new Set();
    const processingQueue = [];

    const initialBoardArray = startingLayout.split(" ").map(Number);
    const initialBoardString = initialBoardArray.join("");
    const initialEmptyTileIndex = initialBoardArray.indexOf(0);

    processingQueue.push({
        boardState: initialBoardString,
        stepsTaken: 0,
        emptySpotIndex: initialEmptyTileIndex
    });
    visitedConfigurations.add(initialBoardString);

    const gridRows = 2;
    const gridColumns = 4;

    // Define possible movements for the empty tile (row_delta, col_delta)
    const movementVectors = [
        { rowDelta: -1, colDelta: 0 }, // Move Up
        { rowDelta: 0, colDelta: -1 }, // Move Left
        { rowDelta: 0, colDelta: 1 },  // Move Right
        { rowDelta: 1, colDelta: 0 }   // Move Down
    ];

    while (processingQueue.length > 0) {
        const currentPuzzle = processingQueue.shift();
        const { boardState, stepsTaken, emptySpotIndex } = currentPuzzle;

        if (boardState === finalLayoutString) {
            return stepsTaken;
        }

        const emptyRow = Math.floor(emptySpotIndex / gridColumns);
        const emptyCol = emptySpotIndex % gridColumns;

        const currentBoardArray = boardState.split("").map(Number);

        for (const vector of movementVectors) {
            const nextEmptyRow = emptyRow + vector.rowDelta;
            const nextEmptyCol = emptyCol + vector.colDelta;

            // Check if the new position is within grid boundaries
            if (nextEmptyRow < 0 || nextEmptyRow >= gridRows ||
                nextEmptyCol < 0 || nextEmptyCol >= gridColumns) {
                continue;
            }

            const nextEmptySpotIndex = nextEmptyRow * gridColumns + nextEmptyCol;

            // Create a new array for the next board state to avoid mutation
            const nextBoardArray = [...currentBoardArray];
            
            // Perform the swap: move the tile at nextEmptySpotIndex to emptySpotIndex
            const tileToShift = nextBoardArray[nextEmptySpotIndex];
            nextBoardArray[emptySpotIndex] = tileToShift;
            nextBoardArray[nextEmptySpotIndex] = 0;

            const nextBoardState = nextBoardArray.join("");

            if (!visitedConfigurations.has(nextBoardState)) {
                visitedConfigurations.add(nextBoardState);
                processingQueue.push({
                    boardState: nextBoardState,
                    stepsTaken: stepsTaken + 1,
                    emptySpotIndex: nextEmptySpotIndex
                });
            }
        }
    }
    return -1; // Should not be reached for solvable puzzles
}

for (const lineContent of initialConfigurations) {
    const solutionMoves = findMinimumMoves(lineContent);
    console.log(solutionMoves);
}
