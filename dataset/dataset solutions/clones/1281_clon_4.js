process.stdin.resume();
process.stdin.setEncoding('utf-8');
let accumulatedInput = '';

process.stdin.on('data', (dataChunk) => {
    accumulatedInput += dataChunk;
});

process.stdin.on('end', () => {
    let inputLines = accumulatedInput.split('\n');
    processBuildingData(inputLines);
});

function processBuildingData(inputLines) {
    let floorCount = Number(inputLines.shift());
    let tenantEntries = inputLines.slice(0, floorCount);

    let buildingMatrix = Array.from({ length: 4 }, () =>
        Array.from({ length: 3 }, () =>
            Array.from({ length: 10 }, () => 0)
        )
    );

    for (const entryLine of tenantEntries) {
        const [buildingIdx, floorIdx, roomIdx, tenantChange] = entryLine.split(' ').map(Number);
        buildingMatrix[buildingIdx - 1][floorIdx - 1][roomIdx - 1] += tenantChange;
    }

    for (let b = 0; b < buildingMatrix.length; b++) {
        const currentBuilding = buildingMatrix[b];
        for (let f = 0; f < currentBuilding.length; f++) {
            const currentFloor = currentBuilding[f];
            const floorOccupancyString = currentFloor.map(occupantCount => ` ${occupantCount}`).join('');
            console.log(floorOccupancyString);
        }
        if (b < buildingMatrix.length - 1) {
            console.log('####################');
        }
    }
}
