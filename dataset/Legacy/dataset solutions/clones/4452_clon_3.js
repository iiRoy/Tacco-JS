"use strict";

const parseGridDimensions = (dimensionLine) => {
    const dimensionParts = dimensionLine.split(" ");
    const gridHeight = Number(dimensionParts[0]);
    const gridWidth = Number(dimensionParts[1]);
    return { gridHeight, gridWidth };
};

const processInput = (inputString) => {
    const inputLines = inputString.trim().split("\n");

    const { gridHeight, gridWidth } = parseGridDimensions(inputLines[0]);

    const totalGridCells = gridHeight * gridWidth;

    if (totalGridCells === 1) {
        console.log(1);
        return;
    }

    const numberOfColorTypes = Number(inputLines[1]);
    const colorCountsArray = inputLines[2].split(" ").map(Number);

    const allColorsFlattened = colorCountsArray.flatMap((countValue, typeIndex) => {
        const colorIdentifier = typeIndex + 1;
        return Array(countValue).fill(colorIdentifier);
    });

    const finalOutputRows = [];
    let currentProcessingRow = [];

    for (let cellLinearPosition = 0; cellLinearPosition < allColorsFlattened.length; ++cellLinearPosition) {
        const currentCellColor = allColorsFlattened[cellLinearPosition];
        currentProcessingRow.push(currentCellColor);

        const isEndOfCurrentRowSegment = (cellLinearPosition + 1) % gridWidth === 0;

        if (isEndOfCurrentRowSegment) {
            const shouldReverseThisRowSegment = cellLinearPosition % 2 !== 0;

            if (shouldReverseThisRowSegment) {
                currentProcessingRow.reverse();
            }

            finalOutputRows.push(currentProcessingRow.join(" "));
            currentProcessingRow = [];
        }
    }

    console.log(finalOutputRows.join("\n"));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
