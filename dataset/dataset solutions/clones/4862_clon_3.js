"use strict";

const parseDimensions = (dimensionString) => {
    const dimensionParts = dimensionString.split(" ");
    const rowCount = parseInt(dimensionParts[0], 10);
    const colCount = parseInt(dimensionParts[1], 10);
    return { rowCount, colCount };
};

const processInput = (rawInputData) => {
    const searchTarget = "snuke";
    const inputLines = rawInputData.trim().split("\n");

    const { rowCount: numRows, colCount: numCols } = parseDimensions(inputLines[0]);

    const gridData = inputLines.slice(1, numRows + 1).map(lineContent => lineContent.split(" "));
    const columnIdentifierLabels = "ABCDEFGHIJ".split("");

    for (let current_row_idx = 0; current_row_idx < numRows; current_row_idx++) {
        const rowElements = gridData[current_row_idx];
        for (let current_col_idx = 0; current_col_idx < numCols; current_col_idx++) {
            const cellValue = rowElements[current_col_idx];
            if (cellValue === searchTarget) {
                const outputString = columnIdentifierLabels[current_col_idx] + (current_row_idx + 1);
                console.log(outputString);
            }
        }
    }
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
