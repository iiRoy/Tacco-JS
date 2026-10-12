const fileSystem = require('fs');

const planetaryReadings = fileSystem
    .readFileSync(0, 'utf8')
    .trim()
    .split(/\s+/)
    .map(Number);

const mapHeight = planetaryReadings[0];
const mapWidth = planetaryReadings[1];

let readingIndex = 2;

const planetarySurface = Array.from(
    { length: mapHeight },
    () => Array.from(
        { length: mapWidth },
        () => planetaryReadings[readingIndex++]
    )
);

const analyzedCells = Array.from(
    { length: mapHeight },
    () => new Array(mapWidth).fill(false)
);

const movements = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
];

function inspectLava(cellRow, cellColumn) {
    if (
        cellRow < 0 ||
        cellRow >= mapHeight ||
        cellColumn < 0 ||
        cellColumn >= mapWidth
    ) {
        return 1;
    }

    if (planetarySurface[cellRow][cellColumn] === 0) {
        return 1;
    }

    if (analyzedCells[cellRow][cellColumn]) {
        return 0;
    }

    analyzedCells[cellRow][cellColumn] = true;

    let coolingBorder = 0;

    for (const [verticalMove, horizontalMove] of movements) {
        coolingBorder += inspectLava(
            cellRow + verticalMove,
            cellColumn + horizontalMove
        );
    }

    return coolingBorder;
}

let requiredBarrier = 0;

for (let cellRow = 0; cellRow < mapHeight; cellRow++) {
    for (
        let cellColumn = 0;
        cellColumn < mapWidth;
        cellColumn++
    ) {
        if (
            planetarySurface[cellRow][cellColumn] === 1 &&
            !analyzedCells[cellRow][cellColumn]
        ) {
            requiredBarrier += inspectLava(
                cellRow,
                cellColumn
            );
        }
    }
}

console.log(requiredBarrier);