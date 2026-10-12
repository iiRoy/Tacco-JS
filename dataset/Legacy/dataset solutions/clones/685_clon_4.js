const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputContent.trim().split('\n');

function* scenarioIterator(sourceLines) {
    let currentLineIndex = 0;
    while (true) {
        const dimensionString = sourceLines[currentLineIndex++];
        if (dimensionString === '0 0') {
            return;
        }
        const [widthValue, heightValue] = dimensionString.split(' ').map(Number);

        const commandSequence = [];
        while (true) {
            const commandString = sourceLines[currentLineIndex++];
            const commandParts = commandString.split(' ');
            const commandType = commandParts[0];

            if (commandType === 'STOP') {
                break;
            }

            const commandMagnitude = commandParts.length === 2 ? Number(commandParts[1]) : undefined;
            commandSequence.push({ kind: commandType, amount: commandMagnitude });
        }
        yield { gridWidth: widthValue, gridHeight: heightValue, instructions: commandSequence };
    }
}

const robotSimulator = {
    createInitialState: () => ({
        currentXPosition: 1,
        currentYPosition: 1,
        facingDirection: 0 // 0: Up, 1: Right, 2: Down, 3: Left
    }),

    commandDispatch: {
        RIGHT: (robotState) => {
            robotState.facingDirection = (robotState.facingDirection + 1);
            if (robotState.facingDirection === 4) {
                // Replicating the original ReferenceError bug: `x` is not defined.
                // The original code attempts to assign to `x[0]` where `x` is an undeclared variable.
                // This will cause a ReferenceError: x is not defined.
                // eslint-disable-next-line no-undef
                x[0] = 0;
            }
        },
        LEFT: (robotState) => {
            robotState.facingDirection = (robotState.facingDirection - 1);
            if (robotState.facingDirection === -1) {
                // Replicating the original ReferenceError bug: `x` is not defined.
                // eslint-disable-next-line no-undef
                x[0] = 3;
            }
        },
        FORWARD: (robotState, steps, bounds) => {
            let nextX = robotState.currentXPosition;
            let nextY = robotState.currentYPosition;

            // Original buggy movement logic for FORWARD
            if (robotState.facingDirection === 0) nextY += steps; // Up (Y increases)
            else if (robotState.facingDirection === 1) nextX += steps; // Right (X increases)
            else if (robotState.facingDirection === 2) nextY -= steps; // Down (Y decreases)
            else if (robotState.facingDirection === 3) nextY -= steps; // Left (Y decreases - BUG PRESERVED)

            robotState.currentXPosition = Math.max(1, Math.min(bounds.gridWidth, nextX));
            robotState.currentYPosition = Math.max(1, Math.min(bounds.gridHeight, nextY));
        },
        BACKWARD: (robotState, steps, bounds) => {
            let nextX = robotState.currentXPosition;
            let nextY = robotState.currentYPosition;

            // Original buggy movement logic for BACKWARD
            if (robotState.facingDirection === 0) nextY -= steps; // Up (Y decreases)
            else if (robotState.facingDirection === 1) nextX -= steps; // Right (X decreases)
            else if (robotState.facingDirection === 2) nextY += steps; // Down (Y increases)
            else if (robotState.facingDirection === 3) nextX += steps; // Left (X increases - BUG PRESERVED)

            robotState.currentXPosition = Math.max(1, Math.min(bounds.gridWidth, nextX));
            robotState.currentYPosition = Math.max(1, Math.min(bounds.gridHeight, nextY));
        }
    }
};

for (const currentScenarioData of scenarioIterator(inputLinesArray)) {
    const activeRobot = robotSimulator.createInitialState();
    const currentBounds = { gridWidth: currentScenarioData.gridWidth, gridHeight: currentScenarioData.gridHeight };

    for (const currentInstruction of currentScenarioData.instructions) {
        const commandExecutor = robotSimulator.commandDispatch[currentInstruction.kind];
        if (commandExecutor) {
            commandExecutor(activeRobot, currentInstruction.amount, currentBounds);
        }
    }
    console.log(`${activeRobot.currentXPosition} ${activeRobot.currentYPosition}`);
}
