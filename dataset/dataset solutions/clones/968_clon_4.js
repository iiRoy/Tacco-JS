let systemConfiguration = { sourcePath: '/dev/stdin', lineSeparator: '\n' };

const fileSystemUtility = require('fs');

const totalTileCount = 16;
const gridDimension = 4;

let initialPuzzleState;
{
    let allInputLines = fileSystemUtility.readFileSync(systemConfiguration.sourcePath, 'ascii').trim().split(systemConfiguration.lineSeparator);
    let parsedTileValues = [];
    for (let currentLineText of allInputLines) {
        for (let valueString of currentLineText.split(' ')) {
            parsedTileValues.push(Number(valueString));
        }
    }
    initialPuzzleState = parsedTileValues;
}

let targetPuzzleState = [];
for (let k = 1; k < totalTileCount; k++) {
    targetPuzzleState.push(k);
}
targetPuzzleState.push(0);

let currentPuzzleLayout = [...initialPuzzleState];

const NO_PRIOR_ACTION = -1;
const MOVE_UPWARD = 0;
const MOVE_DOWNWARD = 1;
const MOVE_LEFTWARD = 2;
const MOVE_RIGHTWARD = 3;

const INVERSE_DIRECTION = {
    [MOVE_UPWARD]: MOVE_DOWNWARD,
    [MOVE_DOWNWARD]: MOVE_UPWARD,
    [MOVE_LEFTWARD]: MOVE_RIGHTWARD,
    [MOVE_RIGHTWARD]: MOVE_LEFTWARD
};

function compareArrangements(firstArr, secondArr) {
    if (firstArr.length !== secondArr.length) return false;
    for (let k = 0; k < firstArr.length; k++) {
        if (firstArr[k] !== secondArr[k]) return false;
    }
    return true;
}

function findSolutionRecursive(currentLayout, currentDepth, maximumDepth, emptyTilePosition, lastMoveDirection) {
    if (currentDepth === maximumDepth) {
        return compareArrangements(currentLayout, targetPuzzleState);
    }

    let emptyTileRow = Math.floor(emptyTilePosition / gridDimension);
    let emptyTileColumn = emptyTilePosition % gridDimension;

    const possibleActionVectors = [
        [MOVE_UPWARD, -1, 0],
        [MOVE_DOWNWARD, 1, 0],
        [MOVE_LEFTWARD, 0, -1],
        [MOVE_RIGHTWARD, 0, 1]
    ];

    for (const [actionDirection, rowChange, colChange] of possibleActionVectors) {
        if (actionDirection === INVERSE_DIRECTION[lastMoveDirection]) {
            continue;
        }

        let nextEmptyTileRow = emptyTileRow + rowChange;
        let nextEmptyTileColumn = emptyTileColumn + colChange;

        if (nextEmptyTileRow >= 0 && nextEmptyTileRow < gridDimension &&
            nextEmptyTileColumn >= 0 && nextEmptyTileColumn < gridDimension) {

            let adjacentTileIndex = nextEmptyTileRow * gridDimension + nextEmptyTileColumn;
            let nextLayoutConfiguration = [...currentLayout];

            let tileToShiftValue = nextLayoutConfiguration[adjacentTileIndex];
            nextLayoutConfiguration[emptyTilePosition] = tileToShiftValue;
            nextLayoutConfiguration[adjacentTileIndex] = 0;

            if (findSolutionRecursive(nextLayoutConfiguration, currentDepth + 1, maximumDepth, adjacentTileIndex, actionDirection)) {
                return true;
            }
        }
    }

    return false;
}

let finalMoveCount = 0;
let initialEmptySpaceIndex = initialPuzzleState.indexOf(0);

for (let currentMaximumDepth = 0; currentMaximumDepth <= 45; currentMaximumDepth++) {
    if (findSolutionRecursive(currentPuzzleLayout, 0, currentMaximumDepth, initialEmptySpaceIndex, NO_PRIOR_ACTION)) {
        finalMoveCount = currentMaximumDepth;
        break;
    }
}

console.log(finalMoveCount);