const deepCloneGrid = (originalMatrix) => {
    // Creates a new array for each row and copies elements to ensure a deep clone.
    return originalMatrix.map(row => Array.from(row));
};

const generateUniqueStateKey = (colPosition, rowPosition, gridSnapshot) => {
    // Generates a unique string identifier for a given game state.
    // This key combines the agent's position and the full configuration of the grid.
    // JSON.stringify is used for robust serialization of the grid's current state.
    return `${colPosition},${rowPosition},${JSON.stringify(gridSnapshot)}`;
};

const navigateToCollectibles = (startingColumn, startingRow, initialGameBoard, ultimatePowerTarget) => {
    // Defines possible movement directions (North, West, East, South) for the agent.
    const cardinalDirections = [
        { dCol: 0, dRow: -1 }, // Move Up
        { dCol: -1, dRow: 0 }, // Move Left
        { dCol: 1, dRow: 0 },  // Move Right
        { dCol: 0, dRow: 1 }   // Move Down
    ];

    // Create an initial mutable copy of the game board for the search.
    // Mark the starting cell as visited ('.') immediately to prevent re-evaluation.
    const currentSearchGrid = deepCloneGrid(initialGameBoard);
    currentSearchGrid[startingRow][startingColumn] = '.';

    // Initialize the Breadth-First Search (BFS) queue.
    // Each element in the queue represents a state:
    // [current_column, current_row, accumulated_steps, power_level_to_collect_next, current_grid_configuration]
    const explorationFrontier = [];
    explorationFrontier.push([startingColumn, startingRow, 0, 1, currentSearchGrid]);

    // Use a Set to store unique keys of visited states to prevent cycles and redundant computations.
    // A state is unique based on agent's position and the grid's power-up collection status.
    const exploredStates = new Set();
    exploredStates.add(generateUniqueStateKey(startingColumn, startingRow, currentSearchGrid));

    let shortestPathSteps = -1; // Initialize result to -1 (path not found).

    // Safety mechanism to prevent infinite loops in extremely complex or erroneous cases.
    const maximumQueueOperations = 1_000_000;
    let operationCounter = 0;

    // Main BFS loop: Continues as long as there are states to explore and operation limit is not reached.
    while (explorationFrontier.length > 0 && operationCounter < maximumQueueOperations) {
        operationCounter++; // Increment operation counter.

        // Retrieve the oldest state from the front of the queue.
        const pathDetails = explorationFrontier.shift();
        const [currentX, currentY, currentTravelSteps, nextPowerToAcquire, currentGridSnapshot] = pathDetails;

        // Check if the goal state has been reached: all power-ups collected.
        // The condition `nextPowerToAcquire === ultimatePowerTarget + 1` means
        // that the power-up with the value `ultimatePowerTarget` has just been collected,
        // and the next one to acquire would be `ultimatePowerTarget + 1`, signaling completion.
        if (nextPowerToAcquire === ultimatePowerTarget + 1) {
            shortestPathSteps = currentTravelSteps;
            break; // Goal achieved, terminate search.
        }

        // Explore all possible adjacent movements from the current position.
        for (const direction of cardinalDirections) {
            const nextXCoord = currentX + direction.dCol;
            const nextYCoord = currentY + direction.dRow;
            let updatedPowerLevel = nextPowerToAcquire; // Default power level for the next state.

            // Get the current grid dimensions to perform boundary checks.
            const gridRows = currentGridSnapshot.length;
            const gridCols = currentGridSnapshot[0].length;

            // Boundary check: Ensure the next position is within the grid limits.
            if (nextXCoord < 0 || nextYCoord < 0 || nextXCoord >= gridCols || nextYCoord >= gridRows) {
                continue; // Skip if out of bounds.
            }

            // Obstacle check: 'X' denotes an impassable wall.
            if (currentGridSnapshot[nextYCoord][nextXCoord] === 'X') {
                continue; // Skip if it's a wall.
            }

            // Create a new grid state for the potential next step.
            // This is crucial for BFS as each state must be independent.
            const newGridConfiguration = deepCloneGrid(currentGridSnapshot);

            // Check if the next cell contains a power-up that matches the currently required level.
            const cellValue = newGridConfiguration[nextYCoord][nextXCoord];
            if (cellValue === String(updatedPowerLevel)) {
                updatedPowerLevel++; // Increment the power level as it has been collected.
                newGridConfiguration[nextYCoord][nextXCoord] = '.'; // Mark the collected power-up as visited/empty.
            }

            // Generate a unique key for this potential new state.
            const prospectiveStateKey = generateUniqueStateKey(nextXCoord, nextYCoord, newGridConfiguration);

            // If this state has not been explored before, add it to the queue.
            if (!exploredStates.has(prospectiveStateKey)) {
                exploredStates.add(prospectiveStateKey);
                explorationFrontier.push([nextXCoord, nextYCoord, currentTravelSteps + 1, updatedPowerLevel, newGridConfiguration]);
            }
        }
    }

    // If the loop terminated because of MAX_QUEUE_OPERATIONS, it suggests a very deep or non-existent path.
    // if (operationCounter >= maximumQueueOperations && shortestPathSteps === -1) {
    //     console.warn("Pathfinding exceeded maximum operations. Path might be too long or unreachable.");
    // }

    return shortestPathSteps; // Return the minimum steps found, or -1 if no path.
};

const parseInputData = (fileContent) => {
    // Removes leading/trailing whitespace and splits the content into individual lines.
    const lines = fileContent.trim().split('\n');

    // The first line contains grid height, width, and the target power level.
    const dimensionsAndTarget = lines.shift().split(' ').map(Number);
    const [gridHeight, gridWidth, targetPower] = dimensionsAndTarget;

    const gameMap = [];
    let startCoordinates = null; // Stores [column, row] of the 'S' character.

    // Process each subsequent line to construct the game map.
    for (let r = 0; r < gridHeight; r++) {
        const rowChars = lines.shift().split('');
        // Check if the current row contains the starting position 'S'.
        if (rowChars.includes('S')) {
            startCoordinates = [rowChars.indexOf('S'), r];
        }
        gameMap.push(rowChars);
    }

    // Perform basic validation on the parsed input.
    if (!startCoordinates) {
        throw new Error("Error: Starting position 'S' not found in the provided map data.");
    }
    if (gameMap.length !== gridHeight || (gameMap.length > 0 && gameMap[0].length !== gridWidth)) {
        throw new Error("Error: The actual map dimensions do not match the declared height/width.");
    }

    return {
        initialMapGrid: gameMap,
        startAgentPosition: startCoordinates,
        finalPowerLevelRequired: targetPower
    };
};

// Main execution block:
try {
    // Read the entire input content from standard input (stdin).
    const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Parse the raw input string into a structured game data object.
    const gameSetup = parseInputData(rawInputString);

    // Destructure the parsed data for easier access.
    const { initialMapGrid, startAgentPosition, finalPowerLevelRequired } = gameSetup;
    const [agentStartX, agentStartY] = startAgentPosition;

    // Execute the pathfinding algorithm to find the shortest path.
    const resultSteps = navigateToCollectibles(agentStartX, agentStartY, initialMapGrid, finalPowerLevelRequired);

    // Output the final calculated number of steps.
    console.log(resultSteps);

} catch (processingError) {
    // Catch and log any errors that occur during file reading or input parsing.
    console.error("An error occurred during program execution:", processingError.message);
    // Exit with a non-zero status code to indicate that an error occurred.
    process.exit(1);
}