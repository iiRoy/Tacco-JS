const retrieveInput = require('fs').readFileSync;

const generateMovementVectors = () => {
    let deltaX = [-1, 0, 1, -1, 1, -1, 0, 1];
    let deltaY = [-1, -1, -1, 0, 0, 1, 1, 1];
    let deltaZ = [0, 0, 0, 0, 0, 0, 0, 0];

    deltaY = deltaY.concat([-1, 0, 1, -1, 1, -1, 0, 1]);
    deltaZ = deltaZ.concat([-1, -1, -1, 0, 0, 1, 1, 1]);
    deltaX = deltaX.concat([0, 0, 0, 0, 0, 0, 0, 0]);

    deltaZ = deltaZ.concat([-1, 0, 1, -1, 1, -1, 0, 1]);
    deltaX = deltaX.concat([-1, -1, -1, 0, 0, 1, 1, 1]);
    deltaY = deltaY.concat([0, 0, 0, 0, 0, 0, 0, 0]);

    const vectors = [];
    for (let i = 0; i < deltaX.length; i++) {
        vectors.push([deltaX[i], deltaY[i], deltaZ[i]]);
    }
    return vectors;
};

const movementVectors = generateMovementVectors();

function evaluateSequence(activePlayerMark, initialX, initialY, initialZ, gameGrid, gridDimension) {
    let longestRun = 0;

    for (const [ddx, ddy, ddz] of movementVectors) {
        let currentCoordX = initialX;
        let currentCoordY = initialY;
        let currentCoordZ = initialZ;

        // Phase 1: Traverse backward along the direction until just outside bounds
        while (true) {
            const prevX = currentCoordX;
            const prevY = currentCoordY;
            const prevZ = currentCoordZ;

            currentCoordX -= ddx;
            currentCoordY -= ddy;
            currentCoordZ -= ddz;

            if (currentCoordX < 0 || currentCoordY < 0 || currentCoordZ < 0 ||
                currentCoordX >= gridDimension || currentCoordY >= gridDimension || currentCoordZ >= gridDimension) {
                
                currentCoordX = prevX; // Revert to the last valid coordinate
                currentCoordY = prevY;
                currentCoordZ = prevZ;
                break;
            }
        }

        // Phase 2: Traverse forward from the determined starting point, counting consecutive pieces
        let currentRun = 0;
        while (true) {
            if (currentCoordX < 0 || currentCoordY < 0 || currentCoordZ < 0 ||
                currentCoordX >= gridDimension || currentCoordY >= gridDimension || currentCoordZ >= gridDimension) {
                break; // Out of bounds
            }

            // Accessing gameGrid[currentCoordX][currentCoordY][currentCoordZ] might yield undefined
            // if currentCoordZ exceeds the actual Z-dimension (totalTurns).
            // The comparison `undefined === activePlayerMark` will correctly evaluate to false.
            if (gameGrid[currentCoordX]?.[currentCoordY]?.[currentCoordZ] === activePlayerMark) {
                currentRun++;
            } else {
                currentRun = 0;
            }
            longestRun = Math.max(longestRun, currentRun);

            currentCoordX += ddx;
            currentCoordY += ddy;
            currentCoordZ += ddz;
        }
    }
    return longestRun;
}

const rawInput = retrieveInput('/dev/stdin', 'utf8');
const inputLines = rawInput.trim().split('\n');
let linePointer = 0;

while (true) {
    const configString = inputLines[linePointer++];
    if (configString === "0 0 0") break;

    const [gridDimension, winningLength, totalTurns] = configString.split(" ").map(Number);

    const gameGrid = Array.from({ length: gridDimension }, () =>
        Array.from({ length: gridDimension }, () =>
            Array.from({ length: totalTurns }, () => 0)
        )
    );

    let activePlayerMark = 1; // 1 for Black, 2 for White
    let gameConcluded = false;

    for (let turnNumber = 0; turnNumber < totalTurns; turnNumber++) {
        const moveCoordinatesString = inputLines[linePointer++];
        const [column, row] = moveCoordinatesString.split(" ").map(val => Number(val) - 1); // 0-indexed

        let depthPosition = 0;
        while (depthPosition < totalTurns && gameGrid[column][row][depthPosition] !== 0) {
            depthPosition++;
        }
        
        gameGrid[column][row][depthPosition] = activePlayerMark;

        if (evaluateSequence(activePlayerMark, column, row, depthPosition, gameGrid, gridDimension) >= winningLength) {
            console.log((activePlayerMark === 2) ? "White" : "Black", turnNumber + 1);
            gameConcluded = true;
            break;
        }
        activePlayerMark = (activePlayerMark === 1) ? 2 : 1; // Toggle player
    }

    if (!gameConcluded) {
        console.log("Draw");
    }
}
