const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');
let lineIndex = 0;

while (true) {
    const dimensionsLine = inputLines[lineIndex++];
    if (dimensionsLine === "0 0") break;

    const [gridWidth, gridHeight] = dimensionsLine.split(' ').map(Number);

    const robotState = {
        xCoord: 1,
        yCoord: 1,
        orientationIndex: 0 // 0: North, 1: East, 2: South, 3: West
    };

    const cardinalVectors = [
        { deltaX: 0, deltaY: 1 },  // North (y increases)
        { deltaX: 1, deltaY: 0 },  // East (x increases)
        { deltaX: 0, deltaY: -1 }, // South (y decreases)
        { deltaX: -1, deltaY: 0 }  // West (x decreases)
    ];

    while (true) {
        const commandLine = inputLines[lineIndex++];
        const commandParts = commandLine.split(' ');
        const actionType = commandParts[0];
        const actionValue = commandParts.length === 2 ? Number(commandParts[1]) : undefined;

        if (actionType === "STOP") break;

        const commandExecutors = {
            "RIGHT": () => {
                robotState.orientationIndex = (robotState.orientationIndex + 1) % 4;
            },
            "LEFT": () => {
                robotState.orientationIndex = (robotState.orientationIndex - 1 + 4) % 4;
            },
            "FORWARD": () => {
                const currentVector = cardinalVectors[robotState.orientationIndex];
                for (let i = 0; i < actionValue; i++) {
                    robotState.xCoord += currentVector.deltaX;
                    robotState.yCoord += currentVector.deltaY;
                }
            },
            "BACKWARD": () => {
                const currentVector = cardinalVectors[robotState.orientationIndex];
                for (let i = 0; i < actionValue; i++) {
                    robotState.xCoord -= currentVector.deltaX;
                    robotState.yCoord -= currentVector.deltaY;
                }
            }
        };

        if (commandExecutors[actionType]) {
            commandExecutors[actionType]();
        }

        robotState.xCoord = Math.max(1, Math.min(gridWidth, robotState.xCoord));
        robotState.yCoord = Math.max(1, Math.min(gridHeight, robotState.yCoord));
    }
    console.log(`${robotState.xCoord} ${robotState.yCoord}`);
}
