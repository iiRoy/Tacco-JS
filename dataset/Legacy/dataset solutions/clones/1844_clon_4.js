function ProcessGrid(rawData) {
  const lines = rawData.trim().split("\n");
  const gridDim = parseInt(lines[0], 10);
  const removalOrder = lines[1].split(" ").map(Number);

  const cellCoordinates = new Map();
  const activeCells = new Set();

  for (let r = 0; r < gridDim; r++) {
    for (let c = 0; c < gridDim; c++) {
      const cellValue = r * gridDim + c + 1;
      cellCoordinates.set(cellValue, [r, c]);
      activeCells.add(`${r},${c}`);
    }
  }

  let unfavorableCount = 0;

  const countCellsInSegment = (fixedCoord, startIter, endIter, isRowFixed) => {
    let currentCount = 0;
    const step = startIter < endIter ? 1 : -1;

    if ((step === 1 && startIter > endIter) || (step === -1 && startIter < endIter)) {
        return 0;
    }

    for (let k = startIter; k !== endIter + step; k += step) {
      const coordKey = isRowFixed ? `${fixedCoord},${k}` : `${k},${fixedCoord}`;
      if (activeCells.has(coordKey)) {
        currentCount++;
      }
    }
    return currentCount;
  };

  removalOrder.forEach(valToRemove => {
    const [targetRow, targetCol] = cellCoordinates.get(valToRemove);
    activeCells.delete(`${targetRow},${targetCol}`);

    if (targetRow === 0 || targetCol === 0 || targetRow === gridDim - 1 || targetCol === gridDim - 1) {
      return;
    }

    const rowBefore = countCellsInSegment(targetCol, 0, targetRow - 1, false);
    const rowAfter = countCellsInSegment(targetCol, targetRow + 1, gridDim - 1, false);
    const colBefore = countCellsInSegment(targetRow, 0, targetCol - 1, true);
    const colAfter = countCellsInSegment(targetRow, targetCol + 1, gridDim - 1, true);

    unfavorableCount += Math.min(rowBefore, rowAfter, colBefore, colAfter);
  });

  console.log(unfavorableCount);
}

ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
