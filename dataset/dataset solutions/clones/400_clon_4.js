const processInputData = () => {
    const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    return rawFileContent.trim().split('\n');
};

const inputLinesBuffer = processInputData();
let currentLinePointer = 0;

const retrieveGridData = (dimensionValue) => {
    const gridRows = [];
    for (let k = 0; k < dimensionValue; k++) {
        gridRows.push(inputLinesBuffer[currentLinePointer++].split('').map(Number));
    }
    return gridRows;
};

const computeMaxSequenceLength = (gridStructure, gridDimension, startingRow, startingCol) => {
    const directionalOffsets = [
        { rowChange: 0, colChange: 1 },  // East
        { rowChange: 1, colChange: -1 }, // South-West
        { rowChange: 1, colChange: 0 },  // South
        { rowChange: 1, colChange: 1 }   // South-East
    ];

    const countConsecutiveOnes = (r, c, rInc, cInc) => {
        const isWithinBounds = r >= 0 && c >= 0 && r < gridDimension && c < gridDimension;
        if (!isWithinBounds || gridStructure[r][c] !== 1) {
            return 0;
        }
        return 1 + countConsecutiveOnes(r + rInc, c + cInc, rInc, cInc);
    };

    return directionalOffsets.reduce((maximumLength, vector) => {
        const currentDirectionLength = countConsecutiveOnes(startingRow, startingCol, vector.rowChange, vector.colChange);
        return Math.max(maximumLength, currentDirectionLength);
    }, 0);
};

while (currentLinePointer < inputLinesBuffer.length) {
    const currentGridDimension = Number(inputLinesBuffer[currentLinePointer++]);
    if (currentGridDimension === 0) {
        break;
    }

    const currentGridMatrix = retrieveGridData(currentGridDimension);
    let highestSequenceInMatrix = 0;

    const allCellCoordinates = Array.from({ length: currentGridDimension }, (_, r) =>
        Array.from({ length: currentGridDimension }, (_, c) => ({ r, c }))
    ).flat();

    highestSequenceInMatrix = allCellCoordinates.reduce((currentMaxOverall, { r, c }) => {
        if (currentGridMatrix[r][c] === 1) {
            const cellSpecificMax = computeMaxSequenceLength(currentGridMatrix, currentGridDimension, r, c);
            return Math.max(currentMaxOverall, cellSpecificMax);
        }
        return currentMaxOverall;
    }, 0);

    console.log(highestSequenceInMatrix);
}
