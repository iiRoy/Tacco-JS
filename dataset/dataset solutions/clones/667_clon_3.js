const fs = require('fs');

function readThermalMap() {
    const values = fs
        .readFileSync(0, 'utf8')
        .trim()
        .split(/\s+/)
        .map(Number);

    const height = values.shift();
    const width = values.shift();
    const map = [];

    while (map.length < height) {
        map.push(values.splice(0, width));
    }

    return {
        height,
        width,
        map,
    };
}

function measureLavaRegion(startRow, startColumn, planet, marked) {
    const pendingCells = [[startRow, startColumn]];
    const movement = [
        [-1, 0],
        [0, 1],
        [1, 0],
        [0, -1],
    ];

    marked[startRow][startColumn] = true;

    let regionBorder = 0;

    while (pendingCells.length > 0) {
        const [currentRow, currentColumn] =
            pendingCells.pop();

        for (const [rowOffset, columnOffset] of movement) {
            const neighborRow = currentRow + rowOffset;
            const neighborColumn =
                currentColumn + columnOffset;

            const outsideMap =
                neighborRow < 0 ||
                neighborRow >= planet.height ||
                neighborColumn < 0 ||
                neighborColumn >= planet.width;

            if (
                outsideMap ||
                planet.map[neighborRow][neighborColumn] === 0
            ) {
                regionBorder++;
                continue;
            }

            if (!marked[neighborRow][neighborColumn]) {
                marked[neighborRow][neighborColumn] = true;

                pendingCells.push([
                    neighborRow,
                    neighborColumn,
                ]);
            }
        }
    }

    return regionBorder;
}

const planet = readThermalMap();

const markedLava = Array.from(
    { length: planet.height },
    () => new Array(planet.width).fill(false)
);

let coolingWallLength = 0;

for (let row = 0; row < planet.height; row++) {
    for (let column = 0; column < planet.width; column++) {
        if (
            planet.map[row][column] === 1 &&
            !markedLava[row][column]
        ) {
            coolingWallLength += measureLavaRegion(
                row,
                column,
                planet,
                markedLava
            );
        }
    }
}

process.stdout.write(`${coolingWallLength}\n`);