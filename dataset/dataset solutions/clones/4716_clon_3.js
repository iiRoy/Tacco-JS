'use strict';

const outputMessage = msg => { console.log(msg); };

const rawInputLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split('\n');

const dimensionParts = rawInputLines[0].split(' ');
const matrixADimension = Number(dimensionParts[0]);
const subMatrixDimension = Number(dimensionParts[1]);

const extractMatrix = (lines, startLineIndex, numRows) => {
  return lines.slice(startLineIndex, startLineIndex + numRows).map(lineContent => lineContent.split(''));
};

const mainMatrix = extractMatrix(rawInputLines, 1, matrixADimension);
const patternMatrix = extractMatrix(rawInputLines, 1 + matrixADimension, subMatrixDimension);

const verifySubMatrixMatch = (sourceMatrix, targetPattern, startRow, startCol, patternSize) => {
  for (let patternRowOffset = 0; patternRowOffset < patternSize; patternRowOffset++) {
    for (let patternColOffset = 0; patternColOffset < patternSize; patternColOffset++) {
      if (sourceMatrix[startRow + patternRowOffset][startCol + patternColOffset] !== targetPattern[patternRowOffset][patternColOffset]) {
        return false;
      }
    }
  }
  return true;
};

for (let mainMatrixRowIndex = 0; mainMatrixRowIndex < matrixADimension; mainMatrixRowIndex++) {
  for (let mainMatrixColIndex = 0; mainMatrixColIndex < matrixADimension; mainMatrixColIndex++) {
    if (mainMatrix[mainMatrixRowIndex][mainMatrixColIndex] === patternMatrix[0][0]) {
      if (verifySubMatrixMatch(mainMatrix, patternMatrix, mainMatrixRowIndex, mainMatrixColIndex, subMatrixDimension)) {
        outputMessage('Yes');
        process.exit();
      }
    }
  }
}

outputMessage('No');
