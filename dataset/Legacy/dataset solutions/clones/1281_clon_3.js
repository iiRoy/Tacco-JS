process.stdin.resume();
process.stdin.setEncoding('utf-8');
let rawDataBuffer = '';

process.stdin.on('data', (chunk) => {
    rawDataBuffer += chunk;
});

process.stdin.on('end', () => {
    const inputLines = rawDataBuffer.split('\n');
    processBuildingData(inputLines);
});

const createBuildingStructure = () => {
    const buildingFloors = [];
    for (let floorIdx = 0; floorIdx < 3; floorIdx++) {
        const floorRooms = new Array(10).fill(0);
        buildingFloors.push(floorRooms);
    }
    return buildingFloors;
};

const parseEntryLine = (lineContent) => {
    return lineContent.split(' ').map(value => parseInt(value, 10));
};

const displayBuildingOccupancy = (buildingFloorsData, currentBuildingIndex, totalBuildingCount) => {
    buildingFloorsData.forEach(floorRoomsData => {
        const floorOccupancyString = floorRoomsData.map(roomOccupancyValue => ' ' + roomOccupancyValue).join('');
        console.log(floorOccupancyString);
    });
    if (currentBuildingIndex < totalBuildingCount - 1) {
        console.log('####################');
    }
};

const processBuildingData = (inputDataArray) => {
    const numEntries = parseInt(inputDataArray.shift(), 10);
    const entryList = inputDataArray.slice(0, numEntries);

    const buildingOccupancyMatrix = [];
    for (let buildingIdx = 0; buildingIdx < 4; buildingIdx++) {
        buildingOccupancyMatrix.push(createBuildingStructure());
    }

    entryList.forEach(entryLine => {
        const parsedEntry = parseEntryLine(entryLine);
        const targetBuildingIndex = parsedEntry[0] - 1;
        const targetFloorIndex = parsedEntry[1] - 1;
        const targetRoomIndex = parsedEntry[2] - 1;
        const occupancyChange = parsedEntry[3];
        buildingOccupancyMatrix[targetBuildingIndex][targetFloorIndex][targetRoomIndex] += occupancyChange;
    });

    const totalBuildings = buildingOccupancyMatrix.length;
    buildingOccupancyMatrix.forEach((buildingFloors, buildingIndex) => {
        displayBuildingOccupancy(buildingFloors, buildingIndex, totalBuildings);
    });
};
