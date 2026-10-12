let gridDimension;
let maxValue;
let gridData;
let currentValue;

const getWrappedCoordinate = (coordinate, dimension) => {
    let wrapped = coordinate % dimension;
    if (wrapped < 0) {
        wrapped += dimension;
    }
    return wrapped;
};

function fillGrid(logicalRow, logicalCol) {
    if (currentValue === maxValue) {
        return;
    }

    const actualRow = getWrappedCoordinate(logicalRow, gridDimension);
    const actualCol = getWrappedCoordinate(logicalCol, gridDimension);

    if (gridData[actualRow][actualCol] !== -1) {
        fillGrid(logicalRow + 1, logicalCol - 1);
    } else {
        gridData[actualRow][actualCol] = currentValue;
        currentValue++;
        fillGrid(logicalRow + 1, logicalCol + 1);
    }
}

const initializeGridMatrix = (dim, defaultValue = -1) => {
    const newGrid = Array.from({ length: dim }, () =>
        Array.from({ length: dim }, () => defaultValue)
    );
    return newGrid;
};

const formatGridForOutput = (grid) => {
    return grid.map(row => row.join(" ")).join("\n");
};

const processAllInputs = (rawInputString) => {
    const numericInputs = rawInputString.trim().split("\n").map(Number);

    for (let inputIdx = 0; inputIdx < numericInputs.length; inputIdx++) {
        gridDimension = numericInputs[inputIdx];

        if (gridDimension === 0) {
            break;
        }

        maxValue = gridDimension * gridDimension + 1;

        gridData = initializeGridMatrix(gridDimension);

        const initialColPosition = Math.floor(gridDimension / 2);
        const initialRowPosition = initialColPosition + 1;

        gridData[initialRowPosition][initialColPosition] = 1;
        currentValue = 2;

        fillGrid(initialRowPosition + 1, initialColPosition + 1);

        console.log(formatGridForOutput(gridData));
    }
};

const fileInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
processAllInputs(fileInputContent);
