var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var lineBuffer = rawData.trim().split("\n");

function parseGridDimensions(dimensionString) {
    const parts = dimensionString.split(" ").map(Number);
    return { width: parts[0], height: parts[1] };
}

function parseRobotCommand(commandLine) {
    const parts = commandLine.split(" ");
    const commandType = parts[0];
    let commandValue = undefined;
    if (parts.length === 2) {
        commandValue = Number(parts[1]);
    }
    return { type: commandType, value: commandValue };
}

function enforceGridBoundaries(robotPositionArray, maxWidth, maxHeight) {
    // robotPositionArray[1] is x, robotPositionArray[2] is y
    if (robotPositionArray[1] < 1) robotPositionArray[1] = 1;
    if (robotPositionArray[2] < 1) robotPositionArray[2] = 1;
    if (robotPositionArray[1] > maxWidth) robotPositionArray[1] = maxWidth;
    if (robotPositionArray[2] > maxHeight) robotPositionArray[2] = maxHeight;
}

const DIRECTION_INDEX_0 = 0;
const DIRECTION_INDEX_1 = 1;
const DIRECTION_INDEX_2 = 2;
const DIRECTION_INDEX_3 = 3;

while (true) {
    const dimensionsLine = lineBuffer.shift();
    if (dimensionsLine === "0 0") {
        break;
    }

    const gridSpecs = parseGridDimensions(dimensionsLine);
    const gridWidth = gridSpecs.width;
    const gridHeight = gridSpecs.height;

    // robotCoordsAndDir: [direction, x_coordinate, y_coordinate]
    // Initial state: direction 0, x=1, y=1
    const robotCoordsAndDir = [DIRECTION_INDEX_0, 1, 1];

    while (true) {
        const currentCommandLine = lineBuffer.shift();
        const command = parseRobotCommand(currentCommandLine);

        if (command.type === "STOP") {
            break;
        }

        const currentDirection = robotCoordsAndDir[0];
        let currentX = robotCoordsAndDir[1];
        let currentY = robotCoordsAndDir[2];

        switch (command.type) {
            case "RIGHT":
                robotCoordsAndDir[0]++;
                if (robotCoordsAndDir[0] === 4) {
                    robotCoordsAndDir[0] = 0;
                }
                break;
            case "LEFT":
                robotCoordsAndDir[0]--;
                if (robotCoordsAndDir[0] === -1) {
                    robotCoordsAndDir[0] = 3;
                }
                break;
            case "FORWARD":
                const forwardSteps = command.value;
                for (let i = 0; i < forwardSteps; i++) {
                    if (currentDirection === DIRECTION_INDEX_0) {
                        currentY++;
                    } else if (currentDirection === DIRECTION_INDEX_1) {
                        currentX++;
                    } else if (currentDirection === DIRECTION_INDEX_2) {
                        currentY--;
                    } else if (currentDirection === DIRECTION_INDEX_3) {
                        currentY--;
                    }
                }
                robotCoordsAndDir[1] = currentX;
                robotCoordsAndDir[2] = currentY;
                break;
            case "BACKWARD":
                const backwardSteps = command.value;
                for (let i = 0; i < backwardSteps; i++) {
                    if (currentDirection === DIRECTION_INDEX_0) {
                        currentY--;
                    } else if (currentDirection === DIRECTION_INDEX_1) {
                        currentX--;
                    } else if (currentDirection === DIRECTION_INDEX_2) {
                        currentY++;
                    } else if (currentDirection === DIRECTION_INDEX_3) {
                        currentX++;
                    }
                }
                robotCoordsAndDir[1] = currentX;
                robotCoordsAndDir[2] = currentY;
                break;
        }
        
        enforceGridBoundaries(robotCoordsAndDir, gridWidth, gridHeight);
    }

    robotCoordsAndDir.shift();
    console.log(robotCoordsAndDir.join(" "));
}
