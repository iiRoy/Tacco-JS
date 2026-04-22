function spinGrid(initialGrid) {
  const dimension = initialGrid.length;

  const transposedGrid = Array.from({ length: dimension }, (_, rowIndex) => {
    return Array.from({ length: dimension }, (_, colIndex) => {
      return initialGrid[colIndex][rowIndex];
    });
  });

  const finalGrid = transposedGrid.map(rowVector => {
    return [...rowVector].reverse();
  });

  return finalGrid;
}