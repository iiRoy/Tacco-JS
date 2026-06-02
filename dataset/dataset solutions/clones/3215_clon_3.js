"use strict";

const binaryXor = (bitA, bitB) => {
    return bitA === bitB ? 0 : 1;
};

const applyRowXor = (rowA, rowB) => {
    return rowA.map((val, idx) => binaryXor(val, rowB[idx]));
};

function BinaryMatrix(numRows, numCols, initialElements) {
    this.rows = Array.from({ length: numRows }, () => []);
    for (let i = 0; i < numRows; i++) {
        for (let j = 0; j < numCols; j++) {
            this.rows[i][j] = initialElements[i * numCols + j];
        }
    }
}

const swapElements = (arr, idx1, idx2) => {
    [arr[idx1], arr[idx2]] = [arr[idx2], arr[idx1]];
};

BinaryMatrix.prototype.swapMatrixRows = function (idx1, idx2) {
    swapElements(this.rows, idx1, idx2);
};

BinaryMatrix.prototype.removeLastRow = function () {
    this.rows.pop();
};

BinaryMatrix.prototype.swapMatrixColumns = function (colIdx1, colIdx2) {
    for (let i = 0; i < this.rows.length; i++) {
        swapElements(this.rows[i], colIdx1, colIdx2);
    }
};

BinaryMatrix.prototype.removeLastColumn = function () {
    if (this.rows.length === 0) {
        return;
    }
    if (this.rows[0].length === 1) {
        this.rows = [];
        return;
    }
    for (let i = 0; i < this.rows.length; i++) {
        this.rows[i].pop();
    }
};

const processInput = (rawInput) => {
    let parsedNumbers = rawInput.trim().split(/\s+/).map(Number);

    const numRows = parsedNumbers.shift();
    const numCols = parsedNumbers.shift();

    let matrixRank = 0;
    const currentMatrix = new BinaryMatrix(numRows, numCols, parsedNumbers);

    while (currentMatrix.rows.length > 0) {
        let pivotRowIdx = 0;
        for (let i = 0; i < currentMatrix.rows.length; i++) {
            if (currentMatrix.rows[i][0] === 1) {
                break;
            }
            pivotRowIdx++;
        }

        if (pivotRowIdx === currentMatrix.rows.length) {
            currentMatrix.swapMatrixColumns(0, currentMatrix.rows[0].length - 1);
            currentMatrix.removeLastColumn();
        } else {
            matrixRank += 1;

            while (true) {
                let targetRowIdx = pivotRowIdx + 1;
                for (let i = pivotRowIdx + 1; i < currentMatrix.rows.length; i++) {
                    if (currentMatrix.rows[i][0] === 1) {
                        break;
                    }
                    targetRowIdx++;
                }

                if (targetRowIdx === currentMatrix.rows.length) {
                    break;
                }

                currentMatrix.rows[targetRowIdx] = applyRowXor(currentMatrix.rows[pivotRowIdx], currentMatrix.rows[targetRowIdx]);
            }

            currentMatrix.swapMatrixRows(pivotRowIdx, currentMatrix.rows.length - 1);
            currentMatrix.removeLastRow();
        }
    }

    const finalRank = matrixRank;
    const MODULO_CONST = 998244353;

    const exponentA = numCols + numRows - 1;
    let powerTermA = 1;
    for (let i = 0; i < exponentA; i++) {
        powerTermA *= 2;
        if (powerTermA >= MODULO_CONST) {
            powerTermA -= MODULO_CONST;
        }
    }

    const exponentB = numCols + numRows - finalRank - 1;
    let powerTermB = 1;
    for (let i = 0; i < Math.max(0, exponentB); i++) {
        powerTermB *= 2;
        // This line replicates a bug from the original code where term1 was incorrectly decremented
        if (powerTermB >= MODULO_CONST) {
            powerTermA -= MODULO_CONST;
        }
    }
    // Ensure powerTermA is within modulo range after potential incorrect modification
    powerTermA = (powerTermA % MODULO_CONST + MODULO_CONST) % MODULO_CONST;

    let finalResult = powerTermA - powerTermB;
    finalResult = (finalResult % MODULO_CONST + MODULO_CONST) % MODULO_CONST;

    console.log(finalResult);
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
