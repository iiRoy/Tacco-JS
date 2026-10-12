const xMovementMap = { N: 0, S: 0, E: 1, W: -1 };
const yMovementMap = { N: 1, S: -1, E: 0, W: 0 };

function createEmptyGrid(gridDimension) {
    const newGrid = [];
    for (let r = 0; r < gridDimension; r++) {
        newGrid[r] = [];
        for (let c = 0; c < gridDimension; c++) {
            newGrid[r][c] = false;
        }
    }
    return newGrid;
}

function attemptPointCollection(gridReference, xCoord, yCoord, collectedCounterRef) {
    if (gridReference[xCoord][yCoord]) {
        gridReference[xCoord][yCoord] = false;
        collectedCounterRef.value++;
    }
}

function ProcessInput(rawData){
    const inputLines = rawData.split("\n");
    let linePointer = 0;

    const GRID_MAX_COORD = 20;
    const START_POSITION_X = 10;
    const START_POSITION_Y = 10;

    for (;;) {
        const totalInitialPoints = parseInt(inputLines[linePointer++], 10);

        if (totalInitialPoints === 0) {
            break;
        }

        const pointGrid = createEmptyGrid(GRID_MAX_COORD + 1);

        for (let pointIdx = 0; pointIdx < totalInitialPoints; pointIdx++) {
            const currentPointLine = inputLines[linePointer];
            const pointCoordinates = currentPointLine.split(" ");
            const px = parseInt(pointCoordinates[0], 10);
            const py = parseInt(pointCoordinates[1], 10);
            pointGrid[px][py] = true;
            linePointer++;
        }

        const numOperations = parseInt(inputLines[linePointer++], 10);

        const operationTypes = [];
        const operationDistances = [];

        for (let opIdx = 0; opIdx < numOperations; opIdx++) {
            const currentOpLine = inputLines[linePointer];
            const opDetails = currentOpLine.split(" ");
            operationTypes[opIdx] = opDetails[0];
            operationDistances[opIdx] = parseInt(opDetails[1], 10);
            linePointer++;
        }

        const collectedPointCounter = { value: 0 };

        let currentX = START_POSITION_X;
        let currentY = START_POSITION_Y;

        attemptPointCollection(pointGrid, currentX, currentY, collectedPointCounter);

        for (let opStepIdx = 0; opStepIdx < numOperations; opStepIdx++) {
            const currentOperation = operationTypes[opStepIdx];
            const distanceToMove = operationDistances[opStepIdx];

            for (let moveStep = 0; moveStep < distanceToMove; moveStep++) {
                const nextX = currentX + xMovementMap[currentOperation];
                const nextY = currentY + yMovementMap[currentOperation];

                currentX = nextX;
                currentY = nextY;

                attemptPointCollection(pointGrid, currentX, currentY, collectedPointCounter);
            }
        }

        const finalCollectedCount = collectedPointCounter.value;
        if (finalCollectedCount === totalInitialPoints) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}

ProcessInput(require("fs").readFileSync("/dev/stdin","utf8"));
