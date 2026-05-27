function processInput(inputLines) {
  const [dimensionLine, ...gridRows] = inputLines;
  const [gridHeight, gridWidth, maxPropagationSteps] = dimensionLine.split(' ').map(Number);

  let initialPosition = [-1, -1];
  const gameBoard = gridRows.map((rowContent, rowIndex) =>
    rowContent.split('').map((cellChar, colIndex) => {
      if (cellChar === 'S') {
        initialPosition = [rowIndex, colIndex];
        return 0; // Mark the starting 'S' cell with 0 steps
      }
      return cellChar;
    })
  );

  // The original 'search' function uses setTimeout(..., 0) for its recursive calls.
  // This means the propagation of step values (i) beyond the initial 'S' cell
  // is deferred to subsequent event loop ticks.
  // The final loop that calculates 'minimum' runs synchronously immediately after
  // the initial call to 'search'.
  // Therefore, at the time the 'minimum' calculation loop executes,
  // only the 'S' cell itself (which is marked '0') will have a numeric value.
  // All other cells will still be their original '.' or '#' characters.
  // Thus, the complex propagation logic of the original 'search' function
  // is effectively not observed by the 'minimum' calculation.
  // We only need to ensure the 'S' cell is marked '0', which is done during 'gameBoard' creation.

  const computeBoundaryProximity = (rowCoord, colCoord) => {
    const topDistance = rowCoord;
    const bottomDistance = gridHeight - 1 - rowCoord;
    const leftDistance = colCoord;
    const rightDistance = gridWidth - 1 - colCoord;
    return Math.min(topDistance, bottomDistance, leftDistance, rightDistance);
  };

  let overallSmallestValue = Infinity;
  let borderReachedImmediately = false;

  gameBoard.forEach((rowCells, r) => {
    rowCells.forEach((cellContent, c) => {
      if (borderReachedImmediately) return; // Short-circuit if minimum is already 1

      if (typeof cellContent === 'number') { // This will only be true for the initial 'S' cell (marked 0)
        const currentCellBoundaryDistance = computeBoundaryProximity(r, c);

        if (currentCellBoundaryDistance === 0) {
          overallSmallestValue = 1;
          borderReachedImmediately = true; // Set flag to conceptually break out of nested loops
        } else {
          overallSmallestValue = Math.min(overallSmallestValue, Math.ceil(currentCellBoundaryDistance / maxPropagationSteps) + 1);
        }
      }
    });
  });

  console.log(overallSmallestValue);
}

const inputData = require("fs").readFileSync("/dev/stdin", "utf8").split('\n').map(l => l.trim());
processInput(inputData);
