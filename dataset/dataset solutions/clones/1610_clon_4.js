function ProcessGrid(rawData) {
  const processedInput = rawData.trim().split("\n");
  const [gridRows, gridCols, numValEntries] = processedInput.shift().split(" ").map((str) => parseInt(str, 10));
  const valueEntries = processedInput.map((line) => line.split(" ").map((str) => parseInt(str, 10)));

  const gridValues = new Map();
  for (const entry of valueEntries) {
    const [rCoord, cCoord, itemValue] = entry;
    if (!gridValues.has(rCoord - 1)) {
      gridValues.set(rCoord - 1, new Map());
    }
    gridValues.get(rCoord - 1).set(cCoord - 1, itemValue);
  }

  const memoCache = new Map();

  function getMemoKey(r, c, k) {
    return `${r},${c},${k}`;
  }

  function solve(rowIdx, colIdx, collectedCount) {
    if (rowIdx < 0 || colIdx < 0) {
      return 0;
    }
    if (rowIdx >= gridRows || colIdx >= gridCols) {
      return 0;
    }

    const currentKey = getMemoKey(rowIdx, colIdx, collectedCount);
    if (memoCache.has(currentKey)) {
      return memoCache.get(currentKey);
    }

    let currentCellMax = 0;

    currentCellMax = Math.max(currentCellMax, solve(rowIdx, colIdx - 1, collectedCount));

    if (collectedCount === 0) {
      let maxFromAbove = 0;
      for (let prevK = 0; prevK < 4; prevK++) {
        maxFromAbove = Math.max(maxFromAbove, solve(rowIdx - 1, colIdx, prevK));
      }
      currentCellMax = Math.max(currentCellMax, maxFromAbove);
    }

    const itemAtCurrentCell = gridValues.get(rowIdx)?.get(colIdx) || 0;
    if (collectedCount > 0 && itemAtCurrentCell > 0) {
      const valueIfPicked = solve(rowIdx, colIdx, collectedCount - 1) + itemAtCurrentCell;
      currentCellMax = Math.max(currentCellMax, valueIfPicked);
    }

    memoCache.set(currentKey, currentCellMax);
    return currentCellMax;
  }

  let finalResult = 0;
  for (let kVal = 0; kVal < 4; kVal++) {
    finalResult = Math.max(finalResult, solve(gridRows - 1, gridCols - 1, kVal));
  }

  console.log(finalResult);
}

ProcessGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
