"use strict"
var ProcessInput = function(rawData) {
  let processedData = rawData.trim().split(/\s+/).map(Number);
  let numRows = processedData.shift();
  let numCols = processedData.shift();
  let currentRank = 0;
  let matrixInstance = new BinaryMatrix(numRows, numCols, processedData);

  while (matrixInstance.rowsData.length > 0) {
    let firstOneRowIdx = 0;
    let currentMatrixRowCount = matrixInstance.rowsData.length;
    for (let rowIndex = 0; rowIndex < currentMatrixRowCount; rowIndex++) {
      if (matrixInstance.rowsData[rowIndex][0] === 1) break;
      firstOneRowIdx++;
    }

    if (firstOneRowIdx === currentMatrixRowCount) {
      let lastColumnIndex = matrixInstance.rowsData[0].length - 1;
      matrixInstance.swapColumn(0, lastColumnIndex);
      matrixInstance.deleteColumn();
    } else {
      currentRank += 1;
      while (true) {
        let nextOneRowIdx = firstOneRowIdx + 1;
        for (let rowIndex = firstOneRowIdx + 1; rowIndex < currentMatrixRowCount; rowIndex++) {
          if (matrixInstance.rowsData[rowIndex][0] === 1) break;
          nextOneRowIdx++;
        }
        if (nextOneRowIdx === currentMatrixRowCount) break;
        matrixInstance.rowsData[nextOneRowIdx] = applyXOR(matrixInstance.rowsData[firstOneRowIdx], matrixInstance.rowsData[nextOneRowIdx]);
      }
      let lastRowIndex = matrixInstance.rowsData.length - 1;
      matrixInstance.swapRow(firstOneRowIdx, lastRowIndex);
      matrixInstance.deleteRow();
    }
  }

  let finalRank = currentRank;
  let baseValue = 2;
  let sumOfDimensions = numRows + numCols;
  let termOneExponent = sumOfDimensions - 1;
  let termOne = baseValue ** termOneExponent;

  let minDimension = Math.min(numCols, numRows);
  let maxDimension = Math.max(numCols, numRows);
  let termTwoExponent = minDimension - finalRank + maxDimension - 1;
  let termTwo = baseValue ** termTwoExponent;

  let resultValue = termOne - termTwo;
  console.log(resultValue);
}

function binaryXOR(valA, valB) {
  return valA === valB ? 0 : 1;
}

function applyXOR(array1, array2) {
  return array1.map((element, index) => binaryXOR(element, array2[index]));
}

function BinaryMatrix(numRows, numCols, initialElements) {
  let thisMatrix = this;
  thisMatrix.rowsData = [];

  for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
    thisMatrix.rowsData[rowIndex] = [];
  }

  let totalElementsCount = numRows * numCols;
  for (let elementIndex = 0; elementIndex < totalElementsCount; elementIndex++) {
    let targetRow = Math.floor(elementIndex / numCols);
    let targetCol = elementIndex % numCols;
    thisMatrix.rowsData[targetRow][targetCol] = initialElements[elementIndex];
  }
}

function exchangeElements(targetArray, idx1, idx2) {
  let tempA = targetArray[idx1];
  let tempB = targetArray[idx2];
  targetArray[idx1] = tempB;
  targetArray[idx2] = tempA;
}

BinaryMatrix.prototype.swapRow = function(idx1, idx2) {
  let currentMatrix = this;
  exchangeElements(currentMatrix.rowsData, idx1, idx2);
}

BinaryMatrix.prototype.deleteRow = function() {
  let currentMatrix = this;
  let matrixRows = currentMatrix.rowsData;
  if (matrixRows.length > 0) {
    matrixRows.pop();
  }
}

BinaryMatrix.prototype.swapColumn = function(colIdx1, colIdx2) {
  let currentMatrix = this;
  let allRows = currentMatrix.rowsData;
  let rowCount = allRows.length;
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    let currentRow = allRows[rowIndex];
    exchangeElements(currentRow, colIdx1, colIdx2);
  }
}

BinaryMatrix.prototype.deleteColumn = function() {
  let currentMatrix = this;
  let matrixRows = currentMatrix.rowsData;
  let rowCount = matrixRows.length;

  if (rowCount === 0) {
    return;
  }

  if (matrixRows[0].length === 1) {
    currentMatrix.rowsData = [];
  } else {
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      matrixRows[rowIndex].pop();
    }
  }
}

ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
