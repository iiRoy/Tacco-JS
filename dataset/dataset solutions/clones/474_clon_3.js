const isWithinBounds = (row, col, maxRows, maxCols) => {
    return row >= 0 && row < maxRows && col >= 0 && col < maxCols;
};

const findSequencePath = (initialRow, initialCol, targetSequence, gameGrid, gridDimensions) => {
    const ROW_OFFSETS = [0, -1, 1, 0]; // Corresponds to dy values in original: -1, 0, 0, 1 (y-axis is row, x-axis is col)
    const COL_OFFSETS = [-1, 0, 0, 1]; // Corresponds to dx values in original: 0, -1, 1, 0

    // Extract grid dimensions for clarity
    const [numCols, numRows] = gridDimensions; // Original wh[0] is width (cols), wh[1] is height (rows)

    // Initialize a 2D array to keep track of the minimum remaining length of the target sequence
    // needed to reach a specific cell. Initialized with the full length as a 'not visited' marker.
    const minRemainingLengthGrid = Array.from({ length: numRows }, () =>
        Array(numCols).fill(targetSequence.length)
    );

    // If the target sequence is empty, no steps are required.
    if (targetSequence.length === 0) {
        return 0;
    }

    // The BFS queue, storing path nodes as objects for better readability.
    // Each node contains: { r: row, c: col, steps: path length, seq: remaining target sequence }
    const pathTraversalQueue = [{ r: initialRow, c: initialCol, steps: 0, seq: targetSequence }];

    // Mark the starting cell with its initial sequence length.
    minRemainingLengthGrid[initialRow][initialCol] = targetSequence.length;

    let shortestPathCost = Infinity; // Variable to store the final minimum steps found.

    // Continue BFS as long as there are nodes to process in the queue.
    while (pathTraversalQueue.length > 0) {
        // Dequeue the current path node and destructure its properties.
        const { r: currentRow, c: currentCol, steps: currentTotalSteps, seq: currentRemainingSequence } = pathTraversalQueue.shift();

        // If the remaining sequence is empty, we have successfully matched the entire target.
        // Since it's BFS, this is the shortest path to this state.
        if (currentRemainingSequence.length === 0) {
            shortestPathCost = currentTotalSteps;
            break; // Exit the loop as the shortest path has been found.
        }

        // Explore all four neighboring cells (up, down, left, right).
        for (let i = 0; i < 4; i++) {
            const nextRow = currentRow + ROW_OFFSETS[i];
            const nextCol = currentCol + COL_OFFSETS[i];
            let sequenceAfterPotentialMatch = currentRemainingSequence;

            // Perform boundary checks for the next cell.
            if (!isWithinBounds(nextRow, nextCol, numRows, numCols)) {
                continue; // Skip if the cell is outside the grid.
            }

            // Check if the character at the next grid cell matches the first character
            // of the currently remaining target sequence.
            if (gameGrid[nextRow][nextCol] === currentRemainingSequence[0]) {
                sequenceAfterPotentialMatch = currentRemainingSequence.substring(1); // Consume the character.
            }

            // Optimization: If a path to this 'nextRow, nextCol' cell already exists that required
            // matching a sequence of equal or shorter length, then this current path is not better.
            if (minRemainingLengthGrid[nextRow][nextCol] <= sequenceAfterPotentialMatch.length) {
                continue; // Skip this path as it's not an improvement.
            }

            // Update the minimum remaining sequence length for this cell.
            minRemainingLengthGrid[nextRow][nextCol] = sequenceAfterPotentialMatch.length;

            // Enqueue the next state for further exploration.
            pathTraversalQueue.push({
                r: nextRow,
                c: nextCol,
                steps: currentTotalSteps + 1,
                seq: sequenceAfterPotentialMatch
            });
        }
    }
    return shortestPathCost; // Return the shortest path cost or Infinity if no path found.
};

// --- Main Program Logic ---

// Read all input data from standard input.
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input string into an array of lines, removing any empty lines or trailing whitespace.
const inputLines = rawInputData.trim().split("\n").filter(line => line.length > 0);

// Predefined sequences to search for, along with their unique identifiers.
const targetSequencesWithIds = [
    { pattern: "2345G", id: 1 },
    { pattern: "3451G", id: 2 },
    { pattern: "4512G", id: 3 },
    { pattern: "5123G", id: 4 },
    { pattern: "1234G", id: 5 }
];

// Helper function to parse a single test case (grid, dimensions, start position).
const parseSingleTestCase = (linesArray) => {
    // Read the first line for grid dimensions (width and height).
    const dimensionLine = linesArray.shift();
    if (!dimensionLine) return null; // No more input lines available.

    const gridDimensions = dimensionLine.split(" ").map(Number);
    const [gridWidth, gridHeight] = gridDimensions;

    // Check for the termination condition (0 0).
    if (gridWidth === 0 && gridHeight === 0) {
        return null; // Signal to stop processing.
    }

    const gameGridData = [];
    let startingCoordinates = null; // Stores [col, row] for the 'S' character.

    // Read the grid rows and identify the starting position.
    for (let r = 0; r < gridHeight; r++) {
        const currentRowChars = linesArray.shift().split("");
        gameGridData.push(currentRowChars);
        const startColIndex = currentRowChars.indexOf("S");
        if (startColIndex !== -1) {
            startingCoordinates = [startColIndex, r]; // Found 'S'.
        }
    }

    // A basic check to ensure the starting position 'S' was found.
    if (!startingCoordinates) {
        // In a real application, more robust error handling might be needed.
        // For competitive programming, this case often implies invalid input.
        console.error("Error: Starting character 'S' not found in the grid.");
        return null;
    }

    return { gridDimensions, gameGridData, startingCoordinates };
};

// Process test cases one by one until the termination condition is met.
while (inputLines.length > 0) {
    const currentTestCase = parseSingleTestCase(inputLines);

    if (currentTestCase === null) {
        // If parsing returns null, it's either the end-of-input marker (0 0)
        // or an error during parsing. We break in both cases.
        break;
    }

    const { gridDimensions, gameGridData, startingCoordinates } = currentTestCase;

    // Array to store the results (cost and identifier) for each sequence.
    const calculatedResults = [];

    // Iterate through each predefined target sequence and find its path.
    for (const seqEntry of targetSequencesWithIds) {
        const pathLength = findSequencePath(
            startingCoordinates[1], // Pass row first (y-coordinate)
            startingCoordinates[0], // Pass col second (x-coordinate)
            seqEntry.pattern,
            gameGridData,
            gridDimensions
        );
        calculatedResults.push({ pathCost: pathLength, sequenceId: seqEntry.id });
    }

    // Sort the results based on the path cost in ascending order.
    calculatedResults.sort((a, b) => a.pathCost - b.pathCost);

    // Retrieve the best result (the one with the minimum path cost).
    const optimalResult = calculatedResults[0];

    // Output the result based on whether a path was found.
    if (optimalResult.pathCost === Infinity) {
        console.log("NA"); // No path could be found for any sequence.
    } else {
        console.log(`${optimalResult.sequenceId} ${optimalResult.pathCost}`);
    }
}