function createGrid(sourceGrid) {
  const gridSize = sourceGrid.length;

  const transposedLayout = Array.from({ length: gridSize }, (_, rowIndex) =>
    Array.from({ length: gridSize }, (_, colIndex) =>
      sourceGrid[colIndex][rowIndex]
    )
  );

  const finalFormation = transposedLayout.map(rowLine =>
    [...rowLine].reverse()
  );

  return finalFormation;
}