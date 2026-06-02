const fileRawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const puzzleInputs = fileRawData.trim().split("\n");

const deltaY = [-1, 0, 0, 1];
const deltaX = [0, -1, 1, 0];

function convertToGrid(flatArray) {
    const rowOne = flatArray.slice(0, 4);
    const rowTwo = flatArray.slice(4, 8);
    return [rowOne, rowTwo];
}

function convertToFlatArray(gridRepresentation) {
    return gridRepresentation[0].concat(gridRepresentation[1]);
}

puzzleInputs.forEach(function(puzzleLine) {
    const initialState = puzzleLine.split(" ").map(Number);
    const visitedStates = {};
    const queue = [[initialState, 0]];
    const targetStateKey = "01234567";

    while (queue.length > 0) {
        const currentEntry = queue.shift();
        const currentState = currentEntry[0];
        let currentMoveCount = currentEntry[1];

        const currentStateKey = currentState.join("");

        if (currentStateKey === targetStateKey) {
            console.log(currentMoveCount);
            break;
        }

        const zeroIndex = currentState.indexOf(0);
        const zeroRow = Math.floor(zeroIndex / 4);
        const zeroCol = zeroIndex % 4;

        const gridRepresentation = convertToGrid(currentState);

        for (let directionIdx = 0; directionIdx < 4; directionIdx++) {
            const newZeroRow = zeroRow + deltaY[directionIdx];
            const newZeroCol = zeroCol + deltaX[directionIdx];

            const isRowValid = newZeroRow >= 0 && newZeroRow < 2;
            const isColValid = newZeroCol >= 0 && newZeroCol < 4;

            if (!isRowValid || !isColValid) {
                continue;
            }

            const swappedTileValue = gridRepresentation[newZeroRow][newZeroCol];
            gridRepresentation[zeroRow][zeroCol] = swappedTileValue;
            gridRepresentation[newZeroRow][newZeroCol] = 0;

            const nextStateArray = convertToFlatArray(gridRepresentation);
            const nextStateKey = nextStateArray.join("");

            if (!visitedStates.hasOwnProperty(nextStateKey)) {
                visitedStates[nextStateKey] = true;
                queue.push([nextStateArray, currentMoveCount++]);
            }

            gridRepresentation[newZeroRow][newZeroCol] = swappedTileValue;
            gridRepresentation[zeroRow][zeroCol] = 0;
        }
    }
});
