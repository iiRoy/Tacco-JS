function getNextInteger(inputArray) {
    return parseInt(inputArray.shift());
}

function getNextStringValue(inputArray) {
    return inputArray.shift();
}

const MOVE_LEFT_CHAR = "L";
const MOVE_RIGHT_CHAR = "R";
const MOVE_UP_CHAR = "U";
const MOVE_DOWN_CHAR = "D";

function applyPlayerMovement(moveChar, currentBoundaryState) {
    switch (moveChar) {
        case MOVE_LEFT_CHAR:
            currentBoundaryState.leftEdge--;
            break;
        case MOVE_RIGHT_CHAR:
            currentBoundaryState.rightEdge++;
            break;
        case MOVE_UP_CHAR:
            currentBoundaryState.topEdge--;
            break;
        case MOVE_DOWN_CHAR:
            currentBoundaryState.bottomEdge++;
            break;
    }
}

function applyEnemyMovement(moveChar, currentBoundaryState, gridDimensions) {
    const { width, height } = gridDimensions;
    switch (moveChar) {
        case MOVE_LEFT_CHAR:
            currentBoundaryState.rightEdge = Math.max(1, currentBoundaryState.rightEdge - 1);
            break;
        case MOVE_RIGHT_CHAR:
            currentBoundaryState.leftEdge = Math.min(width, currentBoundaryState.leftEdge + 1);
            break;
        case MOVE_UP_CHAR:
            currentBoundaryState.bottomEdge = Math.max(1, currentBoundaryState.bottomEdge - 1);
            break;
        case MOVE_DOWN_CHAR:
            currentBoundaryState.topEdge = Math.min(height, currentBoundaryState.topEdge + 1);
            break;
    }
}

function isPlayerOutOfBounds(currentBoundaryState, gridDimensions) {
    const { width, height } = gridDimensions;
    return currentBoundaryState.leftEdge <= 0 ||
           currentBoundaryState.rightEdge > width ||
           currentBoundaryState.topEdge <= 0 ||
           currentBoundaryState.bottomEdge > height;
}

function processGridNavigation(inputDataArray) {
    const gridHeight = getNextInteger(inputDataArray);
    const gridWidth = getNextInteger(inputDataArray);
    const totalMoves = getNextInteger(inputDataArray);
    const startRow = getNextInteger(inputDataArray);
    const startCol = getNextInteger(inputDataArray);
    const playerMoveSequence = getNextStringValue(inputDataArray);
    const enemyMoveSequence = getNextStringValue(inputDataArray);

    const gridDimensions = { width: gridWidth, height: gridHeight };

    const currentBoundaryState = {
        leftEdge: startCol,
        rightEdge: startCol,
        topEdge: startRow,
        bottomEdge: startRow
    };

    for (let moveIteration = 0; moveIteration < totalMoves; moveIteration++) {
        const currentPlayerMove = playerMoveSequence.charAt(moveIteration);
        const currentEnemyMove = enemyMoveSequence.charAt(moveIteration);

        applyPlayerMovement(currentPlayerMove, currentBoundaryState);

        if (isPlayerOutOfBounds(currentBoundaryState, gridDimensions)) {
            console.log("NO");
            return;
        }

        applyEnemyMovement(currentEnemyMove, currentBoundaryState, gridDimensions);
    }

    console.log("YES");
}

processGridNavigation(require("fs").readFileSync("/dev/stdin", "utf8").trim().split(/\n|\s/));
