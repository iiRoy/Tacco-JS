function findShortestPath(initialX, initialY, targetSequence, gridWidth, gridHeight, gridMapData) {
    const deltaX = [0, -1, 1, 0];
    const deltaY = [-1, 0, 0, 1];

    // Helper function to initialize the memoization table
    const createMemoTable = (rows, cols, initialValue) => {
        const table = [];
        for (let r = 0; r < rows; r++) {
            table[r] = [];
            for (let c = 0; c < cols; c++) {
                table[r][c] = initialValue;
            }
        }
        return table;
    };

    // The original code initializes memo up to index 1000 (i.e., 1001 elements).
    // This implies a fixed maximum grid size for memoization, regardless of actual grid dimensions.
    const MEMO_MAX_DIMENSION = 1001;
    let visitedMinRemainingLength = createMemoTable(MEMO_MAX_DIMENSION, MEMO_MAX_DIMENSION, targetSequence.length);

    let currentPathLength = 0;
    // Using objects for queue elements for better readability and explicit property names
    const pathfindingQueue = [{ x: initialX, y: initialY, length: currentPathLength, sequence: targetSequence }];

    // Initialize the starting point in the memoization table
    // Note: `initialY` typically corresponds to row index, `initialX` to column index.
    visitedMinRemainingLength[initialY][initialX] = targetSequence.length;

    let shortestOverallPath = Infinity; // This variable will store the final result

    // Main BFS loop
    while (pathfindingQueue.length > 0) {
        const currentNode = pathfindingQueue.shift();
        const currentX = currentNode.x;
        const currentY = currentNode.y;
        const currentLen = currentNode.length;
        const currentSequence = currentNode.sequence;

        // If the target sequence is fully matched, we've found a path.
        // Since this is BFS, the first time we find it, it's the shortest.
        if (currentSequence.length === 0) {
            shortestOverallPath = currentLen;
            break; // Exit the loop as the shortest path has been found
        }

        // Helper function for boundary checks
        const isWithinGridBounds = (coordX, coordY, width, height) => {
            return coordX >= 0 && coordY >= 0 && coordX < width && coordY < height;
        };

        // Explore all four possible neighboring cells (up, down, left, right)
        for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
            const nextX = currentX + deltaX[directionIndex];
            const nextY = currentY + deltaY[directionIndex];
            let nextSequence = currentSequence; // Assume sequence doesn't change initially

            // Check if the next coordinates are within the actual grid boundaries
            if (!isWithinGridBounds(nextX, nextY, gridWidth, gridHeight)) {
                continue; // Skip if out of bounds
            }

            // Retrieve the character from the grid at the next position
            const gridChar = gridMapData[nextY][nextX];
            const requiredChar = currentSequence[0]; // The first character needed in the sequence

            // If the grid character matches the required character, consume it from the sequence
            if (gridChar === requiredChar) {
                nextSequence = currentSequence.slice(1);
            }

            // Memoization check: If we've already found a path to (nextX, nextY) that results in
            // an equal or shorter remaining sequence, there's no need to explore this path further.
            // A smaller `nextSequence.length` indicates a better state (more of the target matched).
            if (visitedMinRemainingLength[nextY][nextX] <= nextSequence.length) {
                continue; // Skip if an equally good or better path to this state was already found
            }

            // Update the memoization table and add the new state to the queue
            visitedMinRemainingLength[nextY][nextX] = nextSequence.length;
            pathfindingQueue.push({ x: nextX, y: nextY, length: currentLen + 1, sequence: nextSequence });
        }
    }
    return shortestOverallPath;
}

// --- Main program execution logic ---

// Read the entire input from stdin
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Trim whitespace and split the input into individual lines
const inputLines = rawInputData.trim().split("\n");

// Process multiple test cases in a loop
while (true) {
    // Extract and parse grid dimensions from the first line of the current test case
    const dimensionLine = inputLines.shift();
    const dimensionStrings = dimensionLine.split(" ");
    const currentGridDimensions = dimensionStrings.map(Number);

    const gridWidth = currentGridDimensions[0];
    const gridHeight = currentGridDimensions[1];

    // Check for the termination condition (0 0)
    if (gridWidth === 0 && gridHeight === 0) {
        break;
    }

    // Initialize structures to store the grid map and the starting coordinates
    const currentGridMap = [];
    let startCoordinates = []; // [x, y]

    // Loop through each row to build the grid map and find the 'S' (start) position
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        const rowString = inputLines.shift();
        const rowChars = rowString.split(""); // Convert row string to an array of characters
        
        const startCharColumnIndex = rowChars.indexOf("S");
        if (startCharColumnIndex !== -1) {
            startCoordinates = [startCharColumnIndex, rowIndex]; // Store [column, row]
        }
        currentGridMap.push(rowChars);
    }

    // Define the target sequences and their corresponding IDs
    // Using an array of objects for better organization and readability
    const targetSequencesWithIds = [
        { sequence: "2345G", identifier: 1 },
        { sequence: "3451G", identifier: 2 },
        { sequence: "4512G", identifier: 3 },
        { sequence: "5123G", identifier: 4 },
        { sequence: "1234G", identifier: 5 }
    ];

    // Array to store the results of each pathfinding attempt
    const pathResults = [];

    // Iterate through each target sequence and call the pathfinding function
    for (const targetInfo of targetSequencesWithIds) {
        const pathLength = findShortestPath(
            startCoordinates[0],
            startCoordinates[1],
            targetInfo.sequence,
            gridWidth,
            gridHeight,
            currentGridMap
        );
        pathResults.push([pathLength, targetInfo.identifier]);
    }

    // Sort the results based on the path length (the first element of each inner array)
    pathResults.sort((resultA, resultB) => resultA[0] - resultB[0]);

    // Determine the best result and format the output string
    const bestResult = pathResults[0];
    const bestPathLength = bestResult[0];
    const bestPathIdentifier = bestResult[1];

    // Preserve the exact output format: "NA" if no path, otherwise "ID LENGTH"
    const outputString = (bestPathLength === Infinity) ? "NA" : `${bestPathIdentifier} ${bestPathLength}`;
    console.log(outputString);
}
