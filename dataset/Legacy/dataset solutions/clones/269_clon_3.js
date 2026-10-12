let currentNumTracker;
let maxNumberLimit;
let currentGridDimension;
let outputGrid;

function normalizeCoordinate(coordValue, dimension) {
    let normalized = coordValue % dimension;
    if (normalized < 0) {
        normalized += dimension;
    }
    return normalized;
}

function fillGrid(currentRow, currentCol) {
    if (currentNumTracker === maxNumberLimit) {
        return;
    }

    const wrappedRow = normalizeCoordinate(currentRow, currentGridDimension);
    const wrappedCol = normalizeCoordinate(currentCol, currentGridDimension);

    if (outputGrid[wrappedRow][wrappedCol] !== -1) {
        fillGrid(wrappedRow + 1, wrappedCol - 1);
    } else {
        const formattedNumber = String(currentNumTracker).padStart(4, ' ');
        outputGrid[wrappedRow][wrappedCol] = formattedNumber;
        currentNumTracker++;
        fillGrid(wrappedRow + 1, wrappedCol + 1);
    }
}

const fileSystem = require('fs');
const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

const gridDimensionList = rawInputContent.trim().split('\n').map(Number);

for (let listIndex = 0; listIndex < gridDimensionList.length; listIndex++) {
    const currentDimension = gridDimensionList[listIndex];

    if (currentDimension === 0) {
        break;
    }

    currentGridDimension = currentDimension;
    maxNumberLimit = currentDimension * currentDimension + 1;
    currentNumTracker = 2;

    outputGrid = Array.from({ length: currentDimension }, () => Array(currentDimension).fill(-1));

    const initialColumnPosition = Math.floor(currentDimension / 2);
    const initialRowPosition = initialColumnPosition + 1;

    outputGrid[initialRowPosition][initialColumnPosition] = String(1).padStart(4, ' ');

    fillGrid(initialRowPosition + 1, initialColumnPosition + 1);

    const formattedOutput = outputGrid.map(rowArray => rowArray.join('')).join('\n');
    console.log(formattedOutput);
}
