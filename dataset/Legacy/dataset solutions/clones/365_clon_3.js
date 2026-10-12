const BOARD_DIMENSION = 10;
const WATER_ZONE_RADIUS = 1;

const KNIGHT_MOVES = [
    [-1, -2], [0, -2], [1, -2],
    [-2, -1], [2, -1],
    [-2, 0], [2, 0],
    [-2, 1], [2, 1],
    [-1, 2], [0, 2], [1, 2]
];

const getCellKey = (x, y) => `${x},${y}`;

const isOutOfBounds = (x, y) => x < 0 || y < 0 || x >= BOARD_DIMENSION || y >= BOARD_DIMENSION;

let maxReachedDepth = 0;
let requiredDepth = 0;

function explorePath(currX, currY, currentDepth, waterObstacleCoordinates) {
    maxReachedDepth = Math.max(maxReachedDepth, currentDepth);

    if (maxReachedDepth === requiredDepth) {
        return;
    }

    const waterCoordBaseIndex = currentDepth * 2;
    const waterObstacleX = waterObstacleCoordinates[waterCoordBaseIndex];
    const waterObstacleY = waterObstacleCoordinates[waterCoordBaseIndex + 1];

    const waterInteractionZone = new Set();
    for (let rowOffset = -WATER_ZONE_RADIUS; rowOffset <= WATER_ZONE_RADIUS; rowOffset++) {
        for (let colOffset = -WATER_ZONE_RADIUS; colOffset <= WATER_ZONE_RADIUS; colOffset++) {
            const zoneX = waterObstacleX + rowOffset;
            const zoneY = waterObstacleY + colOffset;
            waterInteractionZone.add(getCellKey(zoneX, zoneY));
        }
    }

    for (const [deltaX, deltaY] of KNIGHT_MOVES) {
        const nextX = currX + deltaX;
        const nextY = currY + deltaY;

        if (isOutOfBounds(nextX, nextY)) {
            continue;
        }

        if (waterInteractionZone.has(getCellKey(nextX, nextY))) {
            explorePath(nextX, nextY, currentDepth + 1, waterObstacleCoordinates);
        }
    }
}

const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = fileContent.trim().split("\n");

while (true) {
    const startCoordinatesStr = inputLines.shift();
    const startCoordinates = startCoordinatesStr.split(" ").map(Number);

    const initialX = startCoordinates[0];
    const initialY = startCoordinates[1];

    if (initialX === 0 && initialY === 0) {
        break;
    }

    requiredDepth = Number(inputLines.shift());
    const waterObstacleCoordinates = inputLines.shift().split(" ").map(Number);

    maxReachedDepth = 0;

    explorePath(initialX, initialY, 0, waterObstacleCoordinates);

    console.log((maxReachedDepth === requiredDepth) ? "OK" : "NA");
}
