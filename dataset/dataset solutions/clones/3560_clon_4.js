'use strict';

const processGridData = (rawText) => {
    const lineSegments = rawText.trim().split('\n');
    const [dimensionYStr, dimensionXStr] = lineSegments[0].split(' ');
    const totalRows = Number(dimensionYStr);
    const totalCols = Number(dimensionXStr);

    const initialCellMatrix = lineSegments.slice(1).map(rowSegment =>
        rowSegment.split(' ').map(Number)
    );

    const allCellLocations = Array.from({ length: totalRows }, (_, rIdx) =>
        Array.from({ length: totalCols }, (_, cIdx) => [rIdx, cIdx])
    ).flat();

    const processingState = {
        currentMatrix: initialCellMatrix,
        transferRecords: []
    };

    const finalProcessingResult = allCellLocations.reduce((accumulator, currentCoord) => {
        const [currentRow, currentCol] = currentCoord;
        const valueAtCurrentCell = accumulator.currentMatrix[currentRow][currentCol];

        if (valueAtCurrentCell % 2 !== 0) {
            let targetRow = currentRow;
            let targetCol = currentCol;
            let transferHappened = false;

            if (currentCol + 1 < totalCols) {
                targetCol = currentCol + 1;
                transferHappened = true;
            } else if (currentRow + 1 < totalRows) {
                targetRow = currentRow + 1;
                transferHappened = true;
            }

            if (transferHappened) {
                const nextMatrixState = accumulator.currentMatrix.map(r => [...r]);
                
                nextMatrixState[currentRow][currentCol]--;
                nextMatrixState[targetRow][targetCol]++;

                const operationDescription = `${currentCol} ${currentRow} ${targetCol} ${targetRow}`;
                
                return {
                    currentMatrix: nextMatrixState,
                    transferRecords: [...accumulator.transferRecords, operationDescription]
                };
            }
        }
        return accumulator;
    }, processingState);

    console.log(finalProcessingResult.transferRecords.length.toString());
    finalProcessingResult.transferRecords.forEach(record => console.log(record));
    console.log('');
};

const isExecutionTest = false;

if (isExecutionTest) {
    processGridData('2 3\n1 2 3\n0 1 1\n');
} else {
    processGridData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}