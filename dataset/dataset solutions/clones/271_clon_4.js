const dataStream = require('fs').readFileSync('/dev/stdin', 'utf8');
const numericalInputs = dataStream.trim().split("\n").map(Number);

for (let currentInputIndex = 0; currentInputIndex < numericalInputs.length; currentInputIndex++) {
    const currentMatrixDimension = numericalInputs[currentInputIndex];
    if (currentMatrixDimension === 0) break;

    const limitValue = currentMatrixDimension * currentMatrixDimension + 1;

    const matrixLayout = Array.from({ length: currentMatrixDimension }, () =>
        Array.from({ length: currentMatrixDimension }, () => -1)
    );

    const startingColumn = Math.floor(currentMatrixDimension / 2);
    const startingRow = startingColumn + 1;

    matrixLayout[startingRow][startingColumn] = 1;

    let valueCounter = 2;
    let currentRawRow = startingRow + 1;
    let currentRawColumn = startingColumn + 1;

    while (valueCounter < limitValue) {
        const actualRow = (currentRawRow % currentMatrixDimension + currentMatrixDimension) % currentMatrixDimension;
        const actualColumn = (currentRawColumn % currentMatrixDimension + currentMatrixDimension) % currentMatrixDimension;

        if (matrixLayout[actualRow][actualColumn] !== -1) {
            // Collision detected, adjust raw coordinates for next attempt without placing current value
            currentRawRow++;
            currentRawColumn--;
        } else {
            // Spot is empty, place value and prepare for the next
            matrixLayout[actualRow][actualColumn] = valueCounter;
            valueCounter++;
            currentRawRow++;
            currentRawColumn++;
        }
    }

    const formattedOutputGrid = matrixLayout.map(rowContent =>
        ' ' + rowContent.join(' ')
    ).join('\n');

    console.log(formattedOutputGrid);
}