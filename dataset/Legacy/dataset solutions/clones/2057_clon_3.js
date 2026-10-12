var minimumCost = 1000;
var gridState;

function isObstacle(cellValue) {
    return cellValue === "#";
}

function processInput(rawData) {
    var trimmedInput = rawData.trim();
    var inputLines = trimmedInput.split("\n");

    var dimensionStrings = inputLines[0].split(" ");
    var totalRows = parseInt(dimensionStrings[0], 10);
    var totalCols = parseInt(dimensionStrings[1], 10);

    var gridDataLines = inputLines.slice(1, inputLines.length);
    gridState = gridDataLines.map(function(rowString) {
        return rowString.split('');
    });

    var startingCoordinates = [0, 0];
    var endingCoordinates = [totalRows - 1, totalCols - 1];
    var initialPathCost = 0;

    explorePath(startingCoordinates, endingCoordinates, initialPathCost);

    console.log(minimumCost);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function explorePath(currentCoordinates, finalCoordinates, currentPathCost) {
    var currentRow = currentCoordinates[0];
    var currentCol = currentCoordinates[1];

    var cellContent = gridState[currentRow][currentCol];
    if (isObstacle(cellContent)) {
        currentPathCost++;
    }

    if (currentPathCost >= minimumCost) {
        return;
    }

    var isAtTargetRow = currentRow === finalCoordinates[0];
    var isAtTargetCol = currentCol === finalCoordinates[1];

    if (isAtTargetRow && isAtTargetCol) {
        if (currentPathCost < minimumCost) {
            minimumCost = currentPathCost;
        }
        return;
    }

    if (isAtTargetRow) {
        explorePath([currentRow, currentCol + 1], finalCoordinates, currentPathCost);
    } else if (isAtTargetCol) {
        explorePath([currentRow + 1, currentCol], finalCoordinates, currentPathCost);
    } else {
        var nextRightCol = currentCol + 1;
        var nextDownRow = currentRow + 1;

        var rightCellContent = gridState[currentRow][nextRightCol];
        var downCellContent = gridState[nextDownRow][currentCol];

        var isRightCellObstacle = isObstacle(rightCellContent);
        var isDownCellObstacle = isObstacle(downCellContent);

        if (isRightCellObstacle && !isDownCellObstacle) {
            explorePath([nextDownRow, currentCol], finalCoordinates, currentPathCost);
        } else if (!isRightCellObstacle && isDownCellObstacle) {
            explorePath([currentRow, nextRightCol], finalCoordinates, currentPathCost);
        } else {
            explorePath([currentRow, nextRightCol], finalCoordinates, currentPathCost);
            explorePath([nextDownRow, currentCol], finalCoordinates, currentPathCost);
        }
    }
}
