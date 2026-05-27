function calculateMaxSequenceLength(initialRow, initialCol, gridData, gridSize) {
    const directions = [
        [0, 1],  // Right: (row_offset, col_offset)
        [1, -1], // Down-Left
        [1, 0],  // Down
        [1, 1]   // Down-Right
    ];

    let longestSequenceFound = 1;

    for (let dirIdx = 0; dirIdx < directions.length; dirIdx++) {
        let currentSequenceCount = 0;
        const [rowOffset, colOffset] = directions[dirIdx];

        for (let stepCount = 0; stepCount <= gridSize; stepCount++) {
            const evaluatedRow = initialRow + (rowOffset * stepCount);
            const evaluatedCol = initialCol + (colOffset * stepCount);

            if (evaluatedRow < 0 || evaluatedCol < 0 || evaluatedRow >= gridSize || evaluatedCol >= gridSize) {
                break;
            }
            if (gridData[evaluatedRow][evaluatedCol] !== 1) {
                break;
            }
            currentSequenceCount++;
        }
        longestSequenceFound = Math.max(longestSequenceFound, currentSequenceCount);
    }
    return longestSequenceFound;
}

function readGridData(linesArray, dimension) {
    const grid = [];
    for (let r = 0; r < dimension; r++) {
        const lineString = linesArray.shift();
        const charactersInRow = lineString.split("");
        grid[r] = charactersInRow.map(char => parseInt(char, 10));
    }
    return grid;
}

const fileSystem = require('fs');
const rawInputString = fileSystem.readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputString.trim().split("\n");

const TERMINATION_GRID_SIZE = 0;

let overallMaximumLength = 0;

while (true) {
    let currentGridDimension = parseInt(processedInputLines.shift(), 10);

    if (currentGridDimension === TERMINATION_GRID_SIZE) {
        break;
    }

    const activeGridData = readGridData(processedInputLines, currentGridDimension);

    overallMaximumLength = 0;

    for (let gridRowIterator = 0; gridRowIterator < currentGridDimension; gridRowIterator++) {
        for (let gridColIterator = 0; gridColIterator < currentGridDimension; gridColIterator++) {
            if (activeGridData[gridRowIterator][gridColIterator] === 1) {
                const sequenceResult = calculateMaxSequenceLength(
                    gridRowIterator,
                    gridColIterator,
                    activeGridData,
                    currentGridDimension
                );
                overallMaximumLength = Math.max(overallMaximumLength, sequenceResult);
            }
        }
    }
    console.log(overallMaximumLength);
}
