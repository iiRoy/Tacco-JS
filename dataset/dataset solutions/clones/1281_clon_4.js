const lineByLineProcessor = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

let entryCount = -1;
const inputDataLines = [];

const buildingFloorRoomCounts = new Map();

lineByLineProcessor.on('line', (currentLineData) => {
    if (entryCount === -1) {
        entryCount = parseInt(currentLineData, 10);
    } else {
        inputDataLines.push(currentLineData);
        if (inputDataLines.length === entryCount) {
            lineByLineProcessor.close();
        }
    }
});

lineByLineProcessor.on('close', () => {
    processBuildingRecords(inputDataLines);
});

const processBuildingRecords = (recordEntries) => {
    recordEntries.forEach(currentRecordString => {
        const parsedRecord = currentRecordString.split(' ').map(Number);
        const [buildingIndex, floorIndex, roomIndex, valueChange] = parsedRecord;

        if (!buildingFloorRoomCounts.has(buildingIndex)) {
            buildingFloorRoomCounts.set(buildingIndex, new Map());
        }
        const floorMapForBuilding = buildingFloorRoomCounts.get(buildingIndex);

        if (!floorMapForBuilding.has(floorIndex)) {
            floorMapForBuilding.set(floorIndex, new Map());
        }
        const roomMapForFloor = floorMapForBuilding.get(floorIndex);

        const currentRoomValue = roomMapForFloor.get(roomIndex) || 0;
        roomMapForFloor.set(roomIndex, currentRoomValue + valueChange);
    });

    const maxBuildings = 4;
    const maxFloors = 3;
    const maxRooms = 10;
    const outputSeparator = '####################';

    for (let bldIdx = 1; bldIdx <= maxBuildings; bldIdx++) {
        const currentBldMap = buildingFloorRoomCounts.get(bldIdx) || new Map();
        for (let flrIdx = 1; flrIdx <= maxFloors; flrIdx++) {
            const currentFlrMap = currentBldMap.get(flrIdx) || new Map();
            const roomValuesBuffer = [];
            for (let rmIdx = 1; rmIdx <= maxRooms; rmIdx++) {
                const roomCount = currentFlrMap.get(rmIdx) || 0;
                roomValuesBuffer.push(roomCount);
            }
            console.log(roomValuesBuffer.map(val => ' ' + val).join(''));
        }
        if (bldIdx < maxBuildings) {
            console.log(outputSeparator);
        }
    }
};