(function(rawInputString) {
  function createZeroArray(arraySize) {
    const newArr = new Array(arraySize);
    for (let idx = 0; idx < arraySize; idx++) {
      newArr[idx] = 0;
    }
    return newArr;
  }

  function processBuildingUpdates(buildingStructure, updateInstructions) {
    updateInstructions.forEach(function(currentInstructionSet) {
      const floorIndex = currentInstructionSet[0] - 1;
      const roomIndex = currentInstructionSet[1] - 1;
      const unitIndex = currentInstructionSet[2] - 1;
      const valueToAdd = currentInstructionSet[3];

      buildingStructure[floorIndex][roomIndex][unitIndex] += valueToAdd;
    });
    return buildingStructure;
  }

  const inputLines = rawInputString.toString().trim().split('\n');
  const parsedNumericData = inputLines.map(function(lineStr) {
    return lineStr.split(' ').map(Number);
  });

  const buildingGrid = Array.from({
    length: 4
  }, () =>
    Array.from({
      length: 3
    }, () =>
      createZeroArray(10)
    )
  );

  parsedNumericData.shift();
  console.log(processBuildingUpdates(buildingGrid, parsedNumericData));
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
