var inputLines = [];
var gridWidth, valueMatrix;

var standardReadline = require('readline');

var inputHandler = standardReadline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputHandler.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

inputHandler.on('close', function () {
    gridWidth = Number(inputLines[0]); inputLines.shift();
    valueMatrix = inputLines.map(rowStr => rowStr.split(" ").map(valStr => Number(valStr)));

    console.log(determineOptimalTraversalValue(valueMatrix, gridWidth));
});

function determineOptimalTraversalValue(dataGrid, widthDimension) {
    let pathSumsTable = Array(2).fill(null).map(() => Array(widthDimension).fill(0));

    pathSumsTable[0][0] = dataGrid[0][0];

    for (let currentColumnIndex = 1; currentColumnIndex < widthDimension; currentColumnIndex++) {
        pathSumsTable[0][currentColumnIndex] = pathSumsTable[0][currentColumnIndex - 1] + dataGrid[0][currentColumnIndex];
    }

    pathSumsTable[1][0] = pathSumsTable[0][0] + dataGrid[1][0];

    for (let currentColumnIndex = 1; currentColumnIndex < widthDimension; currentColumnIndex++) {
        pathSumsTable[1][currentColumnIndex] = Math.max(
            pathSumsTable[1][currentColumnIndex - 1],
            pathSumsTable[0][currentColumnIndex]
        ) + dataGrid[1][currentColumnIndex];
    }

    let overallHighestSum = -Infinity;
    for (let rowIndex = 0; rowIndex < 2; rowIndex++) {
        for (let colIndex = 0; colIndex < widthDimension; colIndex++) {
            if (pathSumsTable[rowIndex][colIndex] > overallHighestSum) {
                overallHighestSum = pathSumsTable[rowIndex][colIndex];
            }
        }
    }

    return overallHighestSum;
}
