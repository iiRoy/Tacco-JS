const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

const parseGridDimensions = (lineContent) => {
    const parts = lineContent.split(' ');
    return {
        height: Number(parts[0]),
        width: Number(parts[1]),
        kValue: Number(parts[2])
    };
};

const gridSpecs = parseGridDimensions(inputLines.shift());
const gridHeight = gridSpecs.height;
const gridWidth = gridSpecs.width;
const unusedK = gridSpecs.kValue;

const outputMatrix = [];
let currentSegmentIdentifier = 1;
let previousFilledRow = null;

const locateHashColumns = (rowString, totalWidth) => {
    const hashPositions = [];
    for (let colIdx = 0; colIdx < totalWidth; colIdx++) {
        if (rowString[colIdx] === '#') {
            hashPositions.push(colIdx);
        }
    }
    return hashPositions;
};

for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    const currentRowData = inputLines[rowIdx];
    const hashColumnPositions = locateHashColumns(currentRowData, gridWidth);
    outputMatrix[rowIdx] = [];

    if (hashColumnPositions.length === 0) {
        outputMatrix[rowIdx] = previousFilledRow ? previousFilledRow : 'empty_marker';
    } else {
        let fillColumnPointer = 0;
        while (hashColumnPositions.length > 0) {
            const nextHashColumn = hashColumnPositions.shift();
            for (let col = fillColumnPointer; col <= nextHashColumn; col++) {
                outputMatrix[rowIdx][col] = currentSegmentIdentifier;
            }
            fillColumnPointer = nextHashColumn + 1;
            currentSegmentIdentifier++;
        }

        while (fillColumnPointer < gridWidth) {
            outputMatrix[rowIdx][fillColumnPointer] = currentSegmentIdentifier - 1;
            fillColumnPointer++;
        }
        previousFilledRow = outputMatrix[rowIdx];
    }
}

if (outputMatrix[0] === 'empty_marker') {
    let firstNonEmptyRowIndex = 0;
    while (firstNonEmptyRowIndex < gridHeight && outputMatrix[firstNonEmptyRowIndex] === 'empty_marker') {
        firstNonEmptyRowIndex++;
    }

    if (firstNonEmptyRowIndex < gridHeight) {
        const contentToPropagate = outputMatrix[firstNonEmptyRowIndex];
        for (let i = 0; i < firstNonEmptyRowIndex; i++) {
            outputMatrix[i] = contentToPropagate;
        }
    }
}

console.log(outputMatrix.map(rowArray => rowArray.join(" ")).join('\n'));
