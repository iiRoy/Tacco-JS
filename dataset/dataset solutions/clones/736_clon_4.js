const directionVectors = [
    [-1, -1, 0], [0, -1, 0], [1, -1, 0], [-1, 0, 0],
    [0, -1, -1], [0, 0, -1], [0, 1, -1], [0, -1, 0],
    [-1, 0, -1], [-1, 0, 0], [-1, 0, 1], [0, 0, -1],
    [1, -1, -1], [-1, -1, -1], [1, -1, 1], [-1, -1, 1]
];

const scanLineForMaxConsecutive = (boardMatrix, currentParticipant, initialX, initialY, initialZ, deltaX, deltaY, deltaZ, extentXY, extentZ) => {
    let cursorX = initialX;
    let cursorY = initialY;
    let cursorZ = initialZ;

    while (true) {
        const potentialX = cursorX - deltaX;
        const potentialY = cursorY - deltaY;
        const potentialZ = cursorZ - deltaZ;
        if (potentialX < 0 || potentialY < 0 || potentialZ < 0 || potentialX >= extentXY || potentialY >= extentXY || potentialZ >= extentZ) {
            break;
        }
        cursorX = potentialX;
        cursorY = potentialY;
        cursorZ = potentialZ;
    }

    let peakConsecutiveCount = 0;
    let currentStreak = 0;

    while (true) {
        cursorX += deltaX;
        cursorY += deltaY;
        cursorZ += deltaZ;

        if (cursorX < 0 || cursorY < 0 || cursorZ < 0 || cursorX >= extentXY || cursorY >= extentXY || cursorZ >= extentZ) {
            break;
        }

        if (boardMatrix[cursorX][cursorY][cursorZ] === currentParticipant) {
            currentStreak++;
        } else {
            currentStreak = 0;
        }
        peakConsecutiveCount = Math.max(peakConsecutiveCount, currentStreak);
    }
    return peakConsecutiveCount;
};

const checkGameCompletion = (activePlayerId, placedX, placedY, placedZ, gameGridState, gridDimensionXY, gridDimensionZ, requiredStreak) => {
    let overallHighestStreak = 0;
    for (const direction of directionVectors) {
        const lineHighestStreak = scanLineForMaxConsecutive(gameGridState, activePlayerId, placedX, placedY, placedZ, direction[0], direction[1], direction[2], gridDimensionXY, gridDimensionZ);
        overallHighestStreak = Math.max(overallHighestStreak, lineHighestStreak);
        if (overallHighestStreak >= requiredStreak) {
            return overallHighestStreak;
        }
    }
    return overallHighestStreak;
};

const gameSessionData = require('fs').readFileSync('/dev/stdin', 'utf8');
const gameLineInputs = gameSessionData.trim().split("\n");

const executeGameRounds = (allInputLines) => {
    let currentLinePointer = 0;
    const retrieveNextLine = () => allInputLines[currentLinePointer++];
    const parseNumericLine = () => retrieveNextLine().split(" ").map(Number);

    while (true) {
        const dimensionString = retrieveNextLine();
        if (dimensionString === "0 0 0") break;

        const [gridSideLength, targetSequenceLength, totalMoveCount] = dimensionString.split(" ").map(Number);

        const playField = Array.from({ length: gridSideLength }, () =>
            Array.from({ length: gridSideLength }, () =>
                Array.from({ length: totalMoveCount }, () => 0)
            )
        );

        const moveInstructions = [];
        for (let idx = 0; idx < totalMoveCount; idx++) {
            moveInstructions.push(parseNumericLine());
        }

        let activePlayerIdentifier = 1;
        let finalOutcome = "Draw";

        for (let moveCounter = 0; moveCounter < totalMoveCount; moveCounter++) {
            const [inputCoordX, inputCoordY] = moveInstructions[moveCounter];
            const boardCoordX = inputCoordX - 1;
            const boardCoordY = inputCoordY - 1;

            let boardCoordZ = 0;
            while (boardCoordZ < totalMoveCount && playField[boardCoordX][boardCoordY][boardCoordZ] !== 0) {
                boardCoordZ++;
            }

            playField[boardCoordX][boardCoordY][boardCoordZ] = activePlayerIdentifier;

            const currentHighestStreak = checkGameCompletion(activePlayerIdentifier, boardCoordX, boardCoordY, boardCoordZ, playField, gridSideLength, totalMoveCount, targetSequenceLength);

            if (currentHighestStreak >= targetSequenceLength) {
                console.log((activePlayerIdentifier === 2) ? "White" : "Black", moveCounter + 1);
                finalOutcome = (activePlayerIdentifier === 2) ? "White" : "Black";
                break;
            }

            activePlayerIdentifier = (activePlayerIdentifier === 1) ? 2 : 1;
        }

        if (finalOutcome === "Draw") {
            console.log("Draw");
        }
    }
};

executeGameRounds(gameLineInputs);