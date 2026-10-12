const fileSystem = require('fs');
const rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawData.trim().split("\n");

function calculateMaxConsecutive(startY, startX, currentGridSize, gridData) {
    const deltaY = [0, 1, 1, 1];
    const deltaX = [1, -1, 0, 1];
    let currentMax = 0;
    const targetValue = 1;

    const isWithinBounds = (checkY, checkX, size) => {
        return checkY >= 0 && checkX >= 0 && checkY < size && checkX < size;
    };

    for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
        let consecutiveCount = 0;
        for (let stepOffset = 0; stepOffset <= currentGridSize; stepOffset++) {
            const currentY = startY + (deltaY[directionIndex] * stepOffset);
            const currentX = startX + (deltaX[directionIndex] * stepOffset);

            if (!isWithinBounds(currentY, currentX, currentGridSize)) {
                break;
            }

            if (gridData[currentY][currentX] !== targetValue) {
                break;
            }
            consecutiveCount++;
        }
        currentMax = Math.max(currentMax, consecutiveCount);
    }
    return currentMax;
}

function parseGrid(size, lines) {
    const parsedGrid = [];
    for (let rowIdx = 0; rowIdx < size; rowIdx++) {
        parsedGrid[rowIdx] = lines.shift().split("").map(Number);
    }
    return parsedGrid;
}

function findOverallMaxConsecutive(gridSize, gridData, counterFunction) {
    let overallMax = 0;
    const searchTarget = 1;
    for (let rowIdx = 0; rowIdx < gridSize; rowIdx++) {
        for (let colIdx = 0; colIdx < gridSize; colIdx++) {
            if (gridData[rowIdx][colIdx] === searchTarget) {
                overallMax = Math.max(overallMax, counterFunction(rowIdx, colIdx, gridSize, gridData));
            }
        }
    }
    return overallMax;
}

while (true) {
    const currentGridSize = Number(inputLines.shift());
    if (currentGridSize === 0) {
        break;
    }

    const gridData = parseGrid(currentGridSize, inputLines);

    const overallResult = findOverallMaxConsecutive(currentGridSize, gridData, calculateMaxConsecutive);

    console.log(overallResult);
}
