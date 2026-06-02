const retrieveInput = require('fs').readFileSync;

function* parseProblemSets(sourceLines) {
    let currentLineIndex = 0;
    while (true) {
        const dimensionLine = sourceLines[currentLineIndex++];
        const [boardWidth, boardHeight] = dimensionLine.split(' ').map(Number);

        if (boardWidth === 0 && boardHeight === 0) {
            break;
        }

        const commandSequence = [];
        while (true) {
            const commandLine = sourceLines[currentLineIndex++];
            const commandParts = commandLine.split(' ');
            const instructionType = commandParts[0];

            if (instructionType === 'STOP') {
                break;
            }

            commandSequence.push({
                type: instructionType,
                magnitude: commandParts.length > 1 ? Number(commandParts[1]) : undefined
            });
        }
        yield {
            bounds: { width: boardWidth, height: boardHeight },
            instructions: commandSequence
        };
    }
}

const directionalVectors = [
    { deltaX: 0, deltaY: 1 },
    { deltaX: 1, deltaY: 0 },
    { deltaX: 0, deltaY: -1 },
    { deltaX: -1, deltaY: 0 }
];

const restrictPosition = (currentPos, boardLimits) => ({
    x: Math.max(1, Math.min(boardLimits.width, currentPos.x)),
    y: Math.max(1, Math.min(boardLimits.height, currentPos.y))
});

const executeCommand = (initialState, command, boardLimits) => {
    let nextState = { ...initialState };

    switch (command.type) {
        case 'RIGHT':
            nextState.orientation = (initialState.orientation + 1) % 4;
            break;
        case 'LEFT':
            nextState.orientation = (initialState.orientation + 3) % 4;
            break;
        case 'FORWARD': {
            const vector = directionalVectors[initialState.orientation];
            nextState.x += vector.deltaX * command.magnitude;
            nextState.y += vector.deltaY * command.magnitude;
            break;
        }
        case 'BACKWARD': {
            const vector = directionalVectors[initialState.orientation];
            nextState.x -= vector.deltaX * command.magnitude;
            nextState.y -= vector.deltaY * command.magnitude;
            break;
        }
    }

    const clampedCoords = restrictPosition(nextState, boardLimits);
    return { ...nextState, x: clampedCoords.x, y: clampedCoords.y };
};

const simulateRobotPath = (startingState, commandList, boardLimits) => {
    return commandList.reduce((currentRobotState, currentCommand) => {
        return executeCommand(currentRobotState, currentCommand, boardLimits);
    }, startingState);
};

const rawInputContent = retrieveInput('/dev/stdin', 'utf8');
const inputLines = rawInputContent.trim().split('\n');

for (const problemConfiguration of parseProblemSets(inputLines)) {
    const initialRobotPosition = { x: 1, y: 1, orientation: 0 };
    const finalRobotPosition = simulateRobotPath(
        initialRobotPosition,
        problemConfiguration.instructions,
        problemConfiguration.bounds
    );
    console.log(`${finalRobotPosition.x} ${finalRobotPosition.y}`);
}
