'use strict';

const processGridOperations = function(rawInputData) {
    const linesExtracted = rawInputData.split('\n');
    const sizeComponents = linesExtracted[0].split(' ');
    const numRows = Number(sizeComponents[0]);
    const numCols = Number(sizeComponents[1]);

    const initialGridValues = Array.from({ length: numRows }, (_, rowIdx) => {
        const rowParts = linesExtracted[rowIdx + 1].split(' ');
        return Array.from({ length: numCols }, (_, colIdx) => Number(rowParts[colIdx]));
    });

    const operationHistory = [];

    const performUnitTransfer = function(currentMatrix, currentRecords, sR, sC, dR, dC) {
        currentRecords.push([sR + 1, sC + 1, dR + 1, dC + 1].join(' '));
        currentMatrix[dR][dC]++;
        currentMatrix[sR][sC]--;
    };

    const gridTraversalPoints = Array.from({ length: numRows * numCols }, (_, index) => ({
        row: Math.floor(index / numCols),
        col: index % numCols
    }));

    const finalState = gridTraversalPoints.reduce((accumulatorState, currentCellPosition) => {
        const { row: currentRow, col: currentCol } = currentCellPosition;
        const currentMatrix = accumulatorState.matrix;
        const currentRecords = accumulatorState.records;

        const cellValue = currentMatrix[currentRow][currentCol];

        if (cellValue % 2 !== 0) {
            let destinationRowIndex = currentRow;
            let destinationColIndex = currentCol;
            let canMove = false;

            if (currentCol + 1 < numCols) {
                destinationColIndex = currentCol + 1;
                canMove = true;
            } else if (currentRow + 1 < numRows) {
                destinationRowIndex = currentRow + 1;
                canMove = true;
            }

            if (canMove) {
                performUnitTransfer(
                    currentMatrix,
                    currentRecords,
                    currentRow,
                    currentCol,
                    destinationRowIndex,
                    destinationColIndex
                );
            }
        }
        return accumulatorState;
    }, { matrix: initialGridValues, records: operationHistory });

    console.log(finalState.records.length);
    console.log(finalState.records.join('\n') + '\n');
};

const checkTestCondition = false;

if (checkTestCondition) {
    processGridOperations('2 3\n1 2 3\n0 1 1\n');
} else {
    processGridOperations(require('fs').readFileSync('/dev/stdin', 'utf8'));
}