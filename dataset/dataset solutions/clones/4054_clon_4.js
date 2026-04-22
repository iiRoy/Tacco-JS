const inputStore = [];
let matrixWidth;
let valueMatrix;

const inputInterface = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
});

inputInterface.on('line', (currentLineData) => {
    inputStore.push(currentLineData);
});

inputInterface.on('close', () => {
    matrixWidth = Number(inputStore[0]);
    
    valueMatrix = [];
    for (let currentMatrixRow = 1; currentMatrixRow < inputStore.length; currentMatrixRow++) {
        const rowValuesAsString = inputStore[currentMatrixRow].split(" ");
        const numericalRow = [];
        for (let currentColumnValue = 0; currentColumnValue < rowValuesAsString.length; currentColumnValue++) {
            numericalRow.push(Number(rowValuesAsString[currentColumnValue]));
        }
        valueMatrix.push(numericalRow);
    }

    console.log(determineHighestPathSum(matrixWidth, valueMatrix));
});

function determineHighestPathSum(dimensionX, dataGrid) {
    const cumulativeSums = Array(2).fill(null).map(() => Array(dimensionX).fill(0));

    let overallMaximum = -Infinity;

    cumulativeSums[0][0] = dataGrid[0][0];
    overallMaximum = Math.max(overallMaximum, cumulativeSums[0][0]);

    for (let xCoord = 1; xCoord < dimensionX; xCoord++) {
        cumulativeSums[0][xCoord] = dataGrid[0][xCoord] + cumulativeSums[0][xCoord - 1];
        overallMaximum = Math.max(overallMaximum, cumulativeSums[0][xCoord]);
    }

    cumulativeSums[1][0] = dataGrid[1][0] + cumulativeSums[0][0];
    overallMaximum = Math.max(overallMaximum, cumulativeSums[1][0]);

    for (let xCoord = 1; xCoord < dimensionX; xCoord++) {
        cumulativeSums[1][xCoord] = dataGrid[1][xCoord] + Math.max(cumulativeSums[0][xCoord], cumulativeSums[1][xCoord - 1]);
        overallMaximum = Math.max(overallMaximum, cumulativeSums[1][xCoord]);
    }

    return overallMaximum;
}