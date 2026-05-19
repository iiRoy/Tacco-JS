let traversalResult = "";

function getDirectionalDeltas(cellCharacter) {
    let deltaXCoordinate = 0;
    let deltaYCoordinate = 0;
    const RIGHT_DIRECTION_SYMBOL = ">";
    const LEFT_DIRECTION_SYMBOL = "<";
    const UP_DIRECTION_SYMBOL = "^";
    const DOWN_DIRECTION_SYMBOL = "v";

    if (cellCharacter === RIGHT_DIRECTION_SYMBOL) {
        deltaXCoordinate = 1;
    } else if (cellCharacter === LEFT_DIRECTION_SYMBOL) {
        deltaXCoordinate = -1;
    } else if (cellCharacter === UP_DIRECTION_SYMBOL) {
        deltaYCoordinate = -1;
    } else if (cellCharacter === DOWN_DIRECTION_SYMBOL) {
        deltaYCoordinate = 1;
    }
    return { deltaY: deltaYCoordinate, deltaX: deltaXCoordinate };
}

function explorePath(rowCoordinate, colCoordinate, currentGridMap) {
    const VISITED_CELL_MARKER = "#";
    const TERMINAL_EMPTY_CELL_MARKER = ".";

    const currentCellContent = currentGridMap[rowCoordinate][colCoordinate];

    if (currentCellContent === VISITED_CELL_MARKER) {
        traversalResult = "LOOP";
        return;
    }

    if (currentCellContent === TERMINAL_EMPTY_CELL_MARKER) {
        traversalResult = `${colCoordinate} ${rowCoordinate}`;
        return;
    }

    currentGridMap[rowCoordinate][colCoordinate] = VISITED_CELL_MARKER;

    const { deltaY, deltaX } = getDirectionalDeltas(currentCellContent);

    explorePath(rowCoordinate + deltaY, colCoordinate + deltaX, currentGridMap);
}

const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';

const rawInputContent = fileSystemModule.readFileSync(standardInputFilePath, 'utf8');
const inputLinesArray = rawInputContent.trim().split("\n");

const INITIAL_INDEX = 0;
const FIRST_DIMENSION_INDEX = 0;
const SECOND_DIMENSION_INDEX = 1;
const TERMINATION_VALUE = 0;

while (true) {
    const currentDimensionLine = inputLinesArray.shift();
    const gridDimensions = currentDimensionLine.split(" ").map(Number);

    const numRows = gridDimensions[FIRST_DIMENSION_INDEX];
    const numCols = gridDimensions[SECOND_DIMENSION_INDEX];

    if (numRows === TERMINATION_VALUE && numCols === TERMINATION_VALUE) {
        break;
    }

    const currentGrid = [];
    for (let rowIndex = INITIAL_INDEX; rowIndex < numRows; rowIndex++) {
        const rowStringData = inputLinesArray.shift();
        const rowCharacters = rowStringData.split("");
        currentGrid.push(rowCharacters);
    }

    traversalResult = "";

    explorePath(INITIAL_INDEX, INITIAL_INDEX, currentGrid);

    console.log(traversalResult);
}
