function processGridData(rawData) {
  const inputLines = rawData.split("\n");

  const parseDimensions = (dimensionLine) => {
    const parts = dimensionLine.split(" ");
    const height = parseInt(parts[0], 10);
    const width = parseInt(parts[1], 10);
    return { height, width };
  };

  const { height: gridHeight, width: gridWidth } = parseDimensions(inputLines[0]);

  const squareCounts = new Array(10).fill(0);
  const initialZeroCount = (gridHeight - 2) * (gridWidth - 2);
  squareCounts[0] = initialZeroCount;

  if (inputLines.length === 1) {
    console.log(squareCounts.join("\n"));
    return;
  }

  const initializeGrid = (h, w) => {
    return Array.from({ length: h }, () => Array(w).fill(false));
  };

  const gridState = initializeGrid(gridHeight, gridWidth);

  const countOnCellsInSquare = (grid, centerRow, centerCol) => {
    let currentOnCount = 0;
    for (let rOffset = -1; rOffset <= 1; rOffset++) {
      for (let cOffset = -1; cOffset <= 1; cOffset++) {
        const checkRow = centerRow + rOffset;
        const checkCol = centerCol + cOffset;
        if (grid[checkRow][checkCol]) {
          currentOnCount++;
        }
      }
    }
    return currentOnCount;
  };

  const neighborhoodOffsets = [-1, 0, 1];

  for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
    const currentCoordsStr = inputLines[lineIndex].split(" ");
    const onCellRow = parseInt(currentCoordsStr[0], 10) - 1;
    const onCellCol = parseInt(currentCoordsStr[1], 10) - 1;

    gridState[onCellRow][onCellCol] = true;

    for (const rowDelta of neighborhoodOffsets) {
      for (const colDelta of neighborhoodOffsets) {
        const potentialCenterRow = onCellRow + rowDelta;
        const potentialCenterCol = onCellCol + colDelta;

        const isSquareWithinBounds = (
          potentialCenterRow >= 1 && potentialCenterRow < gridHeight - 1 &&
          potentialCenterCol >= 1 && potentialCenterCol < gridWidth - 1
        );

        if (isSquareWithinBounds) {
          const currentOnCellCount = countOnCellsInSquare(gridState, potentialCenterRow, potentialCenterCol);
          
          squareCounts[currentOnCellCount - 1]--;
          squareCounts[currentOnCellCount]++;
        }
      }
    }
  }

  console.log(squareCounts.join("\n"));
}

processGridData(require("fs").readFileSync("/dev/stdin", "utf8"));
