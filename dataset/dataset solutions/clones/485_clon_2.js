function navigateGrid() {
    var exploredLocations = new Map();
    var finalPathLength = "NO_PATH_FOUND";
    var pendingCells = [[0, 0, 0], [1, 0, 0]]; // Represents [row, column, current_distance]

    while (true) {
        if (pendingCells.length === 0)
            break;

        var currentPositionDetails = pendingCells.shift();
        var rowCoord = currentPositionDetails[0];
        var colCoord = currentPositionDetails[1];

        var locationKey = `${rowCoord},${colCoord}`;
        if (exploredLocations.has(locationKey)) {
            continue;
        } else {
            exploredLocations.set(locationKey, true);
        }

        var distanceCovered = currentPositionDetails[2];

        // Determine if target column is reached
        if (colCoord === dimensionSize - 1 && gridStructure[rowCoord][colCoord] !== 2) {
            finalPathLength = distanceCovered;
            break;
        }

        var cellDesignation = gridStructure[rowCoord][colCoord];

        if (cellDesignation === 1) {
            var reachedGoal = false;
            while (true) {
                colCoord++;
                if (colCoord === dimensionSize - 1) {
                    reachedGoal = true;
                    break;
                }
                if (gridStructure[rowCoord][colCoord] !== 1) {
                    colCoord--;
                    break;
                }
            }
            if (reachedGoal) {
                continue;
            }
        } else if (cellDesignation === 2) {
            while (true) {
                colCoord--;
                if (gridStructure[rowCoord][colCoord] !== 2)
                    break;
            }
        }

        // Enqueue next possible movements
        for (var loopIndex = 0; loopIndex <= 2; loopIndex++) {
            pendingCells.push([1 - rowCoord, colCoord + loopIndex, distanceCovered + 1]);
        }
    }
    return finalPathLength;
}

var rawFileData = require('node:fs').readFileSync('/dev/stdin', 'utf8');
var lineFragments = rawFileData.trim().split('\n');

var dimensionSize;
var gridStructure;

while (true) {
    dimensionSize = parseInt(lineFragments.shift());
    if (dimensionSize === 0)
        break;

    gridStructure = [];
    gridStructure[0] = lineFragments.shift().split(' ').map(Number);
    gridStructure[1] = lineFragments.shift().split(' ').map(Number);

    console.log(navigateGrid());
}