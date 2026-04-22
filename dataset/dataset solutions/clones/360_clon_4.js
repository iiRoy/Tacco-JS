const retrieveInputData = () => require('fs').readFileSync('/dev/stdin', 'utf8');
const allSourceSegments = retrieveInputData().trim().split('\n');

let currentSegmentPointer = 0;

const processConnectedEntities = (startR, startC, entityType, currentMap, totalMapRows, totalMapCols) => {
    const entityQueue = [];
    entityQueue.push([startR, startC]);
    currentMap[startR][startC] = null; // Mark as processed

    const directionalDisplacements = [
        [0, -1], // West
        [0, 1],  // East
        [-1, 0], // North
        [1, 0]   // South
    ];

    while (entityQueue.length > 0) {
        const [activeR, activeC] = entityQueue.shift();

        for (const [deltaR, deltaC] of directionalDisplacements) {
            const adjacentR = activeR + deltaR;
            const adjacentC = activeC + deltaC;

            // Verify bounds
            if (adjacentR >= 0 && adjacentR < totalMapRows && adjacentC >= 0 && adjacentC < totalMapCols) {
                // Verify entity type
                if (currentMap[adjacentR][adjacentC] === entityType) {
                    currentMap[adjacentR][adjacentC] = null; // Mark as processed
                    entityQueue.push([adjacentR, adjacentC]);
                }
            }
        }
    }
};

while (true) {
    const dimensionsString = allSourceSegments[currentSegmentPointer++].split(' ').map(Number);
    const mapHeight = dimensionsString[0];
    const mapWidth = dimensionsString[1];

    if (mapHeight === 0 && mapWidth === 0) {
        break;
    }

    const topographyMatrix = Array.from({ length: mapHeight }, (_, rowIndex) => 
        allSourceSegments[currentSegmentPointer++].split('')
    );

    let formationTally = 0;

    for (let rIndex = 0; rIndex < mapHeight; rIndex++) {
        for (let cIndex = 0; cIndex < mapWidth; cIndex++) {
            const contentAtCell = topographyMatrix[rIndex][cIndex];
            if (contentAtCell === '@' || contentAtCell === '#' || contentAtCell === '*') {
                formationTally++;
                processConnectedEntities(rIndex, cIndex, contentAtCell, topographyMatrix, mapHeight, mapWidth);
            }
        }
    }
    console.log(formationTally);
}