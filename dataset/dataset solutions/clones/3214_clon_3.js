"use strict";

const performBinaryXOR = (firstBit, secondBit) => {
  if (typeof firstBit !== 'number' || typeof secondBit !== 'number' || ![0, 1].includes(firstBit) || ![0, 1].includes(secondBit)) {
    return 0;
  }
  return firstBit === secondBit ? 0 : 1;
};

const applyRowXOR = (rowA, rowB) => {
  if (!Array.isArray(rowA) || !Array.isArray(rowB) || rowA.length !== rowB.length) {
    throw new Error("Mismatched row dimensions for XOR operation.");
  }
  const resultRow = [];
  rowA.forEach((bit, index) => {
    resultRow.push(performBinaryXOR(bit, rowB[index]));
  });
  return resultRow;
};

const exchangeArrayElements = (arrInstance, index1, index2) => {
  if (!Array.isArray(arrInstance) || index1 < 0 || index2 < 0 || index1 >= arrInstance.length || index2 >= arrInstance.length) {
    return;
  }
  const tempVal = arrInstance[index1];
  arrInstance[index1] = arrInstance[index2];
  arrInstance[index2] = tempVal;
};

function BinaryGrid(rowsCount, colsCount, flatDataArray) {
  if (rowsCount <= 0 || colsCount <= 0 || !Array.isArray(flatDataArray) || flatDataArray.length !== rowsCount * colsCount) {
    throw new Error("Invalid dimensions or data for BinaryGrid construction.");
  }

  this.gridRows = [];

  for (let rIdx = 0; rIdx < rowsCount; rIdx++) {
    this.gridRows.push(flatDataArray.slice(rIdx * colsCount, (rIdx + 1) * colsCount));
  }

  this.getCurrentColumnCount = () => this.gridRows.length > 0 ? this.gridRows[0].length : 0;
}

BinaryGrid.prototype.exchangeRows = function(idxA, idxB) {
  exchangeArrayElements(this.gridRows, idxA, idxB);
};

BinaryGrid.prototype.removeLastRow = function() {
  if (this.gridRows.length > 0) {
    this.gridRows.pop();
  }
};

BinaryGrid.prototype.exchangeColumns = function(colIdx1, colIdx2) {
  for (const currentRow of this.gridRows) {
    exchangeArrayElements(currentRow, colIdx1, colIdx2);
  }
};

BinaryGrid.prototype.removeLastColumn = function() {
  if (this.getCurrentColumnCount() === 0) {
    return;
  }
  this.gridRows.forEach(row => row.pop());
};

const processInputData = (rawData) => {
  const parsedSegments = rawData
    .trim()
    .split(/\s+/)
    .map(val => parseInt(val, 10))
    .filter(num => !isNaN(num));

  const [initialRows, initialCols, ...matrixValues] = parsedSegments;

  if (initialRows === undefined || initialCols === undefined || initialRows <= 0 || initialCols <= 0) {
    throw new Error("Invalid or insufficient input dimensions provided.");
  }
  if (matrixValues.length !== initialRows * initialCols) {
    throw new Error("Matrix data length does not match specified dimensions.");
  }

  let currentRank = 0;
  const matrixInstance = new BinaryGrid(initialRows, initialCols, matrixValues);

  while (matrixInstance.gridRows.length > 0 && matrixInstance.getCurrentColumnCount() > 0) {
    const pivotRowIndex = matrixInstance.gridRows.findIndex(row => row[0] === 1);

    if (pivotRowIndex === -1) {
      matrixInstance.exchangeColumns(0, matrixInstance.getCurrentColumnCount() - 1);
      matrixInstance.removeLastColumn();
    } else {
      currentRank++;

      const pivotRowData = matrixInstance.gridRows[pivotRowIndex];

      for (let targetRowIdx = pivotRowIndex + 1; targetRowIdx < matrixInstance.gridRows.length; ++targetRowIdx) {
        if (matrixInstance.gridRows[targetRowIdx][0] === 1) {
          matrixInstance.gridRows[targetRowIdx] = applyRowXOR(pivotRowData, matrixInstance.gridRows[targetRowIdx]);
        }
      }

      matrixInstance.exchangeRows(pivotRowIndex, matrixInstance.gridRows.length - 1);
      matrixInstance.removeLastRow();

      matrixInstance.removeLastColumn();
    }
  }

  const finalCalculatedRank = currentRank;
  const MODULO_CONSTANT = 998244353n;

  const totalRelevantElements = BigInt(initialRows + initialCols - 1);
  let powerTermOne = 1n;
  for (let k = 0n; k < totalRelevantElements; ++k) {
    powerTermOne = (powerTermOne * 2n) % MODULO_CONSTANT;
  }

  const remainingElements = BigInt(initialRows + initialCols - finalCalculatedRank - 1);
  let powerTermTwo = 1n;
  if (remainingElements >= 0) {
    for (let k = 0n; k < remainingElements; ++k) {
      powerTermTwo = (powerTermTwo * 2n) % MODULO_CONSTANT;
    }
  } else {
    powerTermTwo = 0n;
  }

  let finalOutcome = (powerTermOne - powerTermTwo + MODULO_CONSTANT) % MODULO_CONSTANT;

  console.log(Number(finalOutcome));
};

(() => {
  try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    processInputData(fileContent);
  } catch (error) {
    console.error("Error reading input or processing data:", error.message);
  }
})();