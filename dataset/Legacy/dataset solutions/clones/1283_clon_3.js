const createEmptyRoomRow = () => Array(10).fill(0);

const createEmptyFloor = () => Array.from({ length: 3 }, createEmptyRoomRow);

let buildingFloors = Array.from({ length: 4 }, createEmptyFloor);

const fileSystemModule = require('fs');
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.split("\n");

const parseAndAdjustOccupancyData = (lineString) => {
    const parsedLineParts = lineString.split(" ").map(Number);
    const targetBuildingIndex = parsedLineParts[0] - 1;
    const targetFloorIndex = parsedLineParts[1] - 1;
    const targetRoomIndex = parsedLineParts[2] - 1;
    const occupantDelta = parsedLineParts[3];
    return { targetBuildingIndex, targetFloorIndex, targetRoomIndex, occupantDelta };
};

inputLines.slice(1).forEach(currentLine => {
    const { targetBuildingIndex, targetFloorIndex, targetRoomIndex, occupantDelta } = parseAndAdjustOccupancyData(currentLine);
    buildingFloors[targetBuildingIndex][targetFloorIndex][targetRoomIndex] += occupantDelta;
});

const buildingSeparator = "####################";

const displayBuildingOccupancy = (buildingData, currentBuildingIdx, totalBuildingCount) => {
    buildingData.forEach(floorData => {
        console.log(floorData.join(" "));
    });

    if (currentBuildingIdx < totalBuildingCount - 1) {
        console.log(buildingSeparator);
    }
};

buildingFloors.forEach((buildingData, idx) => {
    displayBuildingOccupancy(buildingData, idx, buildingFloors.length);
});
