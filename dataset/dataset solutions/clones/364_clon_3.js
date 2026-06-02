var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
var inputLines = (rawData.trim()).split("\n");

var deltaY = [-1, 0, 0, 1];
var deltaX = [0, -1, 1, 0];

const GRID_ROWS = 2;
const GRID_COLS = 4;
const EMPTY_TILE_VALUE = 0;
const TARGET_STATE_STRING = "01234567";

// Helper function to convert a 1D array state to a 2D grid representation
function createGridFromState(stateArray) {
    return [
        stateArray.slice(0, GRID_COLS),
        stateArray.slice(GRID_COLS, GRID_ROWS * GRID_COLS)
    ];
}

// Helper function to convert a 2D grid back to a 1D array state
function flattenGridToState(grid) {
    return grid[0].concat(grid[1]);
}

// Helper function to check if coordinates are within grid bounds
function isValidCoordinate(row, col) {
    return row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS;
}

inputLines.forEach(function(lineContent, lineIndex) {
    var initialStateNums = lineContent.split(" ").map(Number);
    var visitedStates = {}; // Using an object as a hash set for visited states
    var bfsQueue = [[initialStateNums, 0]]; // Queue stores [stateArray, moveCount]

    while (bfsQueue.length > 0) {
        var currentEntry = bfsQueue.shift();
        var currentState = currentEntry[0];
        var moveCount = currentEntry[1];

        var currentStateString = currentState.join("");
        if (currentStateString === TARGET_STATE_STRING) {
            console.log(moveCount);
            break; // Solution found for this puzzle, move to next input line
        }

        var zeroIndex = currentState.indexOf(EMPTY_TILE_VALUE);
        var zeroRow = Math.floor(zeroIndex / GRID_COLS);
        var zeroCol = zeroIndex % GRID_COLS;

        var gridRepresentation = createGridFromState(currentState);

        for (var directionIdx = 0; directionIdx < 4; directionIdx++) {
            var newZeroRow = zeroRow + deltaY[directionIdx];
            var newZeroCol = zeroCol + deltaX[directionIdx];

            if (!isValidCoordinate(newZeroRow, newZeroCol)) {
                continue; // Skip if the new position is out of bounds
            }

            // Create a deep copy of the grid to perform the swap
            let nextGrid = gridRepresentation.map(row => [...row]);

            // Perform the swap
            var swappedTileValue = nextGrid[newZeroRow][newZeroCol];
            nextGrid[zeroRow][zeroCol] = swappedTileValue;
            nextGrid[newZeroRow][newZeroCol] = EMPTY_TILE_VALUE;

            var nextStateArray = flattenGridToState(nextGrid);
            var nextStateString = nextStateArray.join("");

            // Check if this state has been visited
            if (!visitedStates[nextStateString]) {
                visitedStates[nextStateString] = true; // Mark as visited
                bfsQueue.push([nextStateArray, moveCount + 1]); // Add to queue
            }
        }
    }
});
