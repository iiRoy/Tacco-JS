const fileSystemInterface = require('node:fs');
const allInputContent = fileSystemInterface.readFileSync('/dev/stdin', 'utf8');
const instructionLines = allInputContent.trim().split('\n');

let currentLineIndex = 0;
const outputCollection = [];

const motionVectors = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // North, East, South, West
const restrictCoord = (value, limit) => Math.max(1, Math.min(value, limit));

const commandDispatch = new Map();

commandDispatch.set('RIGHT', (currentState) => ({
    ...currentState,
    heading: (currentState.heading + 1) % 4
}));

commandDispatch.set('LEFT', (currentState) => ({
    ...currentState,
    heading: (currentState.heading + 3) % 4
}));

commandDispatch.set('FORWARD', (currentState, distance, dimensions) => {
    const [deltaX, deltaY] = motionVectors[currentState.heading];
    const newX = currentState.location.alpha + deltaX * distance;
    const newY = currentState.location.beta + deltaY * distance;

    return {
        ...currentState,
        location: {
            alpha: restrictCoord(newX, dimensions.width),
            beta: restrictCoord(newY, dimensions.height)
        }
    };
});

commandDispatch.set('BACKWARD', (currentState, distance, dimensions) => {
    const [deltaX, deltaY] = motionVectors[currentState.heading];
    const newX = currentState.location.alpha - deltaX * distance;
    const newY = currentState.location.beta - deltaY * distance;

    return {
        ...currentState,
        location: {
            alpha: restrictCoord(newX, dimensions.width),
            beta: restrictCoord(newY, dimensions.height)
        }
    };
});

function processCommandBlock() {
    const dimLine = instructionLines[currentLineIndex++];
    if (dimLine === "0 0") {
        return;
    }

    const [boundaryWidthStr, boundaryHeightStr] = dimLine.split(' ');
    const boundaries = {
        width: Number(boundaryWidthStr),
        height: Number(boundaryHeightStr)
    };

    let currentRobotStatus = {
        location: { alpha: 1, beta: 1 },
        heading: 0
    };

    while (true) {
        const currentCommandLine = instructionLines[currentLineIndex++];
        const commandParts = currentCommandLine.split(' ');
        const operationKey = commandParts[0];

        if (operationKey === "STOP") {
            break;
        }

        const distanceValue = commandParts.length === 2 ? Number(commandParts[1]) : undefined;
        const executor = commandDispatch.get(operationKey);

        if (executor) {
            currentRobotStatus = executor(currentRobotStatus, distanceValue, boundaries);
        }
    }

    outputCollection.push(`${currentRobotStatus.location.alpha} ${currentRobotStatus.location.beta}`);
    processCommandBlock();
}

processCommandBlock();
outputCollection.forEach(res => console.log(res));