const fileSystem = require('fs');
const inputBufferLength = fileSystem.fstatSync(process.stdin.fd).size;
const dataBuffer = Buffer.alloc(inputBufferLength);
const bytesReadCount = fileSystem.readSync(process.stdin.fd, dataBuffer, 0, inputBufferLength, 0);
const gridLines = dataBuffer.toString('utf8', 0, bytesReadCount).trim().split('\n');

const cellValue = (gridRef, r, c) => +gridRef[r]?.[c];

const moveDecisionTable = {
    'L': [
        {
            condition: (pos, gridRef) => cellValue(gridRef, pos.row * 2, pos.col - 1),
            nextDir: 'L', colDelta: -1, rowDelta: 0
        },
        {
            condition: (pos, gridRef) => (pos.row * 2 - 1 > 0) && cellValue(gridRef, pos.row * 2 - 1, pos.col),
            nextDir: 'U', colDelta: 0, rowDelta: -1
        },
        {
            condition: (pos, gridRef) => (pos.row * 2 + 1 < gridRef.length) && cellValue(gridRef, pos.row * 2 + 1, pos.col),
            nextDir: 'D', colDelta: 0, rowDelta: 1
        }
    ],
    'R': [
        {
            condition: (pos, gridRef) => cellValue(gridRef, pos.row * 2, pos.col),
            nextDir: 'R', colDelta: 1, rowDelta: 0
        },
        {
            condition: (pos, gridRef) => (pos.row * 2 + 1 < gridRef.length) && cellValue(gridRef, pos.row * 2 + 1, pos.col),
            nextDir: 'D', colDelta: 0, rowDelta: 1
        },
        {
            condition: (pos, gridRef) => (pos.row * 2 - 1 > 0) && cellValue(gridRef, pos.row * 2 - 1, pos.col),
            nextDir: 'U', colDelta: 0, rowDelta: -1
        }
    ],
    'D': [
        {
            condition: (pos, gridRef) => (pos.row * 2 + 1 < gridRef.length) && cellValue(gridRef, pos.row * 2 + 1, pos.col),
            nextDir: 'D', colDelta: 0, rowDelta: 1
        },
        {
            condition: (pos, gridRef) => cellValue(gridRef, pos.row * 2, pos.col),
            nextDir: 'R', colDelta: 1, rowDelta: 0
        },
        {
            condition: (pos, gridRef) => cellValue(gridRef, pos.row * 2, pos.col - 1),
            nextDir: 'L', colDelta: -1, rowDelta: 0
        }
    ],
    'U': [
        {
            condition: (pos, gridRef) => (pos.row * 2 - 1 > 0) && cellValue(gridRef, pos.row * 2 - 1, pos.col),
            nextDir: 'U', colDelta: 0, rowDelta: -1
        },
        {
            condition: (pos, gridRef) => cellValue(gridRef, pos.row * 2, pos.col - 1),
            nextDir: 'L', colDelta: -1, rowDelta: 0
        },
        {
            condition: (pos, gridRef) => cellValue(gridRef, pos.row * 2, pos.col),
            nextDir: 'R', colDelta: 1, rowDelta: 0
        }
    ]
};

function* pathTraversalGenerator(initialCol, initialRow, initialHeading, gridRef) {
    let currentColumn = initialCol;
    let currentRow = initialRow;
    let currentHeading = initialHeading;
    let stepsTaken = 0;

    while (true) {
        if (currentColumn === 0 && currentRow === 0 && stepsTaken > 0) {
            return;
        }

        const possibleMoves = moveDecisionTable[currentHeading];
        let moveExecuted = false;

        for (const moveOption of possibleMoves) {
            if (moveOption.condition({ col: currentColumn, row: currentRow }, gridRef)) {
                currentColumn += moveOption.colDelta;
                currentRow += moveOption.rowDelta;
                currentHeading = moveOption.nextDir;
                stepsTaken++;
                yield currentHeading;
                moveExecuted = true;
                break;
            }
        }

        if (!moveExecuted) {
            return;
        }
    }
}

function executePathfinding() {
    const startColumn = 0;
    const startRow = 0;
    const startDirection = 'R';

    const collectedPath = [];
    for (const directionStep of pathTraversalGenerator(startColumn, startRow, startDirection, gridLines)) {
        collectedPath.push(directionStep);
    }

    console.log(collectedPath.join(''));
}

executePathfinding();
