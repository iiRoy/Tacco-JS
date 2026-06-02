function processInput(rawData) {
  const inputLines = rawData.split('\n');

  const gridDimensionsStr = inputLines[0].split(' ');
  const gridHeight = parseInt(gridDimensionsStr[0], 10);
  const gridWidth = parseInt(gridDimensionsStr[1], 10);

  const startCoordsStr = inputLines[1].split(' ');
  const startRow = parseInt(startCoordsStr[0], 10) - 1;
  const startCol = parseInt(startCoordsStr[1], 10) - 1;

  const goalCoordsStr = inputLines[2].split(' ');
  const goalRow = parseInt(goalCoordsStr[0], 10) - 1;
  const goalCol = parseInt(goalCoordsStr[1], 10) - 1;

  const gridMap = inputLines.slice(3, 3 + gridHeight).map(rowStr => rowStr.split(''));

  const searchQueue = [];

  const isWithinBounds = (r, c) => {
    return r >= 0 && r < gridHeight && c >= 0 && c < gridWidth;
  };

  const enqueuePosition = (r, c, currentWarpCount) => {
    searchQueue.push([[r, c], currentWarpCount]);
  };

  const exploreCell = (currentPosition, warpCount) => {
    const rowIdx = currentPosition[0];
    const colIdx = currentPosition[1];

    if (!isWithinBounds(rowIdx, colIdx)) {
      return;
    }

    const cellContent = gridMap[rowIdx][colIdx];

    if (cellContent === '#') {
      return;
    }

    const isUnvisited = cellContent === '.';
    const isBetterPath = cellContent > warpCount;

    if (isUnvisited || isBetterPath) {
      gridMap[rowIdx][colIdx] = warpCount;

      // Enqueue direct neighbors
      enqueuePosition(rowIdx + 1, colIdx, warpCount);
      enqueuePosition(rowIdx - 1, colIdx, warpCount);
      enqueuePosition(rowIdx, colIdx + 1, warpCount);
      enqueuePosition(rowIdx, colIdx - 1, warpCount);

      // Enqueue warp neighbors (5x5 area)
      const warpOffsetRange = 2;
      const nextWarpCount = warpCount + 1;
      for (let rowOffset = -warpOffsetRange; rowOffset <= warpOffsetRange; rowOffset++) {
        for (let colOffset = -warpOffsetRange; colOffset <= warpOffsetRange; colOffset++) {
          enqueuePosition(rowIdx + rowOffset, colIdx + colOffset, nextWarpCount);
        }
      }
    }
  };

  enqueuePosition(startRow, startCol, 0);

  while (searchQueue.length > 0) {
    const queueItem = searchQueue.shift();
    exploreCell(queueItem[0], queueItem[1]);
  }

  const finalWarpValue = gridMap[goalRow][goalCol];
  const result = (finalWarpValue !== '.') ? finalWarpValue : -1;
  console.log(result);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
