let incomingData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataSegment) {
  incomingData += dataSegment;
});
process.stdin.on('end', function() {
  const processedRecords = incomingData.split('\n').filter(line => line.trim() !== '');
  processGridOperations(processedRecords);
});

function processGridOperations(recordSet) {
  const displacementSets = {
    first: [[0, 1], [-1, 0], [0, 0], [1, 0], [0, -1]],
    second: [[-1, 1], [1, 1], [-1, -1], [1, -1]],
    third: [[0, 2], [0, -2], [2, 0], [-2, 0]]
  };

  const cumulativeImpactMaps = {
    '1': displacementSets.first,
    '2': displacementSets.first.concat(displacementSets.second),
    '3': displacementSets.first.concat(displacementSets.second).concat(displacementSets.third)
  };

  const cellTally = new Map();

  recordSet.reduceRight((currentTally, dataLine) => {
    const [xCoordChar, , yCoordChar, , operationTag] = dataLine;
    const initialX = parseInt(xCoordChar, 10);
    const initialY = parseInt(yCoordChar, 10);

    const activeDisplacements = cumulativeImpactMaps[operationTag];

    activeDisplacements.forEach(([deltaX, deltaY]) => {
      const finalX = initialX + deltaX;
      const finalY = initialY + deltaY;
      const coordinateLabel = `${finalX},${finalY}`;
      currentTally.set(coordinateLabel, (currentTally.get(coordinateLabel) || 0) + 1);
    });

    return currentTally;
  }, cellTally);

  let vacantLocations = 0;
  let peakOccupancy = 0;

  for (let gridY = 0; gridY < 10; ++gridY) {
    for (let gridX = 0; gridX < 10; ++gridX) {
      const currentCellLabel = `${gridX},${gridY}`;
      const currentCellCount = cellTally.get(currentCellLabel) || 0;

      if (currentCellCount === 0) {
        vacantLocations++;
      }
      peakOccupancy = Math.max(peakOccupancy, currentCellCount);
    }
  }

  console.log(vacantLocations);
  console.log(peakOccupancy);
}