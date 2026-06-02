(function(inputContent) {
  const createZeroFilledArray = (countOfElements) =>
    Array.from({
      length: countOfElements
    }, () => 0);

  const applyOccupancyChanges = (structureMatrix, movementRecords) => {
    movementRecords.forEach((recordEntry) => {
      const [buildingId, floorId, roomId, changeValue] = recordEntry;
      structureMatrix[buildingId - 1][floorId - 1][roomId - 1] += changeValue;
    });
    return structureMatrix;
  };

  const rawInputLines = inputContent.toString().trim().split('\n');

  const processedMovementData = rawInputLines.reduce((accumulator, currentLine, lineIndex) => {
    if (lineIndex === 0) {
      return accumulator; // Skip the initial count line
    }
    accumulator.push(currentLine.split(' ').map(Number));
    return accumulator;
  }, []);

  const multiDimensionalBuilding = Array.from({
    length: 4
  }, () =>
    Array.from({
      length: 3
    }, () =>
      createZeroFilledArray(10)
    )
  );

  console.log(applyOccupancyChanges(multiDimensionalBuilding, processedMovementData));

})(require('fs').readFileSync('/dev/stdin', 'utf8'));
