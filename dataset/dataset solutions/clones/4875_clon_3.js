'use strict'

let gridArea = [];

function parseDimensions(dimensionParts) {
    const parsedWidth = Number(dimensionParts[0]);
    const parsedHeight = Number(dimensionParts[1]);
    const parsedOperations = Number(dimensionParts[2]);
    return { gridWidth: parsedWidth, gridHeight: parsedHeight, operationCount: parsedOperations };
}

function initializeGrid(width, height) {
    const newGrid = [];
    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        newGrid.push(Array(width).fill(0));
    }
    return newGrid;
}

function determineMarkingBounds(operationType, valX, valY, currentGridWidth, currentGridHeight) {
    let markStartX, markEndX, markStartY, markEndY;

    const xCoord = Number(valX);
    const yCoord = Number(valY);

    switch (operationType) {
        case 1: // x < x_i
            markStartX = 0;
            markEndX = xCoord;
            markStartY = 0;
            markEndY = currentGridHeight;
            break;
        case 2: // x > x_i
            markStartX = xCoord;
            markEndX = currentGridWidth;
            markStartY = 0;
            markEndY = currentGridHeight;
            break;
        case 3: // y < y_i
            markStartX = 0;
            markEndX = currentGridWidth;
            markStartY = 0;
            markEndY = yCoord;
            break;
        case 4: // y > y_i
            markStartX = 0;
            markEndX = currentGridWidth;
            markStartY = yCoord;
            markEndY = currentGridHeight;
            break;
        default:
            // Should not happen based on problem constraints
            markStartX = 0; markEndX = 0; markStartY = 0; markEndY = 0;
            break;
    }
    return { markStartX, markEndX, markStartY, markEndY };
}

function processGridOperations(rawInputString) {
    const allInputLines = rawInputString.split('\n');
    const processedLines = allInputLines.map(line => line.split(' '));

    const firstLineParts = processedLines.shift();
    const { gridWidth, gridHeight, operationCount } = parseDimensions(firstLineParts);

    gridArea = initializeGrid(gridWidth, gridHeight);

    for (let opIndex = 0; opIndex < operationCount; opIndex++) {
        const currentOperation = processedLines[opIndex];
        const opX = currentOperation[0];
        const opY = currentOperation[1];
        const opType = Number(currentOperation[2]);

        const { markStartX, markEndX, markStartY, markEndY } = determineMarkingBounds(
            opType, opX, opY, gridWidth, gridHeight
        );
        applyMarking(markStartX, markEndX, markStartY, markEndY);
    }

    console.log(gridArea);

    let zeroCellCount = 0;
    for (const gridRow of gridArea) {
        zeroCellCount += gridRow.filter(cellVal => cellVal === 0).length;
    }

    console.log(zeroCellCount);
}

function applyMarking(markStartX, markEndX, markStartY, markEndY) {
    for (let currentRow = markStartY; currentRow < markEndY; currentRow++) {
        for (let currentCol = markStartX; currentCol < markEndX; currentCol++) {
            gridArea[currentRow][currentCol] += 1;
        }
    }
}

processGridOperations(require('fs').readFileSync('/dev/stdin', 'utf8'));
