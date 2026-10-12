'use strict';

const processInput = (sourceText) => {
    const inputLines = sourceText.split('\n');
    const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);

    const cellValues = inputLines.slice(1, gridHeight + 1).flatMap(
        (rowString) => rowString.split(' ').map(Number)
    );

    const transferRecords = [];

    const calculateFlatIndex = (colIndex, rowIndex) => rowIndex * gridWidth + colIndex;

    for (let currentFlatIndex = 0; currentFlatIndex < gridHeight * gridWidth; currentFlatIndex++) {
        const currentYCoordinate = Math.floor(currentFlatIndex / gridWidth);
        const currentXCoordinate = currentFlatIndex % gridWidth;

        if (cellValues[currentFlatIndex] % 2 !== 0) {
            let targetXCoordinate = -1;
            let targetYCoordinate = -1;

            if (currentXCoordinate + 1 < gridWidth) {
                targetXCoordinate = currentXCoordinate + 1;
                targetYCoordinate = currentYCoordinate;
            } else if (currentYCoordinate + 1 < gridHeight) {
                targetXCoordinate = currentXCoordinate;
                targetYCoordinate = currentYCoordinate + 1;
            }

            if (targetXCoordinate !== -1) {
                const targetFlatIndex = calculateFlatIndex(targetXCoordinate, targetYCoordinate);

                transferRecords.push(
                    [
                        currentYCoordinate + 1,
                        currentXCoordinate + 1,
                        targetYCoordinate + 1,
                        targetXCoordinate + 1
                    ].join(' ')
                );

                cellValues[targetFlatIndex]++;
                cellValues[currentFlatIndex]--;
            }
        }
    }

    console.log(transferRecords.length);
    console.log(transferRecords.join('\n') + '\n');
};

const isTestMode = false;

if (isTestMode) {
    processInput('2 3\n1 2 3\n0 1 1\n');
} else {
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
