'use strict';

const parseInteger = (str) => parseInt(str, 10);

const processInput = (rawData) => {
    const lines = rawData.split('\n');

    const dimensionStrings = lines[0].split(' ');
    const gridHeight = parseInteger(dimensionStrings[0]);
    const gridWidth = parseInteger(dimensionStrings[1]);

    const grid = [];
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        const rowValuesStr = lines[rowIdx + 1].split(' ');
        grid[rowIdx] = rowValuesStr.map(parseInteger);
    }

    const moveOperations = [];

    const recordAndApplyMove = (sourceCol, sourceRow, targetCol, targetRow) => {
        moveOperations.push([sourceCol, sourceRow, targetCol, targetRow].join(' '));
        grid[targetRow][targetCol]++;
        grid[sourceRow][sourceCol]--;
    };

    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            const currentCellValue = grid[rowIdx][colIdx];

            if (currentCellValue % 2 !== 0) {
                const canMoveRight = (colIdx + 1 < gridWidth);
                const canMoveDown = (rowIdx + 1 < gridHeight);

                if (canMoveRight) {
                    recordAndApplyMove(colIdx, rowIdx, colIdx + 1, rowIdx);
                } else if (canMoveDown) {
                    recordAndApplyMove(colIdx, rowIdx, colIdx, rowIdx + 1);
                }
            }
        }
    }

    console.log(moveOperations.length);
    console.log(moveOperations.join('\n') + '\n');
};

const isDevelopmentMode = false;

if (isDevelopmentMode) {
    processInput('2 3\n1 2 3\n0 1 1\n');
} else {
    processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
}
