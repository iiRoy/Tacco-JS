'use strict';

console.log(function(inputStr){
  const PATH_EMPTY_CELL = 0;
  const OBSTACLE_OR_BORDER = Infinity;

  const inputLines = inputStr.trim().split('\n');

  const dimensionStrings = inputLines[0].split(' ');
  const gridHeight = parseInt(dimensionStrings[0], 10);
  const gridWidth = parseInt(dimensionStrings[1], 10);

  const mazeGrid = [];
  mazeGrid.push(new Array(gridWidth + 2).fill(OBSTACLE_OR_BORDER));

  let pathableCellCount = 0;

  for ( let currentRowIndex = 1; currentRowIndex <= gridHeight; currentRowIndex++ ) {
    const currentGridRow = [OBSTACLE_OR_BORDER];
    const lineContent = inputLines[currentRowIndex];

    for ( let currentColumnIndex = 0; currentColumnIndex < gridWidth; currentColumnIndex++ ) {
      if ( lineContent[currentColumnIndex] === '.' ) {
        pathableCellCount++;
        currentGridRow.push(PATH_EMPTY_CELL);
      } else {
        currentGridRow.push(OBSTACLE_OR_BORDER);
      }
    }
    currentGridRow.push(OBSTACLE_OR_BORDER);
    mazeGrid.push(currentGridRow);
  }
  mazeGrid.push(new Array(gridWidth + 2).fill(OBSTACLE_OR_BORDER));

  const movementVectors = [
    [-1, 0],
    [0, -1],
    [1, 0],
    [0, 1]
  ];

  const bfsTraversalQueue = [[1, 1, 2]];

  while (bfsTraversalQueue.length > 0) {
    const currentPathNode = bfsTraversalQueue.shift();

    const currentX = currentPathNode[0];
    const currentY = currentPathNode[1];
    const currentDistance = currentPathNode[2];

    for ( const deltaVector of movementVectors ) {
      const nextX = currentX + deltaVector[0];
      const nextY = currentY + deltaVector[1];

      if ( nextX === gridWidth && nextY === gridHeight ) {
        return pathableCellCount - currentDistance;
      }

      if ( mazeGrid[nextY][nextX] === PATH_EMPTY_CELL ) {
        const nextDistance = currentDistance + 1;
        mazeGrid[nextY][nextX] = nextDistance;
        bfsTraversalQueue.push([nextX, nextY, nextDistance]);
      }
    }
  }
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
