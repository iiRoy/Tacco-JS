const inputReader = require('readline').createInterface({
    input: process.stdin, output: process.stdout
});

let allInputLines = [];
let rowsA, colsA, rowsB;
let matrixAData = [];
let matrixBTransposeData = [];

inputReader.on('line', (currentLine) => {
    allInputLines.push(currentLine);
});

inputReader.on('close', () => {
    const dimensionValues = allInputLines[0].split(' ').map(Number);
    rowsA = dimensionValues[0];
    colsA = dimensionValues[1];
    rowsB = dimensionValues[2];

    for (let rowIdx = 0; rowIdx < rowsA; rowIdx++) {
        const currentLineValues = allInputLines[1 + rowIdx].split(' ').map(Number);
        matrixAData.push(currentLineValues);
    }

    for (let commonDimIdx = 0; commonDimIdx < colsA; commonDimIdx++) {
        matrixBTransposeData.push(new Array(rowsB).fill(0));
    }

    for (let rowIdx = 0; rowIdx < rowsB; rowIdx++) {
        const currentLineValues = allInputLines[1 + rowsA + rowIdx].split(' ').map(Number);
        for (let colIdx = 0; colIdx < colsA; colIdx++) {
            matrixBTransposeData[colIdx][rowIdx] = currentLineValues[colIdx];
        }
    }

    const resultMatrix = [];

    const calculateVectorDotProduct = (vectorOne, vectorTwo) => {
        return vectorOne.reduce((accumulator, currentVal, index) => {
            return accumulator + (currentVal * vectorTwo[index]);
        }, 0);
    };

    for (let rowIdx = 0; rowIdx < rowsA; rowIdx++) {
        const resultRow = [];
        for (let colIdx = 0; colIdx < rowsB; colIdx++) {
            const bColumnVector = matrixBTransposeData.map(row => row[colIdx]);
            resultRow.push(calculateVectorDotProduct(matrixAData[rowIdx], bColumnVector));
        }
        resultMatrix.push(resultRow);
    }

    resultMatrix.forEach(outputRow => {
        console.log(outputRow.join(' '));
    });
});
