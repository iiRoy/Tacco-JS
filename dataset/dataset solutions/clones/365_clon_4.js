function pathSolver(initialX, initialY, targetLength, pathConstraints) {
    let greatestDepthReached = 0;

    const xMovements = [-1, 0, 1, -2, 2, -2, 2, -2, 2, -1, 0, 1];
    const yMovements = [-2, -2, -2, -1, -1, 0, 0, 1, 1, 2, 2, 2];

    const explorationFrontier = [[initialX, initialY, 0]]; // [currentX, currentY, currentDepth]

    while (explorationFrontier.length > 0) {
        const [currentX, currentY, currentDepth] = explorationFrontier.pop();

        greatestDepthReached = Math.max(greatestDepthReached, currentDepth);

        // If target depth is reached, we can stop early, similar to original's global 'max' check
        if (greatestDepthReached === targetLength) {
            return true;
        }

        // If the current path segment has already reached or exceeded the target length,
        // no need to extend it further to find a path *of* targetLength.
        // The 'greatestDepthReached' is already updated.
        if (currentDepth >= targetLength) {
            continue;
        }

        // Determine "safe" positions for the current step's water coordinates.
        // These coordinates define the allowed area for moves *from* currentDepth *to* currentDepth + 1.
        const currentWaterX = pathConstraints[currentDepth * 2];
        const currentWaterY = pathConstraints[currentDepth * 2 + 1];

        // This check handles cases where currentDepth goes beyond the available constraintLocations.
        // (Assuming valid input, this should only happen if currentDepth >= targetLength).
        if (currentWaterX === undefined || currentWaterY === undefined) {
             continue;
        }

        const validPositionsForCurrentStep = new Set();
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                validPositionsForCurrentStep.add((currentWaterX + i) + " " + (currentWaterY + j));
            }
        }

        // Explore possible next moves
        for (let k = 0; k < xMovements.length; k++) {
            const nextX = currentX + xMovements[k];
            const nextY = currentY + yMovements[k];

            // Boundary check for a 10x10 grid
            if (nextX < 0 || nextY < 0 || nextX >= 10 || nextY >= 10) {
                continue;
            }

            // Check if the next position is "safe" according to the current step's constraints
            if (validPositionsForCurrentStep.has(nextX + " " + nextY)) {
                explorationFrontier.push([nextX, nextY, currentDepth + 1]);
            }
        }
    }

    // If the loop finishes and targetLength was not reached
    return false;
}

const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedLines = dataSource.trim().split("\n");
let currentLineIndex = 0;

while (true) {
    const startCoordinates = processedLines[currentLineIndex++].split(" ").map(Number);
    if (startCoordinates[0] === 0 && startCoordinates[1] === 0) {
        break;
    }

    const pathTargetLength = parseInt(processedLines[currentLineIndex++], 10);
    const constraintLocations = processedLines[currentLineIndex++].split(" ").map(Number);

    const completionStatus = pathSolver(startCoordinates[0], startCoordinates[1], pathTargetLength, constraintLocations);

    console.log(completionStatus ? "OK" : "NA");
}