'use strict';
(function(inputSourceContent) {
  const createInitializedRoomRow = (roomCount, initialValue = 0) => {
    return Array.from({
      length: roomCount
    }, () => initialValue);
  };

  function constructBuildingLayout(numBuildings, numFloors, numRoomsPerFloor) {
    const buildingStructure = [];

    for (let buildingIndex = 0; buildingIndex < numBuildings; buildingIndex++) {
      const currentFloorLayout = [];
      for (let floorIndex = 0; floorIndex < numFloors; floorIndex++) {
        currentFloorLayout.push(createInitializedRoomRow(numRoomsPerFloor));
      }
      buildingStructure.push(currentFloorLayout);
    }

    const displaySeparator = Array(numRoomsPerFloor * 2).fill('#').join('');
    buildingStructure.unshift(displaySeparator);

    return buildingStructure;
  }

  function applyUpdatesAndFormatBuilding(currentBuildingState, roomUpdateInstructions) {
    const separatorLineForOutput = currentBuildingState.shift();

    const performRoomModification = (updateDetails) => {
      const [targetBuildingId, targetFloorId, targetRoomId, newValue] = updateDetails;

      const actualBuildingIndex = targetBuildingId - 1;
      const actualFloorIndex = targetFloorId - 1;
      const actualRoomIndex = targetRoomId - 1;

      if (currentBuildingState[actualBuildingIndex] &&
        currentBuildingState[actualBuildingIndex][actualFloorIndex]) {
        currentBuildingState[actualBuildingIndex][actualFloorIndex].splice(actualRoomIndex, 1, newValue);
      }
    };

    roomUpdateInstructions.forEach(performRoomModification);

    const formatSingleRoomRow = (roomValues) => ' ' + roomValues.join(' ');

    const formattedBuildingSections = currentBuildingState.map(function(floorDataArray) {
      return floorDataArray.map(formatSingleRoomRow).join('\n');
    });

    return formattedBuildingSections.join('\n' + separatorLineForOutput + '\n');
  }

  const standardInputPath = '/dev/stdin';

  const getParsedInputLines = (inputContent) => {
    return inputContent.toString().trim().split('\n');
  };

  const rawInputLines = getParsedInputLines(inputSourceContent);

  const parseNumericLine = (lineString) => lineString.split(' ').map(Number);

  const allParsedInputData = rawInputLines.map(parseNumericLine);

  allParsedInputData.shift();
  const roomUpdateInstructions = allParsedInputData;

  const initialBuildingGrid = constructBuildingLayout(4, 3, 10);

  const finalFormattedOutput = applyUpdatesAndFormatBuilding(initialBuildingGrid, roomUpdateInstructions);

  console.log(finalFormattedOutput);

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
