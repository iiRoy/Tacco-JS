"use strict";

function countDirectionalLight(gridMap, startRow, startCol, deltaRow, deltaCol) {
    let currentLit = 0;
    let currentRow = startRow + deltaRow;
    let currentCol = startCol + deltaCol;
    const gridHeight = gridMap.length;
    const gridWidth = gridMap[0].length;

    while (currentRow >= 0 && currentRow < gridHeight &&
           currentCol >= 0 && currentCol < gridWidth) {
        const cellContent = gridMap[currentRow][currentCol];
        if (cellContent === '.') {
            currentLit++;
        } else if (cellContent === '#') {
            break;
        }

        currentRow += deltaRow;
        currentCol += deltaCol;
    }
    return currentLit;
}

function calculateIlluminatedCount(gridMap, lampPosition) {
    const [col, row] = lampPosition;

    let totalLitCells = 1;

    totalLitCells += countDirectionalLight(gridMap, row, col, -1, 0);
    totalLitCells += countDirectionalLight(gridMap, row, col, 1, 0);
    totalLitCells += countDirectionalLight(gridMap, row, col, 0, -1);
    totalLitCells += countDirectionalLight(gridMap, row, col, 0, 1);

    return totalLitCells;
}

function ProcessGridData(rawInputString) {
    let gridLines = rawInputString.split('\n');

    gridLines.shift();

    const gridRepresentation = gridLines.map(line => line.split(''));

    let maxIlluminatedCells = 0;
    const gridHeight = gridRepresentation.length;
    const gridWidth = gridRepresentation[0].length;

    for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
        for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
            if (gridRepresentation[currentRow][currentCol] === '.') {
                const cellsLitByLamp = calculateIlluminatedCount(gridRepresentation, [currentCol, currentRow]);
                maxIlluminatedCells = Math.max(maxIlluminatedCells, cellsLitByLamp);
            }
        }
    }

    console.log(maxIlluminatedCells);
}

ProcessGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
