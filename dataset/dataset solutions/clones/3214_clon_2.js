"use strict";
var PrimaryProcess = function(dataStream) {
  dataStream = dataStream.trim().split(/\s+/).map(elementValue => elementValue - 0);
  var rowCount = dataStream.shift();
  var colCount = dataStream.shift();
  var matrixRank = 0;
  var binaryMatrix = new BinaryGrid(rowCount, colCount, dataStream);
  while (binaryMatrix.rows.length > 0) {
    let firstOneIdx = 0;
    for (let rIdx = 0; rIdx < binaryMatrix.rows.length; rIdx++) {
      if (binaryMatrix.rows[rIdx][0] === 1) break;
      firstOneIdx++;
    }
    if (firstOneIdx === binaryMatrix.rows.length) {
      binaryMatrix.exchangeColumns(0, binaryMatrix.rows[0].length - 1);
      binaryMatrix.removeLastColumn();
    } else {
      matrixRank += 1;
      while (true) {
        let nextOneIdx = firstOneIdx + 1;
        for (let rIdx = firstOneIdx + 1; rIdx < binaryMatrix.rows.length; rIdx++) {
          if (binaryMatrix.rows[rIdx][0] === 1) break;
          nextOneIdx++;
        }
        if (nextOneIdx === binaryMatrix.rows.length) break;
        binaryMatrix.rows[nextOneIdx] = ExclusiveOR(binaryMatrix.rows[firstOneIdx], binaryMatrix.rows[nextOneIdx]);
      }
      binaryMatrix.exchangeRows(firstOneIdx, binaryMatrix.rows.length - 1);
      binaryMatrix.removeLastRow();
    }
  }
  var finalRank = matrixRank;
  var ModulusPrime = 998244353;
  var factorA = 1;
  var factorB = 1;
  for (let counter = 1; counter <= colCount + rowCount - 1; counter++)
    factorA = factorA + factorA - (2 * factorA >= ModulusPrime ? ModulusPrime : 0);
  for (let counter = 1; counter <= colCount + rowCount - finalRank - 1; counter++)
    factorB = factorB + factorB - (2 * factorB >= ModulusPrime ? ModulusPrime : 0);
  var computedValue = factorA - factorB;
  console.log(computedValue);
};

function singleBitXOR(bitA, bitB) {
  return bitA === bitB ? 0 : 1;
}

function ExclusiveOR(vectorA, vectorB) {
  return vectorA.map((val, index) => singleBitXOR(val, vectorB[index]));
}

function BinaryGrid(numRows, numCols, initialValues) {
  var gridInstance = this;
  gridInstance.rows = [];
  for (let r = 0; r < numRows; r++) gridInstance.rows[r] = [];
  for (let r = 0; r < numRows; r++)
    for (let c = 0; c < numCols; c++) {
      gridInstance.rows[r][c] = initialValues[r * numCols + c];
    }
}

function exchangeItems(targetArray, indexOne, indexTwo) {
  var valOne = targetArray[indexOne];
  var valTwo = targetArray[indexTwo];
  targetArray[indexOne] = valTwo, targetArray[indexTwo] = valOne;
}

BinaryGrid.prototype.exchangeRows = function(rowIdx1, rowIdx2) {
  var currentGrid = this;
  exchangeItems(currentGrid.rows, rowIdx1, rowIdx2);
};

BinaryGrid.prototype.removeLastRow = function() {
  var currentGrid = this;
  var allRows = currentGrid.rows;
  allRows.pop();
};

BinaryGrid.prototype.exchangeColumns = function(colIdxA, colIdxB) {
  var currentGrid = this;
  for (let r = 0; r < currentGrid.rows.length; r++)
    exchangeItems(currentGrid.rows[r], colIdxA, colIdxB);
};

BinaryGrid.prototype.removeLastColumn = function() {
  var currentGrid = this;
  var allRows = currentGrid.rows;
  var currentRowsCount = allRows.length;
  if (allRows[0].length === 1) currentGrid.rows = [];
  for (let r = 0; r < currentRowsCount; r++)
    allRows[r].pop();
};

PrimaryProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));