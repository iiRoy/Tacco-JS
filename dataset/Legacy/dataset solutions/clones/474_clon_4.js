function findPathCost(startCol, startRow, targetSeq) {
    const movementDirections = [
        { dr: 0, dc: -1 }, // Left
        { dr: -1, dc: 0 }, // Up
        { dr: 1, dc: 0 },  // Down
        { dr: 0, dc: 1 }   // Right
    ];

    // Use a Map for memoization, key: "row,col", value: min_remaining_sequence_length
    const minRemainingSeqLengthAtCoord = new Map();

    // Queue for BFS, storing state objects
    const explorationQueue = [
        { col: startCol, row: startRow, pathLength: 0, remainingSequence: targetSeq }
    ];

    // Initialize memoization map for the start point
    minRemainingSeqLengthAtCoord.set(`${startRow},${startCol}`, targetSeq.length);

    // BFS traversal
    while (explorationQueue.length > 0) {
        // Dequeue the current state
        const currentState = explorationQueue.shift();
        const { col: currentCol, row: currentRow, pathLength: currentPathLength, remainingSequence: currentSequence } = currentState;

        // If the target sequence is fully matched, this is the shortest path due to BFS
        if (currentSequence.length === 0) {
            return currentPathLength;
        }

        // Explore neighbors
        for (const direction of movementDirections) {
            const nextCol = currentCol + direction.dc;
            const nextRow = currentRow + direction.dr;
            let nextSequence = currentSequence;

            // Boundary checks using global grid dimensions
            if (nextCol < 0 || nextRow < 0 || nextCol >= gridDimensions[0] || nextRow >= gridDimensions[1]) {
                continue;
            }

            // Check if the grid character matches the first char of the remaining sequence
            const cellChar = gridMap[nextRow][nextCol];
            if (cellChar === currentSequence[0]) {
                nextSequence = currentSequence.substring(1); // Use substring instead of slice
            }

            const newPathLength = currentPathLength + 1;

            // Check memoization for the next state
            const existingMinSeqLength = minRemainingSeqLengthAtCoord.get(`${nextRow},${nextCol}`);

            // If this path is better (or new) for this coordinate in terms of remaining sequence length,
            // update memo and enqueue. If equal or worse, skip.
            if (existingMinSeqLength === undefined || nextSequence.length < existingMinSeqLength) {
                minRemainingSeqLengthAtCoord.set(`${nextRow},${nextCol}`, nextSequence.length);
                explorationQueue.push({
                    col: nextCol,
                    row: nextRow,
                    pathLength: newPathLength,
                    remainingSequence: nextSequence
                });
            }
        }
    }

    // If the queue becomes empty and target sequence was not matched
    return Infinity;
}

// Global variables for grid dimensions and map, as used by the original BFS
let gridDimensions;
let gridMap;

// Read input
const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

let lineIndex = 0; // To manage reading lines from inputLines

// Main processing loop using a do-while structure
do {
    gridDimensions = inputLines[lineIndex++].split(" ").map(Number);
    const [width, height] = gridDimensions;

    if (width === 0 && height === 0) {
        break; // Exit condition for the main loop
    }

    gridMap = [];
    let initialPosition = []; // Stores [col, row]

    // Parse the grid and find the starting position
    for (let r = 0; r < height; r++) {
        const rowChars = inputLines[lineIndex++].split("");
        const startCharIndex = rowChars.indexOf("S");
        if (startCharIndex !== -1) {
            initialPosition = [startCharIndex, r];
        }
        gridMap.push(rowChars);
    }

    // Define the target sequences and their original indices
    const targetSequences = [
        { seq: "2345G", originalIndex: 1 },
        { seq: "3451G", originalIndex: 2 },
        { seq: "4512G", originalIndex: 3 },
        { seq: "5123G", originalIndex: 4 },
        { seq: "1234G", originalIndex: 5 }
    ];

    // Use map to generate solution candidates by calling findPathCost for each target sequence
    const solutionCandidates = targetSequences.map(target => {
        const pathResult = findPathCost(initialPosition[0], initialPosition[1], target.seq);
        return { cost: pathResult, identifier: target.originalIndex };
    });

    // Sort the candidates by cost in ascending order
    solutionCandidates.sort((a, b) => a.cost - b.cost);

    // Output the result based on the best solution
    const bestSolution = solutionCandidates[0];
    if (bestSolution.cost === Infinity) {
        console.log("NA");
    } else {
        console.log(`${bestSolution.identifier} ${bestSolution.cost}`);
    }

} while (true); // Loop continues until an explicit break statement is encountered
