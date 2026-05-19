function processInputData(inputString) {
    const parsedData = inputString.trim().split(/\s+/).map(Number);
    const initialRows = parsedData.shift();
    const initialCols = parsedData.shift();

    function BinaryGrid(rowsCount, colsCount, initialElements) {
        this.originalRows = rowsCount;
        this.originalCols = colsCount;
        this.data = new Uint8Array(rowsCount * colsCount);
        for (let i = 0; i < initialElements.length; i++) {
            this.data[i] = initialElements[i];
        }

        this.activeRowIndices = Array.from({ length: rowsCount }, (_, i) => i);
        this.activeColIndices = Array.from({ length: colsCount }, (_, i) => i);
    }

    BinaryGrid.prototype.retrieve = function(activeRowIdx, activeColIdx) {
        const originalRow = this.activeRowIndices[activeRowIdx];
        const originalCol = this.activeColIndices[activeColIdx];
        return this.data[originalRow * this.originalCols + originalCol];
    };

    BinaryGrid.prototype.update = function(activeRowIdx, activeColIdx, value) {
        const originalRow = this.activeRowIndices[activeRowIdx];
        const originalCol = this.activeColIndices[activeColIdx];
        this.data[originalRow * this.originalCols + originalCol] = value;
    };

    BinaryGrid.prototype.swapActiveRows = function(idxA, idxB) {
        const temp = this.activeRowIndices[idxA];
        this.activeRowIndices[idxA] = this.activeRowIndices[idxB];
        this.activeRowIndices[idxB] = temp;
    };

    BinaryGrid.prototype.swapActiveCols = function(idxA, idxB) {
        const temp = this.activeColIndices[idxA];
        this.activeColIndices[idxA] = this.activeColIndices[idxB];
        this.activeColIndices[idxB] = temp;
    };

    BinaryGrid.prototype.removeLastActiveRow = function() {
        this.activeRowIndices.pop();
    };

    BinaryGrid.prototype.removeLastActiveCol = function() {
        this.activeColIndices.pop();
    };

    BinaryGrid.prototype.applyRowXOR = function(pivotActiveRowIdx, targetActiveRowIdx, currentActiveColIdx) {
        const pivotOriginalRow = this.activeRowIndices[pivotActiveRowIdx];
        const targetOriginalRow = this.activeRowIndices[targetActiveRowIdx];

        for (let i = currentActiveColIdx; i < this.activeColIndices.length; i++) {
            const originalCol = this.activeColIndices[i];
            const pivotVal = this.data[pivotOriginalRow * this.originalCols + originalCol];
            const targetVal = this.data[targetOriginalRow * this.originalCols + originalCol];
            this.data[targetOriginalRow * this.originalCols + originalCol] = pivotVal ^ targetVal;
        }
    };

    function calculateRankRecursive(gridInstance, currentRankAccumulator) {
        if (gridInstance.activeRowIndices.length === 0 || gridInstance.activeColIndices.length === 0) {
            return currentRankAccumulator;
        }

        const currentColumnIndexInActive = 0;

        let pivotRowIndexInActive = -1;
        for (let i = 0; i < gridInstance.activeRowIndices.length; i++) {
            if (gridInstance.retrieve(i, currentColumnIndexInActive) === 1) {
                pivotRowIndexInActive = i;
                break;
            }
        }

        if (pivotRowIndexInActive === -1) {
            gridInstance.swapActiveCols(currentColumnIndexInActive, gridInstance.activeColIndices.length - 1);
            gridInstance.removeLastActiveCol();
            return calculateRankRecursive(gridInstance, currentRankAccumulator);
        } else {
            const newRank = currentRankAccumulator + 1;
            gridInstance.swapActiveRows(pivotRowIndexInActive, 0);

            for (let i = 1; i < gridInstance.activeRowIndices.length; i++) {
                if (gridInstance.retrieve(i, currentColumnIndexInActive) === 1) {
                    gridInstance.applyRowXOR(0, i, currentColumnIndexInActive);
                }
            }

            gridInstance.swapActiveRows(0, gridInstance.activeRowIndices.length - 1);
            gridInstance.removeLastActiveRow();
            gridInstance.swapActiveCols(currentColumnIndexInActive, gridInstance.activeColIndices.length - 1);
            gridInstance.removeLastActiveCol();

            return calculateRankRecursive(gridInstance, newRank);
        }
    }

    const gridInstance = new BinaryGrid(initialRows, initialCols, parsedData);
    const finalRank = calculateRankRecursive(gridInstance, 0);

    const MODULUS_VAL = 998244353;

    const calculatePowerTerm = (exponent, initialValue, modulus) => {
        let currentVal = initialValue;
        for (let i = 0; i < exponent; i++) {
            currentVal = (currentVal * 2);
            if (currentVal >= modulus) {
                currentVal -= modulus;
            }
        }
        return currentVal;
    };

    let termAValue = calculatePowerTerm(initialCols + initialRows - 1, 1, MODULUS_VAL);

    let termBValue = 1;
    const exponentB = initialCols + initialRows - finalRank - 1;
    for (let i = 0; i < exponentB; i++) {
        termBValue = (termBValue * 2);
        // Replicating the bug from the original code: it incorrectly modifies term1 (termAValue)
        if (termBValue >= MODULUS_VAL) {
            termAValue -= MODULUS_VAL;
        }
    }

    let finalResult = (termAValue - termBValue + MODULUS_VAL) % MODULUS_VAL;
    console.log(finalResult);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
