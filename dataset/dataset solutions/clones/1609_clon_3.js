function calculateMaxPathSum(rawInputString) {
  const inputLines = rawInputString.trim().split("\n");

  const firstLineParts = inputLines.shift().split(" ");
  const gridRows = parseInt(firstLineParts[0], 10);
  const gridCols = parseInt(firstLineParts[1], 10);
  const numItems = parseInt(firstLineParts[2], 10);

  const itemDataEntries = inputLines.map((line) =>
    line.split(" ").map((str) => parseInt(str, 10))
  );

  const itemPlacementGrid = [];
  const memoizationTable = [];

  const retrieveGridItemValue = (row, col) => {
    if (itemPlacementGrid[row] && itemPlacementGrid[row][col] !== undefined) {
      return itemPlacementGrid[row][col];
    }
    return 0;
  };

  for (let itemIdx = 0; itemIdx < numItems; itemIdx++) {
    const [rowCoord, colCoord, itemValue] = itemDataEntries[itemIdx];
    const actualRow = rowCoord - 1;
    const actualCol = colCoord - 1;

    if (!itemPlacementGrid[actualRow]) {
      itemPlacementGrid[actualRow] = [];
    }
    itemPlacementGrid[actualRow][actualCol] = itemValue;
  }

  for (let currentRow = 0; currentRow < gridRows; currentRow++) {
    if (!memoizationTable[currentRow]) {
      memoizationTable[currentRow] = [];
    }
    if (!memoizationTable[currentRow + 1]) {
      memoizationTable[currentRow + 1] = [];
    }

    for (let currentCol = 0; currentCol < gridCols; currentCol++) {
      if (!memoizationTable[currentRow][currentCol]) {
        memoizationTable[currentRow][currentCol] = [0, 0, 0, 0];
      }

      if (!memoizationTable[currentRow][currentCol + 1]) {
        memoizationTable[currentRow][currentCol + 1] = [0, 0, 0, 0];
      }

      if (!memoizationTable[currentRow + 1][currentCol]) {
        const currentCellDPStateRef = memoizationTable[currentRow][currentCol];
        if (currentCellDPStateRef) {
          memoizationTable[currentRow + 1][currentCol] = currentCellDPStateRef;
        } else {
          memoizationTable[currentRow + 1][currentCol] = [0, 0, 0, 0];
        }
      }

      const currentCellItemValue = retrieveGridItemValue(currentRow, currentCol);
      const currentCellDPStates = memoizationTable[currentRow][currentCol];

      for (let stateIdx = 2; stateIdx >= 0; stateIdx--) {
        const previousStateAccumulatedValue = currentCellDPStates[stateIdx];
        const potentialNewAccumulatedValue = previousStateAccumulatedValue + currentCellItemValue;
        
        currentCellDPStates[stateIdx + 1] = Math.max(
          currentCellDPStates[stateIdx + 1],
          potentialNewAccumulatedValue
        );
      }

      for (let stateIdx = 0; stateIdx < 4; stateIdx++) {
        const valueToPropagate = currentCellDPStates[stateIdx];

        const nextRowDPStates = memoizationTable[currentRow + 1][currentCol];
        nextRowDPStates[0] = Math.max(nextRowDPStates[0], valueToPropagate);

        const nextColDPStates = memoizationTable[currentRow][currentCol + 1];
        nextColDPStates[stateIdx] = Math.max(nextColDPStates[stateIdx], valueToPropagate);
      }
    }
  }

  let maximumCollectedValue = 0;
  const finalCellDPStates = memoizationTable[gridRows - 1][gridCols - 1];
  for (let stateIdx = 0; stateIdx < 4; stateIdx++) {
    maximumCollectedValue = Math.max(maximumCollectedValue, finalCellDPStates[stateIdx]);
  }
  console.log(maximumCollectedValue);
}

calculateMaxPathSum(require("fs").readFileSync("/dev/stdin", "utf8"));
