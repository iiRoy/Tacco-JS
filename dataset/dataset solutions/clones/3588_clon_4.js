'use strict';

const processInputToBooleanGrid = (inputContent) => {
    const contentLines = inputContent.split('\n').slice(1);
    return contentLines.map(currentLine => Array.from(currentLine, character => character === '.'));
};

const filterOutAllTrueRows = (inputGrid) => {
    return inputGrid.filter(gridRow => gridRow.some(cellValue => !cellValue));
};

const performMatrixTranspose = (sourceGrid) => {
    if (!sourceGrid || sourceGrid.length === 0 || sourceGrid[0].length === 0) {
        return [];
    }
    const totalRows = sourceGrid.length;
    const totalCols = sourceGrid[0].length;

    return Array.from({ length: totalCols }, (_, columnIndex) =>
        Array.from({ length: totalRows }, (_, rowIndex) => sourceGrid[rowIndex][columnIndex])
    );
};

const convertBooleanToCharGrid = (booleanMatrix) => {
    return booleanMatrix.map(matrixRow => matrixRow.map(booleanValue => booleanValue ? '.' : '#'));
};

function processGridData(sourceInput) {
    const initialBooleanRepresentation = processInputToBooleanGrid(sourceInput);

    const rowsWithFalseElements = filterOutAllTrueRows(initialBooleanRepresentation);

    const firstTransposedMatrix = performMatrixTranspose(rowsWithFalseElements);

    const columnsWithFalseElements = filterOutAllTrueRows(firstTransposedMatrix);

    const finalTransposedMatrix = performMatrixTranspose(columnsWithFalseElements);

    const characterOutputMatrix = convertBooleanToCharGrid(finalTransposedMatrix);

    return characterOutputMatrix.map(outputRow => outputRow.join('')).join('\n');
}

console.log(processGridData(require('fs').readFileSync('/dev/stdin', 'utf8')));
