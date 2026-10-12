function processInput(rawData) {
  rawData = rawData.trim().split("\n");

  const firstLineParts = rawData.shift().split(" ");
  const numRows = parseInt(firstLineParts[0], 10);
  const numCols = parseInt(firstLineParts[1], 10);
  const numItems = parseInt(firstLineParts[2], 10);

  const itemData = rawData.map((line) =>
    line.split(" ").map((valStr) => parseInt(valStr, 10))
  );

  const MAX_GRID_DIMENSION = 3005;
  const MAX_COLLECTIBLE_ITEMS = 4;

  let gridValues = [];
  let dynamicProgTable = Array.from({ length: MAX_GRID_DIMENSION }, () =>
    Array.from({ length: MAX_GRID_DIMENSION }, () => Array(MAX_COLLECTIBLE_ITEMS).fill(0))
  );

  const getSafeGridValue = (rIndex, cIndex) => {
    if (rIndex < 0 || cIndex < 0 || rIndex >= gridValues.length || !gridValues[rIndex]) {
      return 0;
    }
    return gridValues[rIndex][cIndex] || 0;
  };

  for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
    const [itemRow, itemCol, itemValue] = itemData[itemIdx];
    gridValues[itemRow - 1] ??= [];
    gridValues[itemRow - 1][itemCol - 1] = itemValue;
  }

  for (let r = 0; r < numRows; r++) {
    for (let c = 0; c < numCols; c++) {
      const currentCellItemValue = getSafeGridValue(r, c);

      for (let kCount = MAX_COLLECTIBLE_ITEMS - 2; kCount >= 0; kCount--) {
        dynamicProgTable[r][c][kCount + 1] = Math.max(
          dynamicProgTable[r][c][kCount + 1],
          dynamicProgTable[r][c][kCount] + currentCellItemValue
        );
      }

      for (let kCount = 0; kCount < MAX_COLLECTIBLE_ITEMS; kCount++) {
        dynamicProgTable[r + 1][c][0] = Math.max(
          dynamicProgTable[r + 1][c][0],
          dynamicProgTable[r][c][kCount]
        );
        dynamicProgTable[r][c + 1][kCount] = Math.max(
          dynamicProgTable[r][c + 1][kCount],
          dynamicProgTable[r][c][kCount]
        );
      }
    }
  }

  let finalResult = 0;
  for (let kCount = 0; kCount < MAX_COLLECTIBLE_ITEMS; kCount++) {
    finalResult = Math.max(finalResult, dynamicProgTable[numRows - 1][numCols - 1][kCount]);
  }
  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
