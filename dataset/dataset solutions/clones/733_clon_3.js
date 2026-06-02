const generateAllDirections = () => {
    const deltaXCoords = [];
    const deltaYCoords = [];
    const deltaZCoords = [];

    for (let zDirection = -1; zDirection <= 1; zDirection++) {
        for (let yDirection = -1; yDirection <= 1; yDirection++) {
            for (let xDirection = -1; xDirection <= 1; xDirection++) {
                if (xDirection === 0 && yDirection === 0 && zDirection === 0) continue;
                deltaXCoords.push(xDirection);
                deltaYCoords.push(yDirection);
                deltaZCoords.push(zDirection);
            }
        }
    }
    return { deltaXCoords, deltaYCoords, deltaZCoords };
};

const { deltaXCoords, deltaYCoords, deltaZCoords } = generateAllDirections();

function evaluateWinCondition(activePlayerPiece, currentX, currentY, currentZ, boardDimension, requiredLength, gameBoard) {
    let maxConsecutive = 0;

    for (let i = 0; i < deltaXCoords.length; i++) {
        const directionX = deltaXCoords[i];
        const directionY = deltaYCoords[i];
        const directionZ = deltaZCoords[i];

        let tempX = currentX;
        let tempY = currentY;
        let tempZ = currentZ;

        // Move backwards along the current direction until out of bounds
        while (true) {
            const prevX = tempX - directionX;
            const prevY = tempY - directionY;
            const prevZ = tempZ - directionZ;

            if (prevX < 0 || prevY < 0 || prevZ < 0 || prevX >= boardDimension || prevY >= boardDimension || prevZ >= boardDimension) {
                break;
            }
            tempX = prevX;
            tempY = prevY;
            tempZ = prevZ;
        }

        let consecutiveCount = 0;
        // Iterate forwards from the determined starting point and count consecutive pieces
        while (true) {
            if (tempX < 0 || tempY < 0 || tempZ < 0 || tempX >= boardDimension || tempY >= boardDimension || tempZ >= boardDimension) {
                break;
            }

            if (gameBoard[tempX][tempY][tempZ] === activePlayerPiece) {
                consecutiveCount++;
            } else {
                consecutiveCount = 0;
            }
            maxConsecutive = Math.max(maxConsecutive, consecutiveCount);

            tempX += directionX;
            tempY += directionY;
            tempZ += directionZ;
        }
    }
    return maxConsecutive;
}

const fileContents = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContents.trim().split('\n');
let currentLineIndex = 0;

const parseLineOfNumbers = (line) => line.split(' ').map(Number);

while (true) {
    const dimensionsLine = inputLines[currentLineIndex++];
    if (dimensionsLine === "0 0 0") {
        break;
    }

    const [boardSize, requiredLength, totalMoves] = parseLineOfNumbers(dimensionsLine);

    const gameBoard = Array.from({ length: boardSize }, () =>
        Array.from({ length: boardSize }, () =>
            Array.from({ length: totalMoves }, () => 0)
        )
    );

    let currentPlayerPiece = 1;
    let gameHasWinner = false;
    let moveNumber;

    for (moveNumber = 0; moveNumber < totalMoves; moveNumber++) {
        const moveCoordinatesLine = inputLines[currentLineIndex++];
        const [rawX, rawY] = parseLineOfNumbers(moveCoordinatesLine);
        const dropColumnX = rawX - 1;
        const dropColumnY = rawY - 1;

        let dropZLevel = 0;
        while (dropZLevel < totalMoves && gameBoard[dropColumnX][dropColumnY][dropZLevel] !== 0) {
            dropZLevel++;
        }

        gameBoard[dropColumnX][dropColumnY][dropZLevel] = currentPlayerPiece;

        if (evaluateWinCondition(currentPlayerPiece, dropColumnX, dropColumnY, dropZLevel, boardSize, requiredLength, gameBoard) >= requiredLength) {
            console.log((currentPlayerPiece === 2) ? "White" : "Black", moveNumber + 1);
            gameHasWinner = true;
            break;
        }

        currentPlayerPiece = (currentPlayerPiece === 1) ? 2 : 1;
    }

    if (!gameHasWinner) {
        console.log("Draw");
    }
}
