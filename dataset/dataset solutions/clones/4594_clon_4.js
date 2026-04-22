const extractInteger = (textualRepresentation) => {
    return Number.parseInt(textualRepresentation, 10);
};

const processInputData = (inputDataSegments) => {
    const [firstLineOfInput] = inputDataSegments;
    const dimensionAndHopData = firstLineOfInput.split(' ').map(extractInteger);

    const gridHeight = dimensionAndHopData[0];
    const gridWidth = dimensionAndHopData[1];
    const maxHopDistance = dimensionAndHopData[2];

    const gameLayout = inputDataSegments.slice(1).map(line => line.split(''));

    let initialPosition = [-1, -1]; // [row_coordinate, col_coordinate]
    let positionLocated = false;

    // Discover the starting point denoted by 'S'
    for (let r = 0; r < gridHeight && !positionLocated; ++r) {
        for (let c = 0; c < gridWidth && !positionLocated; ++c) {
            if (gameLayout[r][c] === 'S') {
                initialPosition = [r, c];
                positionLocated = true;
            }
        }
    }

    // Initialize a matrix to record the minimum steps from the start to each cell
    // null indicates an unvisited cell, numbers indicate step count
    const minStepMatrix = Array.from({ length: gridHeight }, () =>
        Array.from({ length: gridWidth }, () => null)
    );

    // BFS (Breadth-First Search) queue: [row, col, current_step_count]
    const explorationQueue = [];

    // Enqueue the starting point
    const [startR, startC] = initialPosition;
    minStepMatrix[startR][startC] = 0;
    explorationQueue.push([startR, startC, 0]);

    let queueHead = 0; // Pointer to simulate efficient queue operations (no shifting)
    const cardinalDirections = [[-1, 0], [1, 0], [0, -1], [0, 1]]; // North, South, West, East

    // Execute the BFS traversal
    while (queueHead < explorationQueue.length) {
        const [currentRow, currentCol, currentPathLength] = explorationQueue[queueHead++];

        // If the current cell is reached at or beyond maxHopDistance,
        // it cannot initiate further valid hops (K+1 would be > K).
        if (currentPathLength >= maxHopDistance) {
            continue;
        }

        for (const [deltaR, deltaC] of cardinalDirections) {
            const nextRow = currentRow + deltaR;
            const nextCol = currentCol + deltaC;
            const newPathLength = currentPathLength + 1;

            // Verify if the next cell is within grid boundaries
            if (nextRow < 0 || nextRow >= gridHeight || nextCol < 0 || nextCol >= gridWidth) {
                continue;
            }

            const existingPathLength = minStepMatrix[nextRow][nextCol];

            // If the cell is unvisited OR a shorter path is found
            if (existingPathLength === null || newPathLength < existingPathLength) {
                minStepMatrix[nextRow][nextCol] = newPathLength;
                explorationQueue.push([nextRow, nextCol, newPathLength]);
            }
        }
    }

    // Function to compute the closest distance to any border from a cell
    const determineExitProximity = (r, c) => {
        const distanceToTop = r;
        const distanceToBottom = gridHeight - 1 - r;
        const distanceToLeft = c;
        const distanceToRight = gridWidth - 1 - c;
        return Math.min(distanceToTop, distanceToBottom, distanceToLeft, distanceToRight);
    };

    let overallMinExitJumps = Infinity;
    let immediateBorderEncountered = false; // Flag to exit early, similar to 'break outer'

    // Traverse the calculated distances to find the minimum jumps to exit
    for (let r = 0; r < gridHeight && !immediateBorderEncountered; ++r) {
        for (let c = 0; c < gridWidth && !immediateBorderEncountered; ++c) {
            const currentCellReachability = minStepMatrix[r][c];

            // Only consider cells that were reachable from the start ('S')
            if (currentCellReachability !== null) {
                const proximityToBorder = determineExitProximity(r, c);

                if (proximityToBorder === 0) { // If cell is already on the border
                    overallMinExitJumps = 1;
                    immediateBorderEncountered = true; // Set flag to terminate loops
                } else {
                    overallMinExitJumps = Math.min(
                        overallMinExitJumps,
                        Math.ceil(proximityToBorder / maxHopDistance) + 1
                    );
                }
            }
        }
    }

    console.log(overallMinExitJumps);
};

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim()));