const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawInputData.trim().split("\n");

const NORTH = 0;
const EAST = 1;
const SOUTH = 2;
const WEST = 3;

const DIR_INDEX = 0;
const X_COORD_INDEX = 1;
const Y_COORD_INDEX = 2;

function parseGridDimensions(dimensionString) {
    const parts = dimensionString.split(" ").map(Number);
    return { gridWidth: parts[0], gridHeight: parts[1] };
}

function updateRobotDirection(currentDirection, turnAction) {
    if (turnAction === "RIGHT") {
        return (currentDirection + 1) % 4;
    } else if (turnAction === "LEFT") {
        return (currentDirection - 1 + 4) % 4;
    }
    return currentDirection;
}

function calculateMovement(currentRobotState, stepsToMove, directionMultiplier) {
    let [currentDir, currentX, currentY] = currentRobotState;
    for (let i = 0; i < stepsToMove; i++) {
        if (currentDir === NORTH) {
            currentY += directionMultiplier;
        } else if (currentDir === EAST) {
            currentX += directionMultiplier;
        } else if (currentDir === SOUTH) {
            currentY -= directionMultiplier;
        } else if (currentDir === WEST) {
            currentX -= directionMultiplier;
        }
    }
    return [currentDir, currentX, currentY];
}

function applyBoundaryConstraints(robotCoordinates, maxWidth, maxHeight) {
    let [dir, xPos, yPos] = robotCoordinates;
    xPos = Math.max(1, Math.min(xPos, maxWidth));
    yPos = Math.max(1, Math.min(yPos, maxHeight));
    return [dir, xPos, yPos];
}

while (true) {
    const currentDimensionString = lineSegments.shift();
    if (currentDimensionString === "0 0") {
        break;
    }

    const { gridWidth: currentGridWidth, gridHeight: currentGridHeight } = parseGridDimensions(currentDimensionString);

    let robotCurrentState = [NORTH, 1, 1];

    while (true) {
        const commandLineInput = lineSegments.shift();
        const commandTokens = commandLineInput.split(" ");

        const commandAction = commandTokens[0];
        let commandValue = commandTokens.length === 2 ? Number(commandTokens[1]) : undefined;

        if (commandAction === "STOP") {
            break;
        }

        if (commandAction === "RIGHT" || commandAction === "LEFT") {
            robotCurrentState[DIR_INDEX] = updateRobotDirection(robotCurrentState[DIR_INDEX], commandAction);
        } else if (commandAction === "FORWARD") {
            robotCurrentState = calculateMovement(robotCurrentState, commandValue, 1);
        } else if (commandAction === "BACKWARD") {
            robotCurrentState = calculateMovement(robotCurrentState, commandValue, -1);
        }

        robotCurrentState = applyBoundaryConstraints(robotCurrentState, currentGridWidth, currentGridHeight);
    }

    robotCurrentState.shift();
    console.log(robotCurrentState.join(" "));
}
