const fileSys = require('fs');
const dataSize = fileSys.fstatSync(process.stdin.fd).size;
const inputBuffer = Buffer.alloc(dataSize);
const readBytesCount = fileSys.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);
const gridData = inputBuffer.toString('utf8', 0, readBytesCount).trim().split('\n');

function checkPathSegment(cellX, cellY, segmentType, mazeGrid) {
    let gridRow, gridCol;
    let explicitRowBoundaryCheck = true;

    switch (segmentType) {
        case 'D':
            gridRow = cellY * 2 + 1;
            gridCol = cellX * 2;
            explicitRowBoundaryCheck = (gridRow < mazeGrid.length);
            break;
        case 'U':
            gridRow = cellY * 2 - 1;
            gridCol = cellX * 2;
            explicitRowBoundaryCheck = (gridRow > 0);
            break;
        case 'L':
            gridRow = cellY * 2;
            gridCol = cellX * 2 - 1;
            break;
        case 'R':
            gridRow = cellY * 2;
            gridCol = cellX * 2;
            break;
        default:
            return false;
    }

    if (!explicitRowBoundaryCheck) {
        return false;
    }

    const maxCol = mazeGrid[0] ? mazeGrid[0].length : 0;
    return gridRow >= 0 && gridRow < mazeGrid.length &&
           gridCol >= 0 && gridCol < maxCol &&
           +mazeGrid[gridRow][gridCol];
}

const movementStrategies = {
    'L': [
        { segment: 'D', nextDirection: 'D', deltaX: 0, deltaY: 1 },
        { segment: 'L', nextDirection: 'L', deltaX: -1, deltaY: 0 },
        { segment: 'U', nextDirection: 'U', deltaX: 0, deltaY: -1 },
        { segment: 'R', nextDirection: 'R', deltaX: 1, deltaY: 0 }
    ],
    'R': [
        { segment: 'U', nextDirection: 'U', deltaX: 0, deltaY: -1 },
        { segment: 'R', nextDirection: 'R', deltaX: 1, deltaY: 0 },
        { segment: 'D', nextDirection: 'D', deltaX: 0, deltaY: 1 },
        { segment: 'L', nextDirection: 'L', deltaX: -1, deltaY: 0 }
    ],
    'D': [
        { segment: 'R', nextDirection: 'R', deltaX: 1, deltaY: 0 },
        { segment: 'D', nextDirection: 'D', deltaX: 0, deltaY: 1 },
        { segment: 'L', nextDirection: 'L', deltaX: -1, deltaY: 0 },
        { segment: 'U', nextDirection: 'U', deltaX: 0, deltaY: -1 }
    ],
    'U': [
        { segment: 'L', nextDirection: 'L', deltaX: -1, deltaY: 0 },
        { segment: 'U', nextDirection: 'U', deltaX: 0, deltaY: -1 },
        { segment: 'R', nextDirection: 'R', deltaX: 1, deltaY: 0 },
        { segment: 'D', nextDirection: 'D', deltaX: 0, deltaY: 1 }
    ]
};

function processMaze() {
    let currentPosition = { x: 0, y: 0, direction: 'R' };
    const pathTrace = [];

    do {
        const currentDirectionRules = movementStrategies[currentPosition.direction];
        
        const chosenMove = currentDirectionRules.find(rule => 
            checkPathSegment(currentPosition.x, currentPosition.y, rule.segment, gridData)
        );

        currentPosition.direction = chosenMove.nextDirection;
        currentPosition.x += chosenMove.deltaX;
        currentPosition.y += chosenMove.deltaY;
        
        pathTrace.push(currentPosition.direction);

    } while (currentPosition.x !== 0 || currentPosition.y !== 0);

    console.log(pathTrace.join(''));
}

processMaze();
