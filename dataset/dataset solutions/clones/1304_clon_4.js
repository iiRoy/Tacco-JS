'use strict';

const extractMatrices = (incomingText) => {
    const textLines = incomingText.trim().split('\n');

    const [dimensionSpec, ...contentLines] = textLines;
    const [matrixARows, sharedDimension, matrixBCols] = dimensionSpec.split(' ').map(Number);

    const parsedData = contentLines.reduce((accumulator, currentLine, index) => {
        if (index < matrixARows) {
            accumulator.operandA.push(currentLine.split(' ').map(Number));
        } else {
            accumulator.operandB.push(currentLine.split(' ').map(Number));
        }
        return accumulator;
    }, {
        rowsOfA: matrixARows,
        commonDimVal: sharedDimension,
        colsOfB: matrixBCols,
        operandA: [],
        operandB: []
    });

    return parsedData;
};

const multiplyMatrices = (inputMatrixOne, inputMatrixTwo, rowsOfInputOne, commonDimensionValue, colsOfInputTwo) => {
    return Array.from({ length: rowsOfInputOne }, (_, rowIterator) =>
        Array.from({ length: colsOfInputTwo }, (_, colIterator) =>
            Array.from({ length: commonDimensionValue }, (_, commonIterator) =>
                inputMatrixOne[rowIterator][commonIterator] * inputMatrixTwo[commonIterator][colIterator]
            ).reduce((accumulator, currentValue) => accumulator + currentValue, 0)
        )
    );
};

const renderMatrixToString = (numericGrid) => {
    if (numericGrid.length === 0) {
        return '';
    }
    const currentRowAsText = numericGrid[0].join(' ');
    const remainingRows = numericGrid.slice(1);
    if (remainingRows.length === 0) {
        return currentRowAsText;
    }
    return currentRowAsText + '\n' + renderMatrixToString(remainingRows);
};

const runCalculation = (incomingText) => {
    const { rowsOfA, commonDimVal, colsOfB, operandA, operandB } = extractMatrices(incomingText);

    const finalProduct = multiplyMatrices(operandA, operandB, rowsOfA, commonDimVal, colsOfB);

    console.log(renderMatrixToString(finalProduct));
};

runCalculation(require('fs').readFileSync('/dev/stdin', 'utf8'));