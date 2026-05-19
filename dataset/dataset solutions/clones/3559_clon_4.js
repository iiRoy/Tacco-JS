function processGrid(gridData) {
  const [gridHeight, gridWidth] = gridData[0].split(" ").map(Number);

  // Strategy: Collect odd cell locations using a functional reduce pattern
  // and store them as objects {r, c} for clarity, instead of array pairs.
  const oddCellCoordinates = gridData.slice(1, gridHeight + 1).reduce((accumulator, rowString, rowIndex) => {
    rowString.split(" ").forEach((cellValueString, colIndex) => {
      if (parseInt(cellValueString, 10) % 2 !== 0) {
        accumulator.push({ r: rowIndex + 1, c: colIndex + 1 }); // Store 1-indexed coordinates
      }
    });
    return accumulator;
  }, []);

  // Strategy: Instead of an imperative while loop that modifies a 'start' point
  // in place, directly calculate and append all horizontal moves, then all
  // vertical moves for each pair of odd cells. This avoids the iterative
  // modification and string comparison for loop termination.
  const transformationSteps = [];
  for (let k = 0; k < Math.floor(oddCellCoordinates.length / 2); k++) {
    const originCell = oddCellCoordinates[k * 2];
    const destinationCell = oddCellCoordinates[k * 2 + 1];

    // First, generate all horizontal moves (rightward)
    for (let currentColumn = originCell.c; currentColumn < destinationCell.c; currentColumn++) {
      transformationSteps.push(`${originCell.r} ${currentColumn} ${originCell.r} ${currentColumn + 1}`);
    }

    // Then, generate all vertical moves (downward)
    // The column for vertical moves is fixed at destinationCell.c, as horizontal moves
    // have already aligned the column.
    for (let currentRow = originCell.r; currentRow < destinationCell.r; currentRow++) {
      transformationSteps.push(`${currentRow} ${destinationCell.c} ${currentRow + 1} ${destinationCell.c}`);
    }
  }

  console.log(transformationSteps.length);
  console.log(transformationSteps.join("\n"));
}

processGrid(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
