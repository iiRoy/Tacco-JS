const inputPayload = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');
const configLine = inputPayload.shift().split(' ');
const matrixRows = Number(configLine.shift());
const matrixCols = Number(configLine.shift());
const totalSegments = Number(inputPayload.shift());

const segmentData = inputPayload.shift().split(' ').map(Number);

const finalMatrix = Array.from({ length: matrixRows }, () => new Array(matrixCols));

function* serpentineCoordinates(rows, cols) {
    let currentRow = 0;
    let currentCol = 0;
    let movingRight = true; 

    for (let k = 0; k < rows * cols; k++) {
        yield [currentRow, currentCol];

        if (movingRight) {
            if (currentCol === cols - 1) { 
                currentRow++;
                movingRight = false;
            } else {
                currentCol++;
            }
        } else { 
            if (currentCol === 0) { 
                currentRow++;
                movingRight = true;
            } else {
                currentCol--;
            }
        }
    }
}

const cellIterator = serpentineCoordinates(matrixRows, matrixCols);

segmentData.forEach((segmentCount, segmentIndex) => {
    const valueToFill = segmentIndex + 1;
    for (let fillIndex = 0; fillIndex < segmentCount; fillIndex++) {
        const coordPair = cellIterator.next().value;
        const r = coordPair[0];
        const c = coordPair[1];
        finalMatrix[r][c] = valueToFill;
    }
});

const outputLines = finalMatrix.map(row => row.join(' '));
console.log(outputLines.join('\n'));