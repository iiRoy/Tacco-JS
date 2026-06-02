const generateAllDirections = () => {
    const directions = [];
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            for (let k = -1; k <= 1; k++) {
                if (i === 0 && j === 0 && k === 0) continue;
                directions.push({ deltaX: i, deltaY: j, deltaZ: k });
            }
        }
    }
    return directions;
};

const ALL_3D_DIRECTIONS = generateAllDirections();

function calculateMaxConsecutive(playerValue, startCoordX, startCoordY, startCoordZ, gameBoard, gridSizeN, depthP) {
    let overallMaxConsecutive = 0;

    for (const directionVector of ALL_3D_DIRECTIONS) {
        const { deltaX, deltaY, deltaZ } = directionVector;

        let currentScanX = startCoordX;
        let currentScanY = startCoordY;
        let currentScanZ = startCoordZ;

        while (true) {
            const nextScanX = currentScanX - deltaX;
            const nextScanY = currentScanY - deltaY;
            const nextScanZ = currentScanZ - deltaZ;

            if (nextScanX < 0 || nextScanY < 0 || nextScanZ < 0 ||
                nextScanX >= gridSizeN || nextScanY >= gridSizeN || nextScanZ >= depthP) {
                break;
            }
            currentScanX = nextScanX;
            currentScanY = nextScanY;
            currentScanZ = nextScanZ;
        }

        let currentLineConsecutiveCount = 0;
        while (true) {
            currentScanX += deltaX;
            currentScanY += deltaY;
            currentScanZ += deltaZ;

            if (currentScanX < 0 || currentScanY < 0 || currentScanZ < 0 ||
                currentScanX >= gridSizeN || currentScanY >= gridSizeN || currentScanZ >= depthP) {
                break;
            }

            if (gameBoard[currentScanX][currentScanY][currentScanZ] === playerValue) {
                currentLineConsecutiveCount++;
            } else {
                currentLineConsecutiveCount = 0;
            }
            overallMaxConsecutive = Math.max(overallMaxConsecutive, currentLineConsecutiveCount);
        }
    }
    return overallMaxConsecutive;
}

const findNextAvailableDepth = (board, colX, colY, maxDepth) => {
    let currentDepth = 0;
    while (true) {
        if (board[colX][colY][currentDepth] !== 0) {
            currentDepth++;
        } else {
            return currentDepth;
        }
    }
};

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputData.trim().split("\n");

while (true) {
    const dimensionsLine = inputLines.shift();
    if (dimensionsLine === "0 0 0") {
        break;
    }

    const [gridSizeN, winConditionM, depthP] = dimensionsLine.split(" ").map(Number);

    const gameBoard = Array.from({ length: gridSizeN }, () =>
        Array.from({ length: gridSizeN }, () =>
            Array.from({ length: depthP }, () => 0)
        )
    );

    const playerMoves = [];
    for (let i = 0; i < depthP; i++) {
        playerMoves.push(inputLines.shift().split(" ").map(Number));
    }

    let currentPlayerValue = 1;
    let gameIsDraw = true;

    for (let moveIndex = 0; moveIndex < depthP; moveIndex++) {
        const currentMoveCoords = playerMoves[moveIndex];
        const moveX = currentMoveCoords[0] - 1;
        const moveY = currentMoveCoords[1] - 1;

        const dropZ = findNextAvailableDepth(gameBoard, moveX, moveY, depthP);

        gameBoard[moveX][moveY][dropZ] = currentPlayerValue;

        const maxConsecutiveCount = calculateMaxConsecutive(
            currentPlayerValue,
            moveX,
            moveY,
            dropZ,
            gameBoard,
            gridSizeN,
            depthP
        );

        if (maxConsecutiveCount >= winConditionM) {
            const winningPlayerName = (currentPlayerValue === 2) ? "White" : "Black";
            console.log(winningPlayerName, moveIndex + 1);
            gameIsDraw = false;
            break;
        }

        currentPlayerValue = 3 - currentPlayerValue;
    }

    if (gameIsDraw) {
        console.log("Draw");
    }
}
