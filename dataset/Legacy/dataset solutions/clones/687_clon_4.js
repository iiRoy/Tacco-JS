const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split('\n');

const extractDimensions = (lineContent) => {
    const [widthString, heightString] = lineContent.split(' ');
    return { boundaryWidth: Number(widthString), boundaryHeight: Number(heightString) };
};

const initialRobotPosition = { xCoord: 1, yCoord: 1, orientation: 0 }; // orientation: 0=Up, 1=Right, 2=Down, 3=Left

// These displacement vectors are derived directly from the original code's logic,
// including its specific (and potentially unconventional) movement for orientation 3 (Left).
// orientation: 0 (UP), 1 (RIGHT), 2 (DOWN), 3 (LEFT)
const forwardDisplacementVectors = [
    { deltaX: 0, deltaY: 1 }, // 0: UP -> yCoord++
    { deltaX: 1, deltaY: 0 }, // 1: RIGHT -> xCoord++
    { deltaX: 0, deltaY: -1 },// 2: DOWN -> yCoord--
    { deltaX: 0, deltaY: -1 }  // 3: LEFT -> yCoord-- (Original code's xy[2]-- for xy[0]==3)
];

const backwardDisplacementVectors = [
    { deltaX: 0, deltaY: -1 },// 0: UP -> yCoord-- (backward from UP is DOWN)
    { deltaX: -1, deltaY: 0 },// 1: RIGHT -> xCoord-- (backward from RIGHT is LEFT)
    { deltaX: 0, deltaY: 1 }, // 2: DOWN -> yCoord++ (backward from DOWN is UP)
    { deltaX: 1, deltaY: 0 }  // 3: LEFT -> xCoord++ (backward from LEFT is RIGHT)
];

const constrainCoordinates = (currentX, currentY, maxW, maxH) => ({
    xCoord: Math.max(1, Math.min(currentX, maxW)),
    yCoord: Math.max(1, Math.min(currentY, maxH))
});

const commandExecutors = {
    "RIGHT": (currentPos, stepCount, maxW, maxH) => {
        const nextOrientation = (currentPos.orientation + 1) % 4;
        return { ...currentPos, orientation: nextOrientation };
    },
    "LEFT": (currentPos, stepCount, maxW, maxH) => {
        const nextOrientation = (currentPos.orientation - 1 + 4) % 4; // Ensure positive modulo
        return { ...currentPos, orientation: nextOrientation };
    },
    "FORWARD": (currentPos, stepCount, maxW, maxH) => {
        const displacement = forwardDisplacementVectors[currentPos.orientation];
        let tempX = currentPos.xCoord;
        let tempY = currentPos.yCoord;

        Array.from({ length: stepCount }).forEach(() => {
            tempX += displacement.deltaX;
            tempY += displacement.deltaY;
            const constrained = constrainCoordinates(tempX, tempY, maxW, maxH);
            tempX = constrained.xCoord;
            tempY = constrained.yCoord;
        });
        return { ...currentPos, xCoord: tempX, yCoord: tempY };
    },
    "BACKWARD": (currentPos, stepCount, maxW, maxH) => {
        const displacement = backwardDisplacementVectors[currentPos.orientation];
        let tempX = currentPos.xCoord;
        let tempY = currentPos.yCoord;

        Array.from({ length: stepCount }).forEach(() => {
            tempX += displacement.deltaX;
            tempY += displacement.deltaY;
            const constrained = constrainCoordinates(tempX, tempY, maxW, maxH);
            tempX = constrained.xCoord;
            tempY = constrained.yCoord;
        });
        return { ...currentPos, xCoord: tempX, yCoord: tempY };
    }
};

const processRobotSimulation = (linesCollection, currentLineIndex = 0) => {
    if (currentLineIndex >= linesCollection.length) {
        return;
    }

    const dimensionSpecification = linesCollection[currentLineIndex];
    if (dimensionSpecification === "0 0") {
        return;
    }

    const { boundaryWidth, boundaryHeight } = extractDimensions(dimensionSpecification);
    const scenarioStartingPosition = { ...initialRobotPosition };

    let commandBlockEndIndex = currentLineIndex + 1;
    while (linesCollection[commandBlockEndIndex].split(' ')[0] !== "STOP") {
        commandBlockEndIndex++;
    }

    const commandsForCurrentScenario = linesCollection.slice(currentLineIndex + 1, commandBlockEndIndex);

    const finalRobotPosition = commandsForCurrentScenario.reduce((currentRobotState, commandEntry) => {
        const [commandIdentifier, valueString] = commandEntry.split(' ');
        const commandValue = Number(valueString);

        const executor = commandExecutors[commandIdentifier];
        return executor ? executor(currentRobotState, commandValue, boundaryWidth, boundaryHeight) : currentRobotState;
    }, scenarioStartingPosition);

    console.log(`${finalRobotPosition.xCoord} ${finalRobotPosition.yCoord}`);

    processRobotSimulation(linesCollection, commandBlockEndIndex + 1);
};

processRobotSimulation(processedInputLines);
