'use strict';
console.log(function(inputContent){
  const getCoordKey = (xVal, yVal) => `${xVal},${yVal}`;

  const allLines = inputContent.trim().split('\n');
  const [gridHeight, gridWidth] = allLines[0].split(' ').map(Number);

  const initialGridScan = {
    blockedCells: new Set(),
    pathCount: 0
  };

  const gridData = allLines.slice(1, gridHeight + 1).reduce((accumulator, rowString, rowIndex) => {
    const currentY = rowIndex + 1;
    for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
      const currentX = colIndex + 1;
      if (rowString[colIndex] === '#') {
        accumulator.blockedCells.add(getCoordKey(currentX, currentY));
      } else {
        accumulator.pathCount++;
      }
    }
    return accumulator;
  }, initialGridScan);

  const blockedCells = gridData.blockedCells;
  const totalPathableCells = gridData.pathCount;

  const pathDistances = new Map();
  const movementOffsets = [[0, -1], [0, 1], [-1, 0], [1, 0]]; // Up, Down, Left, Right

  let bfsFrontier = [];
  let queueHeadIndex = 0;

  const startX = 1;
  const startY = 1;
  const initialDistance = 1; // Our distance for (1,1)

  bfsFrontier.push({ xCoord: startX, yCoord: startY, currentPathLength: initialDistance });
  pathDistances.set(getCoordKey(startX, startY), initialDistance);

  while (queueHeadIndex < bfsFrontier.length) {
    const currentCell = bfsFrontier[queueHeadIndex++];

    for (const offset of movementOffsets) {
      const nextXCoord = currentCell.xCoord + offset[0];
      const nextYCoord = currentCell.yCoord + offset[1];
      const nextPathLength = currentCell.currentPathLength + 1;

      if (nextXCoord < 1 || nextXCoord > gridWidth || nextYCoord < 1 || nextYCoord > gridHeight) {
        continue;
      }

      const nextCoordKey = getCoordKey(nextXCoord, nextYCoord);

      if (blockedCells.has(nextCoordKey) || pathDistances.has(nextCoordKey)) {
        continue;
      }

      if (nextXCoord === gridWidth && nextYCoord === gridHeight) {
        // The original code's distance for (1,1) was 2, ours is 1.
        // So, if our path length to (W,H) is `nextPathLength`,
        // the original's equivalent distance would be `nextPathLength + 1`.
        return totalPathableCells - (nextPathLength + 1);
      }

      pathDistances.set(nextCoordKey, nextPathLength);
      bfsFrontier.push({ xCoord: nextXCoord, yCoord: nextYCoord, currentPathLength: nextPathLength });
    }
  }

  return undefined;
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
