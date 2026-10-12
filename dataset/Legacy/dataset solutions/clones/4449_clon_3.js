const inputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

const parseLineOfInts = (lineString) => lineString.split(' ').map(val => parseInt(val, 10));

const firstLineParts = parseLineOfInts(inputData.shift());
const gridHeight = firstLineParts[0];
const gridWidth = firstLineParts[1];
const numBlocks = parseInt(inputData.shift(), 10);

const resultGrid = Array.from({ length: gridHeight }, () => new Array(gridWidth));

let currentRow = 0;
let currentCol = 0;

const MOVE_RIGHT_DIRECTION = 'R';
const MOVE_LEFT_DIRECTION = 'L';
let currentMoveDirection = MOVE_RIGHT_DIRECTION;

const blockCounts = parseLineOfInts(inputData.shift());

const calculateNextGridPosition = (r, c, direction, widthBoundary) => {
    let nextR = r;
    let nextC = c;
    let nextDirection = direction;

    if (direction === MOVE_RIGHT_DIRECTION) {
        if (c === widthBoundary - 1) {
            nextR++;
            nextDirection = MOVE_LEFT_DIRECTION;
        } else {
            nextC++;
        }
    } else { // direction === MOVE_LEFT_DIRECTION
        if (c === 0) {
            nextR++;
            nextDirection = MOVE_RIGHT_DIRECTION;
        } else {
            nextC--;
        }
    }
    return { nextR, nextC, nextDirection };
};

for (let blockIndex = 0; blockIndex < numBlocks; blockIndex++) {
    const currentBlockCount = blockCounts[blockIndex];

    for (let fillIteration = 0; fillIteration < currentBlockCount; fillIteration++) {
        if (resultGrid[currentRow][currentCol] === undefined) {
            resultGrid[currentRow][currentCol] = blockIndex + 1;
        }

        const { nextR, nextC, nextDirection } = calculateNextGridPosition(
            currentRow,
            currentCol,
            currentMoveDirection,
            gridWidth
        );
        currentRow = nextR;
        currentCol = nextC;
        currentMoveDirection = nextDirection;
    }
}

console.log(resultGrid.map(row => row.join(' ')).join('\n'));
