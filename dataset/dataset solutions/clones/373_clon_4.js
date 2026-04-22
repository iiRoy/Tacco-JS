const rotateMatrix = (inputGrid) => {
  const GRID_SIZE = 8;

  const resultGrid = Array.from({ length: GRID_SIZE }, (_, targetRow) => {
    return Array.from({ length: GRID_SIZE }, (_, targetColumn) => {
      // The element for resultGrid[targetRow][targetColumn]
      // comes from inputGrid[originalRow][originalColumn]
      // where originalRow = GRID_SIZE - 1 - targetColumn
      // and originalColumn = targetRow
      return inputGrid[GRID_SIZE - 1 - targetColumn][targetRow];
    });
  });

  return resultGrid;
};