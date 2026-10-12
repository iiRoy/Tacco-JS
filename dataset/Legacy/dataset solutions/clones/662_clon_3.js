const FS_MODULE = require('fs');
const STD_IN_PATH = '/dev/stdin';
const TERMINATION_SIGNAL = '0 0';
const COORD_SEPARATOR = ',';

function extractGridAndPlaneCounts(configLine) {
    const numericParts = configLine.split(" ").map(Number);
    return {
        gridDimension: numericParts[0],
        planeDefinitionsCount: numericParts[1]
    };
}

function generateCoordinateKey(xVal, yVal, zVal) {
    return `${xVal}${COORD_SEPARATOR}${yVal}${COORD_SEPARATOR}${zVal}`;
}

let rawData = FS_MODULE.readFileSync(STD_IN_PATH, 'utf8');
let lineBuffer = rawData.trim().split("\n");

while (true) {
    let currentConfigLine = lineBuffer.shift();

    if (currentConfigLine === TERMINATION_SIGNAL) {
        break;
    }

    const { gridDimension: N, planeDefinitionsCount: H } = extractGridAndPlaneCounts(currentConfigLine);

    let occupiedCells = {};

    for (let planeIndex = 0; planeIndex < H; planeIndex++) {
        let planeDefinition = lineBuffer.shift().split(" ");
        let planeType = planeDefinition[0];
        let fixedCoordA = Number(planeDefinition[1]);
        let fixedCoordB = Number(planeDefinition[2]);

        switch (planeType) {
            case "xy":
                for (let iterCoordZ = 1; iterCoordZ <= N; iterCoordZ++) {
                    occupiedCells[generateCoordinateKey(fixedCoordA, fixedCoordB, iterCoordZ)] = true;
                }
                break;
            case "xz":
                for (let iterCoordY = 1; iterCoordY <= N; iterCoordY++) {
                    occupiedCells[generateCoordinateKey(fixedCoordA, iterCoordY, fixedCoordB)] = true;
                }
                break;
            case "yz":
                for (let iterCoordX = 1; iterCoordX <= N; iterCoordX++) {
                    occupiedCells[generateCoordinateKey(iterCoordX, fixedCoordA, fixedCoordB)] = true;
                }
                break;
        }
    }

    const totalCubes = Math.pow(N, 3);
    const uniqueOccupiedCount = Object.keys(occupiedCells).length;
    console.log(totalCubes - uniqueOccupiedCount);
}
