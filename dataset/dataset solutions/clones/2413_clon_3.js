console.log((inputContent => {
  const NEWLINE_DELIMITER = '\n';
  const SPACE_DELIMITER = ' ';

  const [dimensionLine, ...inputGridLines] = inputContent.trim().split(NEWLINE_DELIMITER);
  const [gridHeightStr, gridWidthStr, unusedParamStr] = dimensionLine.split(SPACE_DELIMITER);

  const gridHeight = Number(gridHeightStr);
  const gridWidth = Number(gridWidthStr);

  const processedGrid = new Array(gridHeight).fill(null).map(() => new Array(gridWidth).fill(0));

  const assignOrPropagateId = (targetGrid, rIdx, cIdx, proposedId) => {
    const existingCellId = targetGrid[rIdx][cIdx];
    if (existingCellId !== 0) {
      return existingCellId;
    } else if (proposedId !== 0) {
      targetGrid[rIdx][cIdx] = proposedId;
      return proposedId;
    } else {
      return 0;
    }
  };

  const componentIdTracker = { value: 0 };

  const performHorizontalPropagation = (grid, height, width, sourceLines, idTracker, propagatorFn) => {
    for (let rowIndex = 0; rowIndex < height; rowIndex++) {
      let currentPropagatingId = 0;

      for (let colIndex = 0; colIndex < width; colIndex++) {
        if (sourceLines[rowIndex][colIndex] === '#') {
          idTracker.value++;
          currentPropagatingId = idTracker.value;
        }
        grid[rowIndex][colIndex] = currentPropagatingId;
      }

      for (let colIndex = width - 1; colIndex >= 0; colIndex--) {
        currentPropagatingId = propagatorFn(grid, rowIndex, colIndex, currentPropagatingId);
      }
    }
  };

  const performVerticalPropagation = (grid, height, width, propagatorFn) => {
    for (let colIndex = 0; colIndex < width; colIndex++) {
      let currentPropagatingId = 0;

      for (let rowIndex = 0; rowIndex < height; rowIndex++) {
        currentPropagatingId = propagatorFn(grid, rowIndex, colIndex, currentPropagatingId);
      }

      for (let rowIndex = height - 1; rowIndex >= 0; rowIndex--) {
        currentPropagatingId = propagatorFn(grid, rowIndex, colIndex, currentPropagatingId);
      }
    }
  };

  performHorizontalPropagation(processedGrid, gridHeight, gridWidth, inputGridLines, componentIdTracker, assignOrPropagateId);
  performVerticalPropagation(processedGrid, gridHeight, gridWidth, assignOrPropagateId);

  return processedGrid.map(gridRow => gridRow.join(SPACE_DELIMITER)).join(NEWLINE_DELIMITER);

})(require('fs').readFileSync('/dev/stdin', 'utf8')));
