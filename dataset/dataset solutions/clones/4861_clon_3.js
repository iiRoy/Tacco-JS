"use strict";

const parseDimensions = (dimensionLine) => {
    const dimensionParts = dimensionLine.split(" ");
    const parsedHeight = parseInt(dimensionParts[0], 10);
    const parsedWidth = parseInt(dimensionParts[1], 10);
    return { height: parsedHeight, width: parsedWidth };
};

const processGridRow = (rowString) => {
    return rowString.split(" ");
};

const findTargetWordCoordinates = (gridData, targetValue, numRows, numCols) => {
    for (let rowIndex = 0; rowIndex < numRows; rowIndex++) {
        for (let colIndex = 0; colIndex < numCols; colIndex++) {
            if (gridData[rowIndex][colIndex] === targetValue) {
                return { row: rowIndex, col: colIndex };
            }
        }
    }
    return null;
};

const main = (inputContent) => {
    const inputLines = inputContent.trim().split("\n");

    const { height: gridHeight, width: gridWidth } = parseDimensions(inputLines[0]);

    const gridWords = inputLines.slice(1, gridHeight + 1).map(processGridRow);

    const columnIdentifiers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const snukePosition = findTargetWordCoordinates(gridWords, "snuke", gridHeight, gridWidth);

    if (snukePosition !== null) {
        const { row: foundRow, col: foundCol } = snukePosition;
        const columnChar = columnIdentifiers[foundCol];
        const oneBasedRowNumber = foundRow + 1;

        const resultString = columnChar + oneBasedRowNumber;
        console.log(resultString);
    }
};

main(require('fs').readFileSync('/dev/stdin', 'utf8'));
