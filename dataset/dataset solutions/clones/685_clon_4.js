const dataProvider = require('fs');
const rawSourceText = dataProvider.readFileSync('/dev/stdin', 'utf8');

function* lineSequence(textualData) {
    const processedLines = textualData.trim().split('\n');
    for (const singleLine of processedLines) {
        yield singleLine;
    }
}

const inputLineIterator = lineSequence(rawSourceText);

const numericalParser = (textValue) => parseInt(textValue, 10);

const forwardXChanges = [1, 0, -1, -1];
const forwardYChanges = [0, 1, 0, 0];

const backwardXChanges = [-1, 0, 1, 0];
const backwardYChanges = [0, -1, 0, 1];

const confineCoordinates = (currentX, currentY, maxX, maxY) => ({
    x: Math.max(1, Math.min(currentX, maxX)),
    y: Math.max(1, Math.min(currentY, maxY))
});

const commandHandlers = new Map();

commandHandlers.set('RIGHT', (currentPosition) => ({
    ...currentPosition,
    d: (currentPosition.d + 1) % 4
}));

commandHandlers.set('LEFT', (currentPosition) => ({
    ...currentPosition,
    d: (currentPosition.d + 3) % 4
}));

commandHandlers.set('MOVE_STEPS', (currentPosition, steps, movementType, gridMaxX, gridMaxY) => {
    let nextX = currentPosition.x;
    let nextY = currentPosition.y;

    const xDiffs = (movementType === 'forward') ? forwardXChanges : backwardXChanges;
    const yDiffs = (movementType === 'forward') ? forwardYChanges : backwardYChanges;

    for (let s = 0; s < steps; s++) {
        nextX += xDiffs[currentPosition.d];
        nextY += yDiffs[currentPosition.d];

        const constrained = confineCoordinates(nextX, nextY, gridMaxX, gridMaxY);
        nextX = constrained.x;
        nextY = constrained.y;
    }

    return {
        ...currentPosition,
        x: nextX,
        y: nextY
    };
});

const robotOutputCollector = [];

let currentLineEntry;
while ((currentLineEntry = inputLineIterator.next().value) !== undefined) {
    const dimensionsInput = currentLineEntry.split(' ').map(numericalParser);
    const maximumX = dimensionsInput[0];
    const maximumY = dimensionsInput[1];

    if (maximumX === 0 && maximumY === 0) {
        break;
    }

    let currentRobotState = { x: 1, y: 1, d: 0 };

    let continueProcessingRegion = true;
    while (continueProcessingRegion && (currentLineEntry = inputLineIterator.next().value) !== undefined) {
        const commandParts = currentLineEntry.split(' ');
        const primaryAction = commandParts[0];
        const numericArgument = commandParts.length === 2 ? numericalParser(commandParts[1]) : null;

        if (primaryAction === 'STOP') {
            continueProcessingRegion = false;
        } else if (commandHandlers.has(primaryAction)) {
            currentRobotState = commandHandlers.get(primaryAction)(currentRobotState);
        } else if (primaryAction === 'FORWARD') {
            currentRobotState = commandHandlers.get('MOVE_STEPS')(currentRobotState, numericArgument, 'forward', maximumX, maximumY);
        } else if (primaryAction === 'BACKWARD') {
            currentRobotState = commandHandlers.get('MOVE_STEPS')(currentRobotState, numericArgument, 'backward', maximumX, maximumY);
        }
    }
    robotOutputCollector.push(`${currentRobotState.y} ${currentRobotState.x}`);
}

robotOutputCollector.forEach(result => console.log(result));