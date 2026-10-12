'use strict';

const processInput = (rawTextContent) => {
    const rawLines = rawTextContent.trim().split('\n');
    const matrixDimensions = rawLines[0].split(' ').map(Number);

    const rowsFirstMatrix = matrixDimensions[0];
    const commonDimension = matrixDimensions[1];
    const colsSecondMatrix = matrixDimensions[2];

    const firstOperandMatrix = rawLines.slice(1, rowsFirstMatrix + 1).map(line => line.split(' ').map(Number));
    const secondOperandMatrix = rawLines.slice(rowsFirstMatrix + 1, rowsFirstMatrix + 1 + commonDimension).map(line => line.split(' ').map(Number));

    const productResultMatrix = Array.from({ length: rowsFirstMatrix }, (_, rowIndex) =>
        Array.from({ length: colsSecondMatrix }, (_, colIndex) =>
            Array.from({ length: commonDimension }, (_, sumIndex) =>
                firstOperandMatrix[rowIndex][sumIndex] * secondOperandMatrix[sumIndex][colIndex]
            ).reduce((currentSum, termValue) => currentSum + termValue, 0)
        )
    );

    console.log(productResultMatrix.map(row => row.join(' ')).join('\n'));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
