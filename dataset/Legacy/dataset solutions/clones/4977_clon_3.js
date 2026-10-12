function processGridData(rawData) {
  const inputLines = rawData.split("\n");

  const dimensionsStr = inputLines[0].split(" ");
  const gridHeight = Number(dimensionsStr[0]);
  const gridWidth = Number(dimensionsStr[1]);

  const blackCellCounts = new Array(10).fill(0);
  const initialEmptySquares = (gridHeight - 2) * (gridWidth - 2);
  blackCellCounts[0] = initialEmptySquares;

  if (inputLines.length === 1) {
    console.log(blackCellCounts.join("\n"));
    return;
  }

  const gridState = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(false));

  // Helper function to check if a given (r, c) can be the center of a valid 3x3 square
  const isValidSquareCenter = (r, c, H, W) => {
    return r >= 1 && r < H - 1 && c >= 1 && c < W - 1;
  };

  // Helper function to count black cells in a 3x3 square centered at (r, c)
  const countBlackCellsInSquare = (grid, centerR, centerC) => {
    let currentBlackCellCount = 0;
    for (let subRowOffset = -1; subRowOffset <= 1; subRowOffset++) {
      for (let subColOffset = -1; subColOffset <= 1; subColOffset++) {
        const cellRow = centerR + subRowOffset;
        const cellCol = centerC + subColOffset;
        if (grid[cellRow][cellCol]) {
          currentBlackCellCount++;
        }
      }
    }
    return currentBlackCellCount;
  };

  for (let lineIdx = 1; lineIdx < inputLines.length; lineIdx++) {
    const cellCoordsStr = inputLines[lineIdx].split(" ");
    const currentCellRow = Number(cellCoordsStr[0]) - 1;
    const currentCellCol = Number(cellCoordsStr[1]) - 1;

    gridState[currentCellRow][currentCellCol] = true;

    // Iterate through the 3x3 neighborhood around the newly placed black cell
    // Each point in this neighborhood could be the center of a 3x3 square
    // that is affected by the new black cell.
    for (let rowOffset = -1; rowOffset <= 1; rowOffset++) {
      for (let colOffset = -1; colOffset <= 1; colOffset++) {
        const potentialCenterR = currentCellRow + rowOffset;
        const potentialCenterC = currentCellCol + colOffset;

        if (isValidSquareCenter(potentialCenterR, potentialCenterC, gridHeight, gridWidth)) {
          const newBlackCellCount = countBlackCellsInSquare(gridState, potentialCenterR, potentialCenterC);
          
          // A square that previously had (newBlackCellCount - 1) black cells
          // now has newBlackCellCount black cells.
          blackCellCounts[newBlackCellCount - 1]--;
          blackCellCounts[newBlackCellCount]++;
        }
      }
    }
  }

  console.log(blackCellCounts.join("\n"));
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
