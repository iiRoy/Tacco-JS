const evaluateWinState = (currentPlayerIdentifier, currentX, currentY, currentZ, gameBoardState, boardDimension) => {
    const movementVectors = [
        [-1,-1,0], [0,-1,0], [1,-1,0], [-1,0,0], [1,0,0], [-1,1,0], [0,1,0], [1,1,0],
        [0,-1,-1], [0,0,-1], [0,1,-1], [0,-1,0], [0,1,0], [0,-1,1], [0,0,1], [0,1,1],
        [-1,0,-1], [-1,0,0], [-1,0,1], [0,0,-1], [0,0,1], [1,0,-1], [1,0,0], [1,0,1]
    ];

    let maxConsecutive = 0;

    const countInDirection = (startX, startY, startZ, dX, dY, dZ) => {
        let currentCount = 0;
        let x = startX;
        let y = startY;
        let z = startZ;

        while (true) {
            if (x < 0 || y < 0 || z < 0 || x >= boardDimension || y >= boardDimension || z >= boardDimension) {
                break;
            }
            if (gameBoardState[x][y][z] === currentPlayerIdentifier) {
                currentCount++;
            } else {
                break;
            }
            x += dX;
            y += dY;
            z += dZ;
        }
        return currentCount;
    };

    for (const [dX, dY, dZ] of movementVectors) {
        const forwardCount = countInDirection(currentX, currentY, currentZ, dX, dY, dZ);
        const backwardCount = countInDirection(currentX - dX, currentY - dY, currentZ - dZ, -dX, -dY, -dZ);
        maxConsecutive = Math.max(maxConsecutive, forwardCount + backwardCount);
    }

    return maxConsecutive;
};

const gameInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = gameInputData.trim().split("\n");
let currentLineIndex = 0;

while (true) {
    const gameSetupParameters = inputLines[currentLineIndex++].split(" ").map(Number);
    if (gameSetupParameters[0] === 0 && gameSetupParameters[1] === 0 && gameSetupParameters[2] === 0) {
        break;
    }

    const boardDimension = gameSetupParameters[0];
    const requiredSequenceLength = gameSetupParameters[1];
    const maxVerticalDepth = gameSetupParameters[2];

    const gameBoardState = Array.from({ length: boardDimension }, () =>
        Array.from({ length: boardDimension }, () =>
            Array.from({ length: maxVerticalDepth }, () => 0)
        )
    );

    let currentPlayerIdentifier = 1;
    let isGameUndecided = true;

    for (let moveIndex = 0; moveIndex < maxVerticalDepth; moveIndex++) {
        const moveCoordinates = inputLines[currentLineIndex++].split(" ").map(Number);
        const columnIdx = moveCoordinates[0] - 1;
        const rowIdx = moveCoordinates[1] - 1;

        const verticalLayer = gameBoardState[columnIdx][rowIdx].findIndex(cell => cell === 0);
        
        gameBoardState[columnIdx][rowIdx][verticalLayer] = currentPlayerIdentifier;

        if (evaluateWinState(currentPlayerIdentifier, columnIdx, rowIdx, verticalLayer, gameBoardState, boardDimension) >= requiredSequenceLength) {
            console.log((currentPlayerIdentifier === 2) ? "White" : "Black", moveIndex + 1);
            isGameUndecided = false;
            break;
        }
        currentPlayerIdentifier = (currentPlayerIdentifier === 1) ? 2 : 1;
    }

    if (isGameUndecided) {
        console.log("Draw");
    }
}
