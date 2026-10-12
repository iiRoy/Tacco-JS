function ProcessInput(rawData) {
  const dataRows = rawData.split('\n');

  const gridDimensionsStr = dataRows[0].split(' ');
  const gridDims = gridDimensionsStr.map(val => parseInt(val, 10));

  const startCoordinatesStr = dataRows[1].split(' ');
  const startCoords = startCoordinatesStr.map(val => parseInt(val, 10));

  const goalCoordinatesStr = dataRows[2].split(' ');
  const goalCoords = goalCoordinatesStr.map(val => parseInt(val, 10));

  const mapRowsData = dataRows.slice(3, 3 + gridDims[0]);
  const gridMap = mapRowsData.map(rowStr => rowStr.split(''));

  const bfsQueue = [];

  const POSITION_INDEX = 0;
  const WARP_COUNT_INDEX = 1;
  const ROW_COORD_INDEX = 0;
  const COL_COORD_INDEX = 1;

  const isWithinGridBounds = (r, c, maxR, maxC) => {
    return r >= 0 && r < maxR && c >= 0 && c < maxC;
  };

  const processCell = (currentPosition, warpCount) => {
    const rowIdx = currentPosition[ROW_COORD_INDEX];
    const colIdx = currentPosition[COL_COORD_INDEX];

    if (!isWithinGridBounds(rowIdx, colIdx, gridDims[0], gridDims[1])) {
      return;
    }

    const cellValue = gridMap[rowIdx][colIdx];

    if (cellValue === '#') {
      return;
    }

    if (cellValue === '.') {
      gridMap[rowIdx][colIdx] = warpCount;

      const directMoveOffsets = [
        [1, 0], [-1, 0], [0, 1], [0, -1]
      ];

      for (const offset of directMoveOffsets) {
        const nextR = rowIdx + offset[ROW_COORD_INDEX];
        const nextC = colIdx + offset[COL_COORD_INDEX];
        if (isWithinGridBounds(nextR, nextC, gridDims[0], gridDims[1])) {
          if (gridMap[nextR][nextC] === '.') {
             bfsQueue.unshift([[nextR, nextC], warpCount]);
          }
        }
      }

      const warpRange = [-2, -1, 0, 1, 2];
      for (const deltaRow of warpRange) {
        for (const deltaCol of warpRange) {
          const nextWarpR = rowIdx + deltaRow;
          const nextWarpC = colIdx + deltaCol;
          if (isWithinGridBounds(nextWarpR, nextWarpC, gridDims[0], gridDims[1])) {
            bfsQueue.push([[nextWarpR, nextWarpC], warpCount + 1]);
          }
        }
      }
    }
  };

  const initialStartRow = startCoords[ROW_COORD_INDEX] - 1;
  const initialStartCol = startCoords[COL_COORD_INDEX] - 1;
  bfsQueue.push([[initialStartRow, initialStartCol], 0]);

  const goalRow = goalCoords[ROW_COORD_INDEX] - 1;
  const goalCol = goalCoords[COL_COORD_INDEX] - 1;

  while (bfsQueue.length > 0) {
    const queueItem = bfsQueue.shift();
    const currentPosition = queueItem[POSITION_INDEX];
    const currentWarpCount = queueItem[WARP_COUNT_INDEX];

    processCell(currentPosition, currentWarpCount);

    const goalCellValue = gridMap[goalRow][goalCol];
    if (goalCellValue !== '.') {
      break;
    }
  }

  const finalGoalValue = gridMap[goalRow][goalCol];
  const result = (typeof finalGoalValue === 'number') ? finalGoalValue : -1;
  console.log(result);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
