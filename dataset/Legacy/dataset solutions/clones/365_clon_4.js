const fileSystem = require('fs');

// Global variables to hold scenario-specific data, replacing original globals
let targetDepthForScenario;
let waterPointsForScenario;

// Generator function to yield the specific 12 displacement pairs
const generateMovementOffsets = function* () {
    const displacementVectors = [
        [-1, -2], [0, -2], [1, -2],
        [-2, -1], [2, -1],
        [-2, 0], [2, 0],
        [-2, 1], [2, 1],
        [-1, 2], [0, 2], [1, 2]
    ];
    for (const [deltaX, deltaY] of displacementVectors) {
        yield { deltaX, deltaY };
    }
};

// Iterative Breadth-First Search (BFS) function, replacing the recursive 'bomb'
function determineMaximumReachableDepth(initialXCoordinate, initialYCoordinate) {
    let currentHighestDepth = 0;
    const explorationQueue = [{ x: initialXCoordinate, y: initialYCoordinate, currentLevel: 0 }];
    const processedStates = new Set(); // Stores "x-y-level" to prevent redundant processing

    // Mark the initial state as processed
    processedStates.add(`${initialXCoordinate}-${initialYCoordinate}-0`);

    let queueHead = 0; // Manual pointer for queue for performance

    while (queueHead < explorationQueue.length) {
        const { x, y, currentLevel } = explorationQueue[queueHead++];

        currentHighestDepth = Math.max(currentHighestDepth, currentLevel);

        // Early exit optimization: If the target depth is reached, no need to explore further
        // This mirrors the original's global 'max == n' check
        if (currentHighestDepth === targetDepthForScenario) {
            return targetDepthForScenario;
        }

        // Pre-calculate the 'safe' region for the current depth level
        const waterSourceX = waterPointsForScenario[currentLevel * 2];
        const waterSourceY = waterPointsForScenario[currentLevel * 2 + 1];
        const currentSafeArea = new Set(); // Stores "x y" string keys for quick lookup
        for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
            for (let colOffset = -1; colOffset <= 1; colOffset++) {
                currentSafeArea.add(`${waterSourceX + rowOffset} ${waterSourceY + colOffset}`);
            }
        }

        // Explore all possible next positions based on the defined movement pattern
        for (const { deltaX, deltaY } of generateMovementOffsets()) {
            const nextX = x + deltaX;
            const nextY = y + deltaY;
            const nextLevel = currentLevel + 1;

            // Boundary checks: ensure coordinates are within the 10x10 grid
            if (nextX < 0 || nextY < 0 || nextX >= 10 || nextY >= 10) {
                continue;
            }

            // Check if the next position is within the 'safe' region for the current depth
            if (currentSafeArea.has(`${nextX} ${nextY}`)) {
                const nextStateIdentifier = `${nextX}-${nextY}-${nextLevel}`;
                if (!processedStates.has(nextStateIdentifier)) {
                    processedStates.add(nextStateIdentifier);
                    explorationQueue.push({ x: nextX, y: nextY, currentLevel: nextLevel });
                }
            }
        }
    }
    return currentHighestDepth;
}

// Main program execution block
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const scenarioInputLines = rawInputData.trim().split("\n");

let currentInputLineIndex = 0;

while (true) {
    const startPositionLine = scenarioInputLines[currentInputLineIndex++];
    const startPositionCoords = startPositionLine.split(" ").map(Number);

    // Termination condition for the input loop
    if (startPositionCoords[0] === 0 && startPositionCoords[1] === 0) {
        break;
    }

    targetDepthForScenario = Number(scenarioInputLines[currentInputLineIndex++]);
    waterPointsForScenario = scenarioInputLines[currentInputLineIndex++].split(" ").map(Number);

    // Execute the BFS to find the maximum reachable depth for the current scenario
    const finalAchievedDepth = determineMaximumReachableDepth(startPositionCoords[0], startPositionCoords[1]);

    // Output the result based on whether the target depth was reached
    console.log((finalAchievedDepth === targetDepthForScenario) ? "OK" : "NA");
}
