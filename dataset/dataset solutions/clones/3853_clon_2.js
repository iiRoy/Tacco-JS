'use strict';

function processInput(rawData) {
    let lineArray = rawData.split('\n');

    const dimensions = lineArray[0].split(' ');
    const gridHeight = parseInt(dimensions[0], 10);
    const gridWidth = parseInt(dimensions[1], 10);

    const charGrid = lineArray.slice(1, -1).map(gridLine => gridLine.split(''));

    const rowOffsets = [-1, 0, 1, 0];
    const colOffsets = [0, 1, 0, -1];

    let finalVerdict = 'Yes';

    for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
        for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
            if (charGrid[currentRow][currentCol] === '.') {
                continue;
            }

            let neighborCount = 0;

            for (let directionIndex = 0; directionIndex < 4; directionIndex++) {
                const nextRow = currentRow + rowOffsets[directionIndex];
                const nextCol = currentCol + colOffsets[directionIndex];

                if (nextRow < 0 || gridHeight <= nextRow) {
                    continue;
                }
                if (nextCol < 0 || gridWidth <= nextCol) {
                    continue;
                }

                if (charGrid[nextRow][nextCol] === '#') {
                    neighborCount++;
                }
            }

            if (neighborCount === 0) {
                finalVerdict = 'No';
            }
        }
    }

    console.log(finalVerdict);
}

function getInputFromFile() {
    const fileSystemModule = require('fs');
    return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
}

processInput(getInputFromFile());