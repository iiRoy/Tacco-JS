const allDirectionVectors = (() => {
    const vectors = [];
    for (let k = -1; k <= 1; k++) {
        for (let j = -1; j <= 1; j++) {
            for (let i = -1; i <= 1; i++) {
                if (i !== 0 || j !== 0 || k !== 0) {
                    vectors.push([i, j, k]);
                }
            }
        }
    }
    return vectors;
})();

function determineLongestSequence(gridData, playerIdentifier, initialX, initialY, initialZ, dimX, dimY, dimZ) {
    let overallMaxSequence = 0;

    for (const [deltaX, deltaY, deltaZ] of allDirectionVectors) {
        let currentX = initialX;
        let currentY = initialY;
        let currentZ = initialZ;

        while (
            currentX - deltaX >= 0 && currentX - deltaX < dimX &&
            currentY - deltaY >= 0 && currentY - deltaY < dimY &&
            currentZ - deltaZ >= 0 && currentZ - deltaZ < dimZ
        ) {
            currentX -= deltaX;
            currentY -= deltaY;
            currentZ -= deltaZ;
        }

        let currentSequenceLength = 0;
        let maxSequenceInThisDirection = 0;

        while (
            currentX >= 0 && currentX < dimX &&
            currentY >= 0 && currentY < dimY &&
            currentZ >= 0 && currentZ < dimZ
        ) {
            if (gridData[currentX][currentY][currentZ] === playerIdentifier) {
                currentSequenceLength++;
            } else {
                currentSequenceLength = 0;
            }
            maxSequenceInThisDirection = Math.max(maxSequenceInThisDirection, currentSequenceLength);

            currentX += deltaX;
            currentY += deltaY;
            currentZ += deltaZ;
        }
        overallMaxSequence = Math.max(overallMaxSequence, maxSequenceInThisDirection);
    }
    return overallMaxSequence;
}

const create3DArray = (dim1, dim2, dim3, initialValue = 0) =>
    Array.from({ length: dim1 }, () =>
        Array.from({ length: dim2 }, () =>
            Array.from({ length: dim3 }, () => initialValue)
        )
    );

const playerOutputNames = { 1: "Black", 2: "White" };

const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split("\n");

let lineIndex = 0;

while (true) {
    const dimensionsLine = inputLines[lineIndex++];
    if (dimensionsLine === "0 0 0") break;

    const [gridSizeX, winConditionLength, gridSizeZ] = dimensionsLine.split(" ").map(Number);

    const gameBoard = create3DArray(gridSizeX, gridSizeX, gridSizeZ);

    const playerMoves = [];
    for (let i = 0; i < gridSizeZ; i++) {
        playerMoves.push(inputLines[lineIndex++].split(" ").map(Number));
    }

    let currentPlayerIdentifier = 1;
    let gameEnded = false;

    for (const [moveNumber, moveCoords] of playerMoves.entries()) {
        const [colX, colY] = moveCoords.map(coord => coord - 1);

        const dropHeight = gameBoard[colX][colY].findIndex(cell => cell === 0);

        gameBoard[colX][colY][dropHeight] = currentPlayerIdentifier;

        if (determineLongestSequence(gameBoard, currentPlayerIdentifier, colX, colY, dropHeight, gridSizeX, gridSizeX, gridSizeZ) >= winConditionLength) {
            console.log(playerOutputNames[currentPlayerIdentifier], moveNumber + 1);
            gameEnded = true;
            break;
        }

        currentPlayerIdentifier = 3 - currentPlayerIdentifier;
    }

    if (!gameEnded) {
        console.log("Draw");
    }
}
