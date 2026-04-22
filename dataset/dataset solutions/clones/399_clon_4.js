const displacementVectors = [
    { rowDelta: 0, colDelta: 1 },
    { rowDelta: 1, colDelta: -1 },
    { rowDelta: 1, colDelta: 0 },
    { rowDelta: 1, colDelta: 1 }
];

const areCoordinatesValid = (rCoord, cCoord, limit) =>
    rCoord >= 0 && cCoord >= 0 && rCoord < limit && cCoord < limit;

const tracePathLength = (
    currentRPosition,
    currentCPosition,
    rowStep,
    colStep,
    gridReference,
    gridSizeValue,
    accumulatedCount = 0
) => {
    if (!areCoordinatesValid(currentRPosition, currentCPosition, gridSizeValue) || gridReference[currentRPosition][currentCPosition] !== 1) {
        return accumulatedCount;
    }
    return tracePathLength(
        currentRPosition + rowStep,
        currentCPosition + colStep,
        rowStep,
        colStep,
        gridReference,
        gridSizeValue,
        accumulatedCount + 1
    );
};

const calculateMaximumSequence = (initialRowPosition, initialColumnPosition, currentGridData, currentGridSize) => {
    let highestSequence = 0;
    for (const vector of displacementVectors) {
        const currentSequenceLength = tracePathLength(
            initialRowPosition,
            initialColumnPosition,
            vector.rowDelta,
            vector.colDelta,
            currentGridData,
            currentGridSize,
            0
        );
        highestSequence = Math.max(highestSequence, currentSequenceLength);
    }
    return highestSequence;
};

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const processedInputLines = rawInputContent.trim().split('\n');

let lineCursor = 0;

const fetchNextGridDetails = () => {
    const dimensionValue = parseInt(processedInputLines[lineCursor++], 10);
    if (dimensionValue === 0) {
        return null;
    }

    const currentMatrix = [];
    for (let rIdx = 0; rIdx < dimensionValue; rIdx++) {
        currentMatrix[rIdx] = processedInputLines[lineCursor++].split('').map(Number);
    }
    return { matrix: currentMatrix, dimension: dimensionValue };
};

let gridInformation;
while ((gridInformation = fetchNextGridDetails()) !== null) {
    const currentMatrixData = gridInformation.matrix;
    const currentMatrixDimension = gridInformation.dimension;
    let globalMaximumLength = 0;

    for (let rowIndex = 0; rowIndex < currentMatrixDimension; rowIndex++) {
        for (let colIndex = 0; colIndex < currentMatrixDimension; colIndex++) {
            if (currentMatrixData[rowIndex][colIndex] === 1) {
                globalMaximumLength = Math.max(
                    globalMaximumLength,
                    calculateMaximumSequence(rowIndex, colIndex, currentMatrixData, currentMatrixDimension)
                );
            }
        }
    }
    console.log(globalMaximumLength);
}