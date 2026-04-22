const transposeMatrix = (gridData) => {
    if (!gridData || gridData.length === 0 || gridData[0].length === 0) {
        return [];
    }
    return gridData[0].map((_, columnPosition) => gridData.map(rowLine => rowLine[columnPosition]));
};

function processGridData(inputTxt) {
    const allInputLines = inputTxt.trim().split('\n');
    const [dimRowsStr, dimColsStr] = allInputLines[0].split(' ');
    const initialGridHeight = parseInt(dimRowsStr, 10);
    const initialGridWidth = parseInt(dimColsStr, 10);

    let currentCharacterMatrix = allInputLines.slice(1).map(lineContent => lineContent.split(''));

    const rowsWithoutDashes = currentCharacterMatrix.filter(rowArray => rowArray.some(cellChar => cellChar === '#'));

    if (rowsWithoutDashes.length === 0) {
        return "";
    }

    const transposedCharacterMatrix = transposeMatrix(rowsWithoutDashes);

    const colsWithoutDashesTransposed = transposedCharacterMatrix.filter(colArray => colArray.some(cellChar => cellChar === '#'));

    const finalRenderedMatrix = transposeMatrix(colsWithoutDashesTransposed);

    if (finalRenderedMatrix.length === 1) {
        return finalRenderedMatrix[0].filter(cellChar => cellChar === '#').join('');
    } else if (finalRenderedMatrix.length === 0) {
        return '';
    } else {
        return finalRenderedMatrix.map(rowArray => rowArray.join('')).join('\n');
    }
}

const acquireExternalData = require('fs').readFileSync;
const inputSourcePath = '/dev/stdin';

const systemInput = acquireExternalData(inputSourcePath, 'utf8');
console.log(processGridData(systemInput));