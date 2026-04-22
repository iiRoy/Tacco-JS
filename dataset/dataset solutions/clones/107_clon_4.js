let incomingDataStream = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunkOfData) {
  incomingDataStream += chunkOfData;
});

process.stdin.on('end', function() {
  const parsedLines = incomingDataStream.split('\n').filter(Boolean);
  calculateGridMetrics(parsedLines);
});

function calculateGridMetrics(dataEvents) {
  const activityRegistry = new Map();

  const centralImpacts = [[0,0], [0,1], [0,-1], [1,0], [-1,0]];
  const diagonalImpacts = [[1,1], [1,-1], [-1,1], [-1,-1]];
  const remoteImpacts = [[0,2], [0,-2], [2,0], [-2,0]];

  const influenceConfigurations = {
    '1': [...centralImpacts],
    '2': [...centralImpacts, ...diagonalImpacts],
    '3': [...centralImpacts, ...diagonalImpacts, ...remoteImpacts]
  };

  dataEvents.forEach(eventRecord => {
    const numericParts = eventRecord.match(/\d+/g);
    if (!numericParts || numericParts.length < 3) {
        return;
    }
    
    const baseCoordX = parseInt(numericParts[0]) + 2;
    const baseCoordY = parseInt(numericParts[1]) + 2;
    const impactKind = numericParts[2];

    const currentInfluencePattern = influenceConfigurations[impactKind];

    if (currentInfluencePattern) {
      currentInfluencePattern.forEach(([offsetX, offsetY]) => {
        const affectedX = baseCoordX + offsetX;
        const affectedY = baseCoordY + offsetY;
        const gridKey = `${affectedX},${affectedY}`;
        activityRegistry.set(gridKey, (activityRegistry.get(gridKey) || 0) + 1);
      });
    }
  });

  let untouchedCells = 0;
  let peakActivity = 0;

  Array.from({ length: 10 }, (_, yIdx) => yIdx + 2)
    .forEach(currentGridY => {
      Array.from({ length: 10 }, (_, xIdx) => xIdx + 2)
        .forEach(currentGridX => {
          const cellIdentifier = `${currentGridX},${currentGridY}`;
          const cellValue = activityRegistry.get(cellIdentifier) || 0;

          if (cellValue === 0) {
            untouchedCells++;
          }
          peakActivity = Math.max(peakActivity, cellValue);
        });
    });

  console.log(untouchedCells);
  console.log(peakActivity);
}