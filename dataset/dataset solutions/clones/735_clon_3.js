function evaluateWinCondition(activePlayerIdentifier, currentDropX, currentDropY, currentDropZ, gridSize, gameBoard) {
    const allDirections = [];
    for (let dX = -1; dX <= 1; dX++) {
        for (let dY = -1; dY <= 1; dY++) {
            for (let dZ = -1; dZ <= 1; dZ++) {
                if (dX !== 0 || dY !== 0 || dZ !== 0) {
                    allDirections.push({ dX, dY, dZ });
                }
            }
        }
    }

    let maximumSequenceFound = 0;
    const numDirections = allDirections.length;

    for (let i = 0; i < numDirections; i++) {
        const { dX: deltaX, dY: deltaY, dZ: deltaZ } = allDirections[i];

        let tempCoordX = currentDropX;
        let tempCoordY = currentDropY;
        let tempCoordZ = currentDropZ;

        while (true) {
            tempCoordX -= deltaX;
            tempCoordY -= deltaY;
            tempCoordZ -= deltaZ;

            const isOutOfBounds = tempCoordX < 0 || tempCoordY < 0 || tempCoordZ < 0 ||
                                  tempCoordX >= gridSize || tempCoordY >= gridSize || tempCoordZ >= gridSize;
            if (isOutOfBounds) {
                break;
            }
        }

        let currentSequenceLength = 0;
        while (true) {
            tempCoordX += deltaX;
            tempCoordY += deltaY;
            tempCoordZ += deltaZ;

            const isOutOfBounds = tempCoordX < 0 || tempCoordY < 0 || tempCoordZ < 0 ||
                                  tempCoordX >= gridSize || tempCoordY >= gridSize || tempCoordZ >= gridSize;
            if (isOutOfBounds) {
                break;
            }

            const cellValue = gameBoard[tempCoordX][tempCoordY][tempCoordZ];
            if (cellValue === activePlayerIdentifier) {
                currentSequenceLength++;
            } else {
                currentSequenceLength = 0;
            }
            maximumSequenceFound = Math.max(maximumSequenceFound, currentSequenceLength);
        }
    }
    return maximumSequenceFound;
}

const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputData.trim().split("\n");

while (true) {
    let gameParametersLine = inputLinesArray.shift();
    if (gameParametersLine === "0 0 0") {
        break;
    }

    const parsedParameters = gameParametersLine.split(" ").map(Number);
    const gridSize = parsedParameters[0]; // n
    const requiredWinLength = parsedParameters[1]; // m
    const totalMovesPossible = parsedParameters[2]; // p (Z-dimension limit)

    const gameBoard = [];
    for (let i = 0; i < gridSize; i++) {
        const yDimension = [];
        for (let j = 0; j < gridSize; j++) {
            const zDimension = new Array(totalMovesPossible).fill(0);
            yDimension.push(zDimension);
        }
        gameBoard.push(yDimension);
    }

    let activePlayerIdentifier = 1; // Player 1 (Black)
    let isGameDraw = true;

    for (let moveIndex = 0; moveIndex < totalMovesPossible; moveIndex++) {
        const moveCoordinatesLine = inputLinesArray.shift();
        const playCoordinates = moveCoordinatesLine.split(" ").map(Number);
        const currentDropX = playCoordinates[0] - 1;
        const currentDropY = playCoordinates[1] - 1;

        let dropHeight = 0;
        while (true) {
            if (gameBoard[currentDropX][currentDropY][dropHeight] !== 0) {
                dropHeight++;
            } else {
                break;
            }
        }
        gameBoard[currentDropX][currentDropY][dropHeight] = activePlayerIdentifier;

        const longestSequence = evaluateWinCondition(activePlayerIdentifier, currentDropX, currentDropY, dropHeight, gridSize, gameBoard);
        if (longestSequence >= requiredWinLength) {
            const winnerName = (activePlayerIdentifier === 2) ? "White" : "Black";
            console.log(winnerName, moveIndex + 1);
            isGameDraw = false;
            break;
        }

        activePlayerIdentifier = (activePlayerIdentifier === 1) ? 2 : 1;
    }

    if (isGameDraw) {
        console.log("Draw");
    }
}
