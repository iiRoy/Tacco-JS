const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const dimensionsString = inputData.shift().split(' ');
const gridHeight = Number(dimensionsString.shift());
const gridWidth = Number(dimensionsString.shift());

const segmentCount = Number(inputData.shift());
const segmentLengths = inputData.shift().split(' ').map(Number);

const resultMatrix = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

const movementHandlers = new Map([
    [1, (r, c, w) => c < w - 1 ? { nextR: r, nextC: c + 1, nextDir: 1 } : { nextR: r + 1, nextC: c, nextDir: -1 }],
    [-1, (r, c, w) => c > 0 ? { nextR: r, nextC: c - 1, nextDir: -1 } : { nextR: r + 1, nextC: c, nextDir: 1 }]
]);

let currentGridRow = 0;
let currentGridCol = 0;
let movementDirection = 1;
let currentSegmentIdx = 0;
let remainingCellsInSegment = segmentLengths[0];

const totalCellsToProcess = gridHeight * gridWidth;

for (let cellIdx = 0; cellIdx < totalCellsToProcess; cellIdx++) {
    if (remainingCellsInSegment === 0) {
        currentSegmentIdx++;
        remainingCellsInSegment = segmentLengths[currentSegmentIdx];
    }
    resultMatrix[currentGridRow][currentGridCol] = currentSegmentIdx + 1;
    remainingCellsInSegment--;

    const { nextR, nextC, nextDir } = movementHandlers.get(movementDirection)(currentGridRow, currentGridCol, gridWidth);
    currentGridRow = nextR;
    currentGridCol = nextC;
    movementDirection = nextDir;
}

console.log(resultMatrix.map(row => row.join(' ')).join('\n'));
