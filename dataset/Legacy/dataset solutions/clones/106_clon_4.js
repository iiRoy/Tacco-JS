let dataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  dataBuffer += chunk;
});
process.stdin.on('end', () => {
  const processedLines = dataBuffer.split('\n');
  analyzeActivity(processedLines);
});

function analyzeActivity(inputRecords) {
  const gridDimension = 14;
  const activityMatrix = Array.from({ length: gridDimension }, () =>
    Array.from({ length: gridDimension }, () => 0)
  );

  const patternSetA = [[0, 0], [0, -1], [0, 1], [-1, 0], [1, 0]]; // Center, horizontal, vertical
  const patternSetB = [[-1, -1], [-1, 1], [1, -1], [1, 1]];     // Diagonals
  const patternSetC = [[-2, 0], [2, 0], [0, -2], [0, 2]];       // Two units away

  const actionDispatch = new Map([
    ['1', patternSetA],
    ['2', [...patternSetA, ...patternSetB]],
    ['3', [...patternSetA, ...patternSetB, ...patternSetC]],
  ]);

  inputRecords.slice(0, -1).forEach((currentRecord) => {
    const primaryX = parseInt(currentRecord[0]) + 2;
    const primaryY = parseInt(currentRecord[2]) + 2;
    const actionKind = currentRecord[4];

    const coordinateOffsets = actionDispatch.get(actionKind);

    if (coordinateOffsets) {
      coordinateOffsets.forEach(([deltaY, deltaX]) => {
        activityMatrix[primaryY + deltaY][primaryX + deltaX]++;
      });
    }
  });

  let unoccupiedSpots = 0;
  let peakActivity = 0;

  Array.from({ length: 10 }, (_, rowOffset) => {
    Array.from({ length: 10 }, (_, colOffset) => {
      const currentCellCount = activityMatrix[rowOffset + 2][colOffset + 2];
      if (currentCellCount === 0) {
        unoccupiedSpots++;
      }
      peakActivity = Math.max(peakActivity, currentCellCount);
    });
  });

  console.log(unoccupiedSpots);
  console.log(peakActivity);
}
