let minimumObstacleCount = 1000;
let gridState;

function processInputAndSolve(rawData) {
    const lines = rawData.trim().split("\n");

    const dimensionStrings = lines[0].split(" ");
    const numRows = parseInt(dimensionStrings[0], 10);
    const numCols = parseInt(dimensionStrings[1], 10);

    gridState = lines.slice(1).map(rowString => rowString.split(''));

    const startPosition = [0, 0];
    const targetPosition = [numRows - 1, numCols - 1];

    explorePaths(startPosition, targetPosition, 0);

    console.log(minimumObstacleCount);
}

function explorePaths(currentPosition, targetPosition, currentObstacleCount) {
    const [currentRow, currentCol] = currentPosition;
    const [targetRow, targetCol] = targetPosition;

    const cellContent = gridState[currentRow][currentCol];

    let pathObstacleCount = currentObstacleCount;
    if (cellContent !== ".") {
        pathObstacleCount++;
    }

    if (pathObstacleCount >= minimumObstacleCount) {
        return;
    }

    if (currentRow === targetRow && currentCol === targetCol) {
        if (pathObstacleCount < minimumObstacleCount) {
            minimumObstacleCount = pathObstacleCount;
        }
        return;
    }

    const canMoveRight = currentCol < targetCol;
    const canMoveDown = currentRow < targetRow;

    if (currentRow === targetRow) {
        if (canMoveRight) {
            explorePaths([currentRow, currentCol + 1], targetPosition, pathObstacleCount);
        }
    } else if (currentCol === targetCol) {
        if (canMoveDown) {
            explorePaths([currentRow + 1, currentCol], targetPosition, pathObstacleCount);
        }
    } else {
        if (canMoveRight) {
            explorePaths([currentRow, currentCol + 1], targetPosition, pathObstacleCount);
        }
        if (canMoveDown) {
            explorePaths([currentRow + 1, currentCol], targetPosition, pathObstacleCount);
        }
    }
}

processInputAndSolve(require("fs").readFileSync("/dev/stdin", "utf8"));
