const fileSystem = require('fs');

let rawData = fileSystem.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawData.trim().split("\n");

function calculateSquareExtent(rowCoord, colCoord, currentGrid, gridDimension) {
    if (rowCoord < 0 || colCoord < 0 || rowCoord >= gridDimension || colCoord >= gridDimension) {
        return 0;
    }

    if (typeof currentGrid[rowCoord][colCoord] === 'number') {
        return currentGrid[rowCoord][colCoord];
    }

    if (currentGrid[rowCoord][colCoord] === '*') {
        currentGrid[rowCoord][colCoord] = 0;
        return 0;
    }

    if (rowCoord === 0 || colCoord === 0) {
        currentGrid[rowCoord][colCoord] = 1;
        return 1;
    }

    const extentTopLeft = calculateSquareExtent(rowCoord - 1, colCoord - 1, currentGrid, gridDimension);
    const extentTop = calculateSquareExtent(rowCoord - 1, colCoord, currentGrid, gridDimension);
    const extentLeft = calculateSquareExtent(rowCoord, colCoord - 1, currentGrid, gridDimension);

    const result = 1 + Math.min(extentTopLeft, extentTop, extentLeft);
    currentGrid[rowCoord][colCoord] = result;
    return result;
}

while (true) {
    let dimension = parseInt(inputLines.shift(), 10);
    if (dimension === 0) {
        break;
    }

    let largestSquareSide = 0;
    let gridData = [];

    for (let i = 0; i < dimension; i++) {
        let lineContent = inputLines.shift();
        gridData.push(lineContent.split(""));
    }

    for (let rowCoord = 0; rowCoord < dimension; rowCoord++) {
        for (let colCoord = 0; colCoord < dimension; colCoord++) {
            const currentCellExtent = calculateSquareExtent(rowCoord, colCoord, gridData, dimension);
            largestSquareSide = Math.max(largestSquareSide, currentCellExtent);
        }
    }
    console.log(largestSquareSide);
}
