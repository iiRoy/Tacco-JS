"use strict";

const processInput = rawContent => {
    const contentLines = rawContent.trim().split('\n');
    const [gridHeight, gridWidth] = contentLines[0].split(' ').map(Number);

    const columnLabels = Array.from({ length: 10 }, (_, idx) => String.fromCharCode(65 + idx));

    const foundCoordinates = contentLines.slice(1, gridHeight + 1)
        .flatMap((rowContent, rowIndex) => {
            return rowContent.split(' ').map((cellValue, colIndex) => ({
                val: cellValue,
                r: rowIndex,
                c: colIndex
            }));
        })
        .filter(cell => cell.val === 'snuke')
        .map(cell => columnLabels[cell.c] + (cell.r + 1));

    foundCoordinates.forEach(locationString => console.log(locationString));
};

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
