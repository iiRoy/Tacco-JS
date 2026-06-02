"use strict";

function bitwiseXor(bitA, bitB) {
  return bitA === bitB ? 0 : 1;
}

function rowXor(rowOne, rowTwo) {
  return rowOne.map((val, idx) => bitwiseXor(val, rowTwo[idx]));
}

function determineMatrixRank(initialGrid, totalRows, totalCols) {
  let workingGrid = initialGrid.map(row => [...row]);
  let currentPivotRow = 0;

  for (let currentColumn = 0; currentColumn < totalCols && currentPivotRow < totalRows; currentColumn++) {
    let pivotCandidateRow = -1;

    for (let r = currentPivotRow; r < totalRows; r++) {
      if (workingGrid[r][currentColumn] === 1) {
        pivotCandidateRow = r;
        break;
      }
    }

    if (pivotCandidateRow !== -1) {
      [workingGrid[currentPivotRow], workingGrid[pivotCandidateRow]] = [workingGrid[pivotCandidateRow], workingGrid[currentPivotRow]];

      for (let r = 0; r < totalRows; r++) {
        if (r !== currentPivotRow && workingGrid[r][currentColumn] === 1) {
          workingGrid[r] = rowXor(workingGrid[r], workingGrid[currentPivotRow]);
        }
      }
      currentPivotRow++;
    }
  }
  return currentPivotRow;
}

var processInputAndCalculate = function(rawData) {
  const parsedData = rawData.trim().split(/\s+/).map(Number);

  const rowCount = parsedData.shift();
  const colCount = parsedData.shift();

  const initialElements = parsedData;

  const initialGrid = Array.from({ length: rowCount }, (_, rIdx) =>
    Array.from({ length: colCount }, (_, cIdx) => initialElements[rIdx * colCount + cIdx])
  );

  const matrixRank = determineMatrixRank(initialGrid, rowCount, colCount);

  const finalResult = Math.pow(2, rowCount + colCount - 1) - Math.pow(2, Math.min(colCount, rowCount) - matrixRank + Math.max(colCount, rowCount) - 1);

  console.log(finalResult);
};

processInputAndCalculate(require('fs').readFileSync('/dev/stdin', 'utf8'));
