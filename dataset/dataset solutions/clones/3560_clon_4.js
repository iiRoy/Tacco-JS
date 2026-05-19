'use strict';

const processInputData = (rawInput) => {
    const inputLines = rawInput.split('\n');
    const dimensionsStr = inputLines[0].split(' ');
    const rowCount = Number(dimensionsStr[0]);
    const colCount = Number(dimensionsStr[1]);

    const valueGrid = Array.from({ length: rowCount }, (_, rIdx) =>
        inputLines[rIdx + 1].split(' ').map(Number)
    );

    const operationLog = [];

    const transferOddness = (fromCol, fromRow, toCol, toRow) => {
        operationLog.push({ fromCol, fromRow, toCol, toRow });
        valueGrid[toRow][toCol]++;
        valueGrid[fromRow][fromCol]--;
    };

    const displacementOptions = [
        { dc: 1, dr: 0 }, // Attempt to move right
        { dc: 0, dr: 1 }  // Otherwise, attempt to move down
    ];

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        for (let colIndex = 0; colIndex < colCount; colIndex++) {
            if (valueGrid[rowIndex][colIndex] % 2 !== 0) {
                const chosenDisplacement = displacementOptions.find(disp => {
                    const nextCol = colIndex + disp.dc;
                    const nextRow = rowIndex + disp.dr;
                    return nextCol < colCount && nextRow < rowCount;
                });

                if (chosenDisplacement) {
                    transferOddness(
                        colIndex,
                        rowIndex,
                        colIndex + chosenDisplacement.dc,
                        rowIndex + chosenDisplacement.dr
                    );
                }
            }
        }
    }

    console.log(operationLog.length);
    const formattedLog = operationLog.map(op =>
        `${op.fromCol} ${op.fromRow} ${op.toCol} ${op.toRow}`
    );
    console.log(formattedLog.join('\n') + '\n');
};

const isTestMode = false;

if (isTestMode) {
    processInputData('2 3\n1 2 3\n0 1 1\n');
} else {
    processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
