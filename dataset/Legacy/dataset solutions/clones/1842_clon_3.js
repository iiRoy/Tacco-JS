function initializeGrid(rows, cols, initialValue = 0) {
  const grid = new Array(rows);
  for (let r = 0; r < rows; r++) {
    grid[r] = new Array(cols).fill(initialValue);
  }
  return grid;
}

function calculateSeatNumber(row, col, size) {
  return (row - 1) * size + col;
}

function isBorderSeat(row, col, size) {
  return row === 1 || col === 1 || row === size || col === size;
}

function countAvailableInDirection(grid, startRow, startCol, direction, size) {
  let count = 0;
  const zeroBasedRow = startRow - 1;
  const zeroBasedCol = startCol - 1;

  switch (direction) {
    case 'left': // Corresponds to original 'left' (iterating rows upwards)
      for (let r = zeroBasedRow - 1; r >= 0; r--) {
        if (grid[r][zeroBasedCol] !== 0) {
          count++;
        }
      }
      break;
    case 'right': // Corresponds to original 'right' (iterating rows downwards)
      for (let r = zeroBasedRow + 1; r < size; r++) {
        if (grid[r][zeroBasedCol] !== 0) {
          count++;
        }
      }
      break;
    case 'up': // Corresponds to original 'up' (iterating columns leftwards)
      for (let c = zeroBasedCol - 1; c >= 0; c--) {
        if (grid[zeroBasedRow][c] !== 0) {
          count++;
        }
      }
      break;
    case 'down': // Corresponds to original 'down' (iterating columns rightwards)
      for (let c = zeroBasedCol + 1; c < size; c++) {
        if (grid[zeroBasedRow][c] !== 0) {
          count++;
        }
      }
      break;
  }
  return count;
}

function ProcessInput(rawData) {
  const lines = rawData.trim().split("\n");
  const gridSize = parseInt(lines[0], 10);
  const permutationArray = lines[1].split(" ").map((n) => parseInt(n, 10));

  const seatGrid = initializeGrid(gridSize, gridSize, 0);

  const seatCoordinatesMap = {};

  for (let row = 1; row <= gridSize; row++) {
    for (let col = 1; col <= gridSize; col++) {
      const currentSeatNumber = calculateSeatNumber(row, col, gridSize);
      seatGrid[row - 1][col - 1] = currentSeatNumber;
      seatCoordinatesMap[currentSeatNumber.toString()] = [row, col];
    }
  }

  let unfavorableCount = 0;
  const TAKEN_SEAT_VALUE = 0;

  for (let rowIter = 1; rowIter <= gridSize; rowIter++) {
    for (let colIter = 1; colIter <= gridSize; colIter++) {
      const permutationArrayIndex = (rowIter - 1) * gridSize + (colIter - 1);
      const currentPermutedSeatValue = permutationArray[permutationArrayIndex];

      const targetCoords = seatCoordinatesMap[currentPermutedSeatValue.toString()];
      const targetRow = targetCoords[0];
      const targetCol = targetCoords[1];

      seatGrid[targetRow - 1][targetCol - 1] = TAKEN_SEAT_VALUE;

      if (isBorderSeat(targetRow, targetCol, gridSize)) {
        continue;
      }

      const countLeft = countAvailableInDirection(seatGrid, targetRow, targetCol, 'left', gridSize);
      const countRight = countAvailableInDirection(seatGrid, targetRow, targetCol, 'right', gridSize);
      const countUp = countAvailableInDirection(seatGrid, targetRow, targetCol, 'up', gridSize);
      const countDown = countAvailableInDirection(seatGrid, targetRow, targetCol, 'down', gridSize);

      unfavorableCount += Math.min(countLeft, countRight, countUp, countDown);
    }
  }

  console.log(unfavorableCount);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
