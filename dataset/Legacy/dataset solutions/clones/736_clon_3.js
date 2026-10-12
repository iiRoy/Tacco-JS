const deltaXCoords = [-1, 0, 1, -1, 0, 0, 0, 0, -1, -1, -1, 0, 1, -1, 1, -1];
const deltaYCoords = [-1, -1, -1, 0, -1, 0, 1, -1, 0, 0, 0, 0, -1, -1, -1, -1];
const deltaZCoords = [0, 0, 0, 0, -1, -1, -1, 0, -1, 0, 1, -1, -1, -1, 1, 1];

function isCoordinateOutOfBounds(xCoord, yCoord, zCoord, boardSizeXY, boardSizeZ) {
    return xCoord < 0 || yCoord < 0 || zCoord < 0 ||
           xCoord >= boardSizeXY || yCoord >= boardSizeXY || zCoord >= boardSizeZ;
}

function checkConnectN(playerIdentifier, startX, startY, startZ, boardSizeXY, boardSizeZ, targetConnectCount, gameBoardState) {
    let maxConsecutive = 0;

    for (let directionIndex = 0; directionIndex < deltaXCoords.length; directionIndex++) {
        const currentDeltaX = deltaXCoords[directionIndex];
        const currentDeltaY = deltaYCoords[directionIndex];
        const currentDeltaZ = deltaZCoords[directionIndex];

        let currentX = startX;
        let currentY = startY;
        let currentZ = startZ;

        // Traverse backwards along the current direction to find the line's origin
        while (true) {
            const nextX = currentX - currentDeltaX;
            const nextY = currentY - currentDeltaY;
            const nextZ = currentZ - currentDeltaZ;

            if (isCoordinateOutOfBounds(nextX, nextY, nextZ, boardSizeXY, boardSizeZ)) {
                break;
            }
            currentX = nextX;
            currentY = nextY;
            currentZ = nextZ;
        }

        let currentConsecutive = 0;
        // Traverse forwards from the origin, counting consecutive pieces
        while (true) {
            if (isCoordinateOutOfBounds(currentX, currentY, currentZ, boardSizeXY, boardSizeZ)) {
                break;
            }

            if (gameBoardState[currentX][currentY][currentZ] === playerIdentifier) {
                currentConsecutive++;
            } else {
                currentConsecutive = 0;
            }
            maxConsecutive = Math.max(maxConsecutive, currentConsecutive);

            currentX += currentDeltaX;
            currentY += currentDeltaY;
            currentZ += currentDeltaZ;
        }
    }
    return maxConsecutive;
}

function findNextAvailableZ(board, col, row, boardSizeZ) {
    let dropZLevel = 0;
    while (dropZLevel < boardSizeZ) {
        if (board[col][row][dropZLevel] !== 0) {
            dropZLevel++;
        } else {
            break;
        }
    }
    return dropZLevel;
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLinesArray = rawInputData.trim().split("\n");

const PLAYER_ONE_ID = 1;
const PLAYER_TWO_ID = 2;
const playerNamesMap = {
    [PLAYER_ONE_ID]: "Black",
    [PLAYER_TWO_ID]: "White"
};

while (true) {
    let gameParametersLine = inputLinesArray.shift();
    if (gameParametersLine === "0 0 0") {
        break;
    }

    const parsedGameParams = gameParametersLine.split(" ").map(Number);
    const boardSizeXY = parsedGameParams[0];
    const targetConnectCount = parsedGameParams[1];
    const boardSizeZ = parsedGameParams[2];

    const gameBoardState = [];
    for (let i = 0; i < boardSizeXY; i++) {
        gameBoardState[i] = [];
        for (let j = 0; j < boardSizeXY; j++) {
            gameBoardState[i][j] = new Array(boardSizeZ).fill(0);
        }
    }

    const playerMoveCoordinates = [];
    for (let i = 0; i < boardSizeZ; i++) {
        playerMoveCoordinates.push(inputLinesArray.shift().split(" ").map(Number));
    }

    let activePlayerId = PLAYER_ONE_ID;
    let gameIsDraw = true;

    for (let moveNumberIndex = 0; moveNumberIndex < boardSizeZ; moveNumberIndex++) {
        const currentMoveInput = playerMoveCoordinates[moveNumberIndex];
        const moveCol = currentMoveInput[0] - 1;
        const moveRow = currentMoveInput[1] - 1;

        const dropZLevel = findNextAvailableZ(gameBoardState, moveCol, moveRow, boardSizeZ);

        gameBoardState[moveCol][moveRow][dropZLevel] = activePlayerId;

        const longestConnection = checkConnectN(
            activePlayerId,
            moveCol,
            moveRow,
            dropZLevel,
            boardSizeXY,
            boardSizeZ,
            targetConnectCount,
            gameBoardState
        );

        if (longestConnection >= targetConnectCount) {
            console.log(playerNamesMap[activePlayerId], moveNumberIndex + 1);
            gameIsDraw = false;
            break;
        }

        activePlayerId = (activePlayerId === PLAYER_ONE_ID) ? PLAYER_TWO_ID : PLAYER_ONE_ID;
    }

    if (gameIsDraw) {
        console.log("Draw");
    }
}
