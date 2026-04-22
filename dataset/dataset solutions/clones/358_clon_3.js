let gameGridDimensions = [0, 0];
let currentProcessingGrid = [];

const isWithinBounds = (rowCoord, colCoord) => {
    return rowCoord >= 0 && rowCoord < gameGridDimensions[0] &&
           colCoord >= 0 && colCoord < gameGridDimensions[1];
};

function exploreConnectedRegion(startRow, startCol, targetCharValue) {
    const rowMovementOffsets = [-1, 1, 0, 0]; // Up, Down, Left, Right
    const colMovementOffsets = [0, 0, -1, 1];
    const numDirections = rowMovementOffsets.length;

    for (let directionIdx = 0; directionIdx < numDirections; directionIdx++) {
        const neighborRow = startRow + rowMovementOffsets[directionIdx];
        const neighborCol = startCol + colMovementOffsets[directionIdx];

        if (!isWithinBounds(neighborRow, neighborCol)) {
            continue;
        }

        if (currentProcessingGrid[neighborRow][neighborCol] === targetCharValue) {
            currentProcessingGrid[neighborRow][neighborCol] = '_';
            exploreConnectedRegion(neighborRow, neighborCol, targetCharValue);
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");

const parseNextTestCase = () => {
    if (inputLines.length === 0) {
        return null;
    }

    const dimensionLine = inputLines.shift();
    if (!dimensionLine) {
        return null;
    }
    const dimensions = dimensionLine.split(" ").map(Number);

    if (dimensions[0] === 0 && dimensions[1] === 0) {
        return null;
    }

    gameGridDimensions[0] = dimensions[0];
    gameGridDimensions[1] = dimensions[1];

    const gridData = [];
    if (inputLines.length < gameGridDimensions[0]) {
        console.error("Error: Not enough grid data lines provided for dimensions:", gameGridDimensions);
        inputLines = []; // Clear remaining lines to prevent further errors
        return null;
    }

    for (let rowIdx = 0; rowIdx < gameGridDimensions[0]; rowIdx++) {
        const gridRowCharacters = inputLines.shift();
        if (!gridRowCharacters || gridRowCharacters.length !== gameGridDimensions[1]) {
            console.error(`Error: Malformed row data at index ${rowIdx}. Expected ${gameGridDimensions[1]} chars, got ${gridRowCharacters ? gridRowCharacters.length : 'none'}.`);
            inputLines = []; // Clear remaining lines
            return null;
        }
        gridData.push(gridRowCharacters.split(""));
    }
    return gridData;
};

const islandStartMarkers = new Set(['@', '#', '*']);
const initialProcessMarker = 'P';

let currentGridData = null;
while ((currentGridData = parseNextTestCase()) !== null) {
    currentProcessingGrid = currentGridData;

    let detectedIslandCount = 0;

    for (let rIdx = 0; rIdx < gameGridDimensions[0]; rIdx++) {
        for (let cIdx = 0; cIdx < gameGridDimensions[1]; cIdx++) {
            const cellContent = currentProcessingGrid[rIdx][cIdx];

            if (islandStartMarkers.has(cellContent)) {
                detectedIslandCount++;
                currentProcessingGrid[rIdx][cIdx] = initialProcessMarker;
                exploreConnectedRegion(rIdx, cIdx, cellContent);
            }
        }
    }
    console.log(detectedIslandCount);
}