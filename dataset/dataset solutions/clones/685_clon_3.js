const DIR_NORTH = 0;
const DIR_EAST = 1;
const DIR_SOUTH = 2;
const DIR_WEST = 3;
const NUM_DIRECTIONS = 4;

const CMD_STOP = "STOP";
const CMD_RIGHT = "RIGHT";
const CMD_LEFT = "LEFT";
const CMD_FORWARD = "FORWARD";
const CMD_BACKWARD = "BACKWARD";

function parseGridDimensions(dimensionString) {
    const parts = dimensionString.split(" ").map(Number);
    return { width: parts[0], height: parts[1] };
}

function getAdjustedDirection(currentDirection, turnModifier) {
    const newDirection = (currentDirection + turnModifier + NUM_DIRECTIONS) % NUM_DIRECTIONS;
    return newDirection;
}

function calculateDisplacement(currentX, currentY, direction, steps, isForwardMove) {
    let deltaX = 0;
    let deltaY = 0;
    const effectiveSteps = isForwardMove ? steps : -steps;

    switch (direction) {
        case DIR_NORTH:
            deltaY = effectiveSteps;
            break;
        case DIR_EAST:
            deltaX = effectiveSteps;
            break;
        case DIR_SOUTH:
            deltaY = -effectiveSteps;
            break;
        case DIR_WEST:
            deltaX = -effectiveSteps;
            break;
    }
    return { newX: currentX + deltaX, newY: currentY + deltaY };
}

function ensureCoordinateWithinBounds(value, minBound, maxBound) {
    return Math.max(minBound, Math.min(value, maxBound));
}

var rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLineBuffer = rawInputData.trim().split("\n");

while (true) {
    var currentDimensionsString = inputLineBuffer.shift();
    if (currentDimensionsString === "0 0") {
        break;
    }

    const { width: gridWidth, height: gridHeight } = parseGridDimensions(currentDimensionsString);

    // robotPositionAndDirection: [direction, x_coordinate, y_coordinate]
    // Initial state: North (0), x=1, y=1
    let robotPositionAndDirection = [DIR_NORTH, 1, 1];

    while (true) {
        var commandTokens = inputLineBuffer.shift().split(" ");
        const commandIdentifier = commandTokens[0];

        if (commandIdentifier === CMD_STOP) {
            break;
        }

        const commandMagnitude = commandTokens.length === 2 ? Number(commandTokens[1]) : 0;

        switch (commandIdentifier) {
            case CMD_RIGHT:
                robotPositionAndDirection[0] = getAdjustedDirection(robotPositionAndDirection[0], 1);
                break;
            case CMD_LEFT:
                robotPositionAndDirection[0] = getAdjustedDirection(robotPositionAndDirection[0], -1);
                break;
            case CMD_FORWARD:
            case CMD_BACKWARD:
                const isMovingForward = (commandIdentifier === CMD_FORWARD);
                let currentRobotX = robotPositionAndDirection[1];
                let currentRobotY = robotPositionAndDirection[2];
                let currentRobotDirection = robotPositionAndDirection[0];

                const { newX: potentialNextX, newY: potentialNextY } = calculateDisplacement(
                    currentRobotX,
                    currentRobotY,
                    currentRobotDirection,
                    commandMagnitude,
                    isMovingForward
                );

                robotPositionAndDirection[1] = potentialNextX;
                robotPositionAndDirection[2] = potentialNextY;
                break;
        }

        robotPositionAndDirection[1] = ensureCoordinateWithinBounds(robotPositionAndDirection[1], 1, gridWidth);
        robotPositionAndDirection[2] = ensureCoordinateWithinBounds(robotPositionAndDirection[2], 1, gridHeight);
    }

    robotPositionAndDirection.shift();
    console.log(robotPositionAndDirection.join(" "));
}
