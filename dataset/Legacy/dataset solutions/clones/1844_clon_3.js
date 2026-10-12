function processInput(rawData) {
  const lines = rawData.trim().split("\n");
  const gridSize = parseInt(lines[0], 10);
  const seatOrder = lines[1].split(" ").map(Number);

  const createInitializedGrid = (rows, cols, initialValue = 0) => {
    const grid = new Array(rows);
    for (let k = 0; k < rows; k++) {
      grid[k] = new Array(cols).fill(initialValue);
    }
    return grid;
  };

  let seatGrid = createInitializedGrid(gridSize, gridSize);
  let seatCoordinatesMap = {};

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const currentSeatNumber = r * gridSize + c + 1;
      seatGrid[r][c] = currentSeatNumber;
      seatCoordinatesMap[currentSeatNumber] = [r + 1, c + 1];
    }
  }

  let dislikedCount = 0;
  const lastGridIndex = gridSize - 1;

  const isBorderPosition = (row1Idx, col1Idx, size) => {
    return row1Idx === 1 || col1Idx === 1 || row1Idx === size || col1Idx === size;
  };

  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const linearSeatIndex = r * gridSize + c;
      const seatValueToProcess = seatOrder[linearSeatIndex];

      const [originalRow1Idx, originalCol1Idx] = seatCoordinatesMap[seatValueToProcess];
      const originalRow0Idx = originalRow1Idx - 1;
      const originalCol0Idx = originalCol1Idx - 1;

      seatGrid[originalRow0Idx][originalCol0Idx] = 0;

      if (isBorderPosition(originalRow1Idx, originalCol1Idx, gridSize)) {
        continue;
      }

      let countUpInCol = 0;
      let countDownInCol = 0;
      let countLeftInRow = 0;
      let countRightInRow = 0;

      for (let tempR = originalRow0Idx - 1; tempR >= 0; tempR--) {
        if (seatGrid[tempR][originalCol0Idx] !== 0) {
          countUpInCol++;
        }
      }

      for (let tempR = originalRow0Idx + 1; tempR <= lastGridIndex; tempR++) {
        if (seatGrid[tempR][originalCol0Idx] !== 0) {
          countDownInCol++;
        }
      }

      for (let tempC = originalCol0Idx - 1; tempC >= 0; tempC--) {
        if (seatGrid[originalRow0Idx][tempC] !== 0) {
          countLeftInRow++;
        }
      }

      for (let tempC = originalCol0Idx + 1; tempC <= lastGridIndex; tempC++) {
        if (seatGrid[originalRow0Idx][tempC] !== 0) {
          countRightInRow++;
        }
      }

      dislikedCount += Math.min(countUpInCol, countDownInCol, countLeftInRow, countRightInRow);
    }
  }

  console.log(dislikedCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
