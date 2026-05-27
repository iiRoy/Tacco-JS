let memoTable; // This will be our 7-dimensional DP table for memoization
const moveOffsets = [-1, 1, -4, 4]; // Possible movements for the empty tile (up, down, left, right in a 2x4 grid)
const MAX_COST = 999999999; // A large value representing infinity, used for minimum calculations
const BOARD_DIMENSION = 8; // The total number of tiles on the board
const MAX_RECURSION_DEPTH = 10; // The maximum allowed depth for the recursive search

// Function to set up the 7-dimensional memoization table
// Each dimension corresponds to a tile's value (0-7), and stores the minimum moves to reach that state.
function initializeMemoTable() {
    memoTable = Array(BOARD_DIMENSION).fill(0).map(() =>
        Array(BOARD_DIMENSION).fill(0).map(() =>
            Array(BOARD_DIMENSION).fill(0).map(() =>
                Array(BOARD_DIMENSION).fill(0).map(() =>
                    Array(BOARD_DIMENSION).fill(0).map(() =>
                        Array(BOARD_DIMENSION).fill(0).map(() =>
                            Array(BOARD_DIMENSION).fill(65535) // Initialize all entries with a sentinel value (65535)
                        )
                    )
                )
            )
        )
    );
}

// Function to generate all valid successor board configurations from a given layout
function generateSuccessors(currentLayout) {
    let emptyTileIndex = -1;
    // Locate the position of the empty tile (represented by 0)
    for (let tileIdx = 0; tileIdx < BOARD_DIMENSION; tileIdx++) {
        if (currentLayout[tileIdx] === 0) {
            emptyTileIndex = tileIdx;
            break;
        }
    }

    const possibleMoves = []; // Collection to store all valid next board states
    // Iterate through each potential move offset
    for (let moveIdx = 0; moveIdx < 4; moveIdx++) {
        const tempLayout = [...currentLayout]; // Create a mutable copy of the current board
        const targetIndex = emptyTileIndex + moveOffsets[moveIdx]; // Calculate the index of the tile to swap with

        // Ensure the target index is within the board's bounds
        if (targetIndex >= 0 && targetIndex < BOARD_DIMENSION) {
            // Specific rules to prevent horizontal moves across the middle of a 2x4 grid
            // (e.g., from index 3 to 4, or 4 to 3)
            if ((emptyTileIndex === 3 && moveOffsets[moveIdx] === 1) ||
                (emptyTileIndex === 4 && moveOffsets[moveIdx] === -1)) {
                continue; // Skip this invalid move
            }

            // Perform the swap between the empty tile and the target tile
            [tempLayout[emptyTileIndex], tempLayout[targetIndex]] =
                [tempLayout[targetIndex], tempLayout[emptyTileIndex]];

            // Output debugging information exactly as in the original C++ code
            process.stdout.write("---" + emptyTileIndex + " " + targetIndex + ":");
            for (let jdx = 0; jdx < tempLayout.length; jdx++) {
                process.stdout.write(tempLayout[jdx] + " ");
            }
            console.log(""); // Newline after the board state
            console.log(""); // Another newline

            possibleMoves.push(tempLayout); // Add the new valid configuration
        }
    }
    return possibleMoves;
}

// Function to determine if the current board layout is in the solved state (0, 1, 2, ..., 7)
function isSolved(currentLayout) {
    for (let tileIdx = 0; tileIdx < BOARD_DIMENSION - 1; tileIdx++) {
        if (currentLayout[tileIdx] + 1 !== currentLayout[tileIdx + 1]) {
            return false; // If any tile is not in sequence, it's not solved
        }
    }
    return true; // All tiles are in sequence, board is solved
}

// Recursive Depth-First Search function with memoization to find the minimum moves
function exploreStates(currentLayout, depthCount) {
    // Base case: If the recursion depth exceeds the predefined limit
    if (depthCount > MAX_RECURSION_DEPTH) {
        return 65535; // Return sentinel value indicating path too long or unsolvable within limit
    }

    // Base case: If the current board layout is the solved state
    if (isSolved(currentLayout)) {
        // Store the current depth as the minimum moves to reach this solved state
        memoTable[currentLayout[0]][currentLayout[1]][currentLayout[2]][currentLayout[3]][currentLayout[4]][currentLayout[5]][currentLayout[6]] = depthCount;
        return depthCount;
    }

    // Memoization check: If this state has already been computed and stored
    const memoizedValue = memoTable[currentLayout[0]][currentLayout[1]][currentLayout[2]][currentLayout[3]][currentLayout[4]][currentLayout[5]][currentLayout[6]];
    if (memoizedValue !== 65535) {
        return memoizedValue; // Return the previously computed minimum depth
    }

    // Generate all possible next states from the current layout
    const successorStates = generateSuccessors(currentLayout);

    // Output debugging information for successor states, matching C++ behavior
    for (let idx = 0; idx < successorStates.length; idx++) {
        for (let jdx = 0; jdx < successorStates[idx].length; jdx++) {
            process.stdout.write(successorStates[idx][jdx] + " ");
        }
        console.log(""); // Newline after each successor state
    }
    console.log(""); // Another newline

    let minMoves = MAX_COST; // Initialize minimum moves for this state to a very large value

    // Explore each successor state recursively
    for (let idx = 0; idx < successorStates.length; idx++) {
        // !!! CRITICAL BEHAVIOR REPLICATION !!!
        // The original C++ code contains a bug here: it calls dfs(board, f+1)
        // instead of dfs(next[i], f+1). This means it recursively calls with the
        // *same* board configuration, not the generated successor state.
        // This exact bug must be replicated for a Type II clone.
        minMoves = Math.min(minMoves, exploreStates(currentLayout, depthCount + 1));
    }

    // Store the calculated minimum moves for the current state in the memoization table
    memoTable[currentLayout[0]][currentLayout[1]][currentLayout[2]][currentLayout[3]][currentLayout[4]][currentLayout[5]][currentLayout[6]] = minMoves;
    return minMoves;
}

// Main execution block, equivalent to the C++ main function
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let inputLines = [];
rl.on('line', (line) => {
    inputLines.push(line);
});

rl.on('close', () => {
    initializeMemoTable(); // First, set up the memoization table

    // Read the initial board configuration from standard input.
    // Assumes input is a single line of 8 space-separated integers.
    const initialBoardConfig = inputLines[0].split(' ').map(Number);

    // Mark the initial state as requiring 0 moves to reach itself
    memoTable[initialBoardConfig[0]][initialBoardConfig[1]][initialBoardConfig[2]][initialBoardConfig[3]][initialBoardConfig[4]][initialBoardConfig[5]][initialBoardConfig[6]] = 0;

    let minMovesOverall = MAX_COST; // Variable to store the overall minimum moves found

    // Generate the first level of successor states directly from the initial configuration
    const firstLevelSuccessors = generateSuccessors(initialBoardConfig);

    // For each of these first-level successor states, initiate the recursive search
    for (let idx = 0; idx < firstLevelSuccessors.length; idx++) {
        // Here, the correct successor state is passed to the recursive function,
        // starting with a depth of 1 (one move from the initial state).
        minMovesOverall = Math.min(minMovesOverall, exploreStates(firstLevelSuccessors[idx], 1));
    }

    // Output the final calculated minimum number of moves
    console.log(minMovesOverall);
});
