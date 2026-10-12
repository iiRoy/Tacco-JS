const config = { input: '/dev/stdin', newline: '\n' };

const assert = require('assert');

const fileContent = require('fs').readFileSync(config.input, 'ascii');
const rawLines = fileContent.split(config.newline);

const dimensionsHW = rawLines[0].split(' ').map(Number);
const gridHeight = dimensionsHW[0];
const gridWidth = dimensionsHW[1];

const gridData = rawLines.slice(1, 1 + gridHeight);

const dimensionsRC = rawLines[1 + gridHeight].split(' ').map(Number);
const patternHeight = dimensionsRC[0];
const patternWidth = dimensionsRC[1];

const patternData = rawLines.slice(1 + gridHeight + 1, 1 + gridHeight + 1 + patternHeight);

rawLines = null;

if (gridHeight < patternHeight || gridWidth < patternWidth) {
    process.exit();
}

const matchAccumulator = Array.from({ length: gridHeight - patternHeight + 1 }, () =>
    Array.from({ length: gridWidth - patternWidth + 1 }, () => 0)
);

for (let fieldRowIndex = 0; fieldRowIndex < gridHeight; fieldRowIndex++) {
    const patternRowStart = Math.max(0, fieldRowIndex - gridHeight + patternHeight);
    for (let patternRowIndex = patternRowStart; patternRowIndex < patternHeight && patternRowIndex <= fieldRowIndex; patternRowIndex++) {
        const currentFieldRowString = gridData[fieldRowIndex];
        const currentPatternRowString = patternData[patternRowIndex];

        for (let colOffset = 0; colOffset <= gridWidth - patternWidth; colOffset++) {
            if (currentFieldRowString.substring(colOffset, colOffset + patternWidth) === currentPatternRowString) {
                matchAccumulator[fieldRowIndex - patternRowIndex][colOffset]++;
            }
        }
    }
}

for (let resultRow = 0; resultRow < matchAccumulator.length; resultRow++) {
    for (let resultCol = 0; resultCol < matchAccumulator[resultRow].length; resultCol++) {
        if (matchAccumulator[resultRow][resultCol] === patternHeight) {
            console.log('%s %s', resultRow, resultCol);
        }
    }
}
