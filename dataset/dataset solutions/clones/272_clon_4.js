const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dimensionValues = rawData.trim().split("\n").map(Number);

for (let loopIndex = 0; loopIndex < dimensionValues.length; loopIndex++) {
    const currentDimension = dimensionValues[loopIndex];
    const maximumValue = currentDimension * currentDimension + 1;

    if (currentDimension === 0) break;

    const gridMatrix = Array.from({ length: currentDimension }, () => Array(currentDimension).fill(-1));

    let valueToPlace = 1;
    let activeRow = Math.floor(currentDimension / 2) + 1;
    let activeCol = Math.floor(currentDimension / 2);

    activeRow = (activeRow + currentDimension) % currentDimension;
    activeCol = (activeCol + currentDimension) % currentDimension;

    gridMatrix[activeRow][activeCol] = valueToPlace;
    valueToPlace++;

    while (valueToPlace < maximumValue) {
        const potentialNextRow = (activeRow + 1 + currentDimension) % currentDimension;
        const potentialNextCol = (activeCol + 1 + currentDimension) % currentDimension;

        const [nextPositionRow, nextPositionCol] = (
            gridMatrix[potentialNextRow][potentialNextCol] !== -1
                ? [(activeRow + 1 + currentDimension) % currentDimension, (activeCol - 1 + currentDimension) % currentDimension]
                : [potentialNextRow, potentialNextCol]
        );

        activeRow = nextPositionRow;
        activeCol = nextPositionCol;

        gridMatrix[activeRow][activeCol] = valueToPlace;
        valueToPlace++;
    }

    console.log(gridMatrix.map(rowContent => rowContent.join(" ")).join("\n"));
}
