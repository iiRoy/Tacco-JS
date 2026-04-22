function parseEnvironment() {
    const rawInputString = require('fs').readFileSync('/dev/stdin', 'utf8');
    const processedLines = rawInputString.trim().split("\n");

    const environmentDimensions = processedLines.shift().split(" ").map(Number);
    const gridHeight = environmentDimensions[0];
    const gridWidth = environmentDimensions[1];
    const initialStageLevel = environmentDimensions[2];

    const terrainMap = [];
    let startingPoint = [];

    for (let currentLineIndex = 0; currentLineIndex < gridHeight; ++currentLineIndex) {
        const gridRow = processedLines.shift().split("");
        const startColumnIndex = gridRow.indexOf("S");
        if (startColumnIndex !== -1) {
            startingPoint = [startColumnIndex, currentLineIndex];
        }
        terrainMap.push(gridRow);
    }

    return {
        initialX: startingPoint[0],
        initialY: startingPoint[1],
        grid: terrainMap,
        height: gridHeight,
        width: gridWidth,
        requiredStage: initialStageLevel
    };
}

function calculateMinPath(initialXCoordinate, initialYCoordinate, gridStructure, gridHeight, gridWidth, targetStage) {
    const horizontalMoves = [0, -1, 1, 0];
    const verticalMoves = [-1, 0, 0, 1];

    const explorationFrontier = [[initialXCoordinate, initialYCoordinate, 0, 1]];
    let finalPathCost = 0;

    const progressRecords = new Map(); // Map<x, Map<y, max_power_level_achieved_at_x_y>>

    while (explorationFrontier.length > 0) {
        const [currentCellX, currentCellY, accumulatedCost, currentStageLevel] = explorationFrontier.shift();

        if (currentStageLevel === targetStage + 1) {
            finalPathCost = accumulatedCost;
            break;
        }

        for (let directionIndex = 0; directionIndex < 4; ++directionIndex) {
            const neighborX = currentCellX + horizontalMoves[directionIndex];
            const neighborY = currentCellY + verticalMoves[directionIndex];
            let nextStageLevel = currentStageLevel;

            if (neighborX < 0 || neighborY < 0 || neighborX >= gridWidth || neighborY >= gridHeight) {
                continue;
            }

            if (gridStructure[neighborY][neighborX] === "X") {
                continue;
            }

            if (gridStructure[neighborY][neighborX] === String(nextStageLevel)) {
                nextStageLevel++;
            }

            const existingMaxStage = progressRecords.get(neighborX)?.get(neighborY) || 0;
            if (existingMaxStage >= nextStageLevel) {
                continue;
            }

            if (!progressRecords.has(neighborX)) {
                progressRecords.set(neighborX, new Map());
            }
            progressRecords.get(neighborX).set(neighborY, nextStageLevel);
            explorationFrontier.push([neighborX, neighborY, accumulatedCost + 1, nextStageLevel]);
        }
    }

    return finalPathCost;
}

const environmentData = parseEnvironment();
const finalOutcome = calculateMinPath(
    environmentData.initialX,
    environmentData.initialY,
    environmentData.grid,
    environmentData.height,
    environmentData.width,
    environmentData.requiredStage
);

console.log(finalOutcome);