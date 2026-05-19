const SOLVE_LIMIT = 10;
const IMPOSSIBLE_PATH_COST = 65535;

function solveSlidingPuzzle(initialBoardConfiguration) {
    const goalArrangement = [0, 1, 2, 3, 4, 5, 6, 7];
    const moveDirections = [-1, 1, -4, 4];

    // Helper to create a unique string key for a board state
    const generateBoardKey = (boardState) => boardState.slice(0, 7).join(',');

    // Helper to check if a board state matches the goal arrangement
    const checkGoalCondition = (boardState) => boardState.every((tileValue, index) => tileValue === goalArrangement[index]);

    // Helper to generate all valid next board states from the current one
    const produceNextStates = (currentBoardState) => {
        let emptyTileIndex = currentBoardState.indexOf(0);
        const subsequentBoards = [];

        for (const delta of moveDirections) {
            let potentialEmptyTileIndex = emptyTileIndex + delta;

            // Boundary checks for the 1x8 (or 2x4) grid
            if (potentialEmptyTileIndex < 0 || potentialEmptyTileIndex >= 8) {
                continue;
            }

            // Specific movement restrictions for the 2x4 conceptual grid
            // Cannot move right from index 3 to 4
            if (emptyTileIndex === 3 && delta === 1) {
                continue;
            }
            // Cannot move left from index 4 to 3
            if (emptyTileIndex === 4 && delta === -1) {
                continue;
            }

            // Create a new board state by swapping the empty tile
            const nextBoardState = [...currentBoardState];
            [nextBoardState[emptyTileIndex], nextBoardState[potentialEmptyTileIndex]] = [nextBoardState[potentialEmptyTileIndex], nextBoardState[emptyTileIndex]];
            subsequentBoards.push(nextBoardState);
        }
        return subsequentBoards;
    };

    // Breadth-First Search (BFS) implementation
    const explorationQueue = [[initialBoardConfiguration, 0]]; // [boardState, currentPathLength]
    const visitedStates = new Map(); // Maps boardKey -> minimumPathLengthToReachThisState
    visitedStates.set(generateBoardKey(initialBoardConfiguration), 0);

    let queuePointer = 0; // Manual pointer for efficient queue operations

    while (queuePointer < explorationQueue.length) {
        const [currentBoard, currentPathLength] = explorationQueue[queuePointer++];

        // Prune paths that exceed the maximum allowed depth
        if (currentPathLength > SOLVE_LIMIT) {
            continue;
        }

        // If the current board is the goal, we've found the shortest path
        if (checkGoalCondition(currentBoard)) {
            return currentPathLength;
        }

        const nextPossibleStates = produceNextStates(currentBoard);

        for (const nextBoard of nextPossibleStates) {
            const nextBoardKey = generateBoardKey(nextBoard);
            const pathLengthToNext = currentPathLength + 1;

            // If this state hasn't been visited, or we found a shorter path to it
            if (!visitedStates.has(nextBoardKey) || visitedStates.get(nextBoardKey) > pathLengthToNext) {
                visitedStates.set(nextBoardKey, pathLengthToNext);
                explorationQueue.push([nextBoard, pathLengthToNext]);
            }
        }
    }

    // If the queue is exhausted and the goal was not reached
    return IMPOSSIBLE_PATH_COST;
}

// Simulate input reading and output printing as in the original C++ main function.
// For a complete JavaScript file, we'll define a main execution block.
// The problem statement indicates "Original uses stdin: False" but the C++ code uses `cin`.
// We'll assume the input is provided as an array to a function.
// Example input: `[1, 2, 3, 0, 4, 5, 6, 7]` (a permutation of 0-7)
// This input would require 3 moves to reach `[0, 1, 2, 3, 4, 5, 6, 7]`.

// To match the C++ `main` function's behavior, we'll read 8 integers.
// In a real Node.js environment, this would involve `process.argv` or `readline`.
// For this problem, we'll assume `initialInputData` is provided.
// Let's use a hardcoded example for demonstration as per problem constraints.

// Example 1: Solvable in 3 moves
// const initialInputData = [1, 2, 3, 0, 4, 5, 6, 7]; // Expected output: 3

// Example 2: Already solved
// const initialInputData = [0, 1, 2, 3, 4, 5, 6, 7]; // Expected output: 0

// Example 3: A more complex case (might exceed 10 moves or be impossible)
// const initialInputData = [7, 6, 5, 4, 3, 2, 1, 0]; // Expected output: 10 (if solvable within limit) or 65535

// Using a simple input for demonstration.
// The problem statement implies the input is provided to the script.
// For a complete file, we'll use a placeholder for input.
// If running in Node.js, you might parse `process.argv`.
// For this context, we'll define a function that takes the input array.

// The problem asks for a complete JavaScript file, so the execution part should be present.
// We'll define a function `mainExecution` to encapsulate the input/output.
function mainExecution(inputArray) {
    const result = solveSlidingPuzzle(inputArray);
    console.log(result);
}

// Example usage (this part would typically be outside the function in a script,
// or called by a test runner, but for a "complete file" it's often included):
// Assuming input is provided as an array to this script.
// For a real scenario, this would be read from stdin or arguments.
// As per "Original uses stdin: False", we'll use a hardcoded example.
const sampleInput = [1, 2, 3, 0, 4, 5, 6, 7];
mainExecution(sampleInput);
