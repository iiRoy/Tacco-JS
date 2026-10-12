const parseNumberLine = (line) => line.split(' ').map(Number);

function processGameData() {
  let loopIndex = 0;
  let boardDimensions;
  let startCoordinates;
  let targetCoordinates;
  let numberOfBlocks;
  let gameGrid;

  while (true) {
    boardDimensions = parseNumberLine(rawInputBuffer[loopIndex++]);
    if (!boardDimensions[0] && !boardDimensions[1]) {
      break;
    }

    gameGrid = createGameGrid(boardDimensions[0], boardDimensions[1]);

    startCoordinates = parseNumberLine(rawInputBuffer[loopIndex++]);
    targetCoordinates = parseNumberLine(rawInputBuffer[loopIndex++]);
    numberOfBlocks = Number(rawInputBuffer[loopIndex++]);

    for (let innerLoopIndex = 0; innerLoopIndex < numberOfBlocks; innerLoopIndex++) {
      const blockData = parseNumberLine(rawInputBuffer[loopIndex++]);
      applyBlockPlacement(gameGrid, blockData[0], blockData[1], blockData[2], blockData[3]);
    }

    console.log(findPathToTarget(gameGrid, startCoordinates, targetCoordinates) ? 'OK' : 'NG');
  }
}

function createGameGrid(gridWidth, gridHeight) {
  const grid = [];
  for (let i = 0; i < gridWidth; i++) {
    const row = new Array(gridHeight).fill(0);
    grid.push(row);
  }
  return grid;
}

function applyBlockPlacement(gameGrid, blockValue, blockOrientation, placementX, placementY) {
  const blockShapeDefinition = (blockOrientation === 0) ? [4, 2] : [2, 4];
  const blockWidth = blockShapeDefinition[0];
  const blockHeight = blockShapeDefinition[1];

  const adjustedPlacementX = placementX - 1;
  const adjustedPlacementY = placementY - 1;

  for (let i = 0; i < blockWidth; i++) {
    for (let j = 0; j < blockHeight; j++) {
      gameGrid[adjustedPlacementX + i][adjustedPlacementY + j] = blockValue;
    }
  }
}

function findPathToTarget(gameGrid, startCoordinates, targetCoordinates) {
  const traversalQueue = [];
  const neighborDirections = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0], /* current */ [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  const startGridX = startCoordinates[0] - 1;
  const startGridY = startCoordinates[1] - 1;
  const targetGridX = targetCoordinates[0] - 1;
  const targetGridY = targetCoordinates[1] - 1;

  const visitedCellsMap = {};

  // The original code accesses board[sx][sy] directly.
  // If startGridX or startGridY are out of bounds, this will throw an error.
  // This behavior must be preserved.
  const initialCellType = gameGrid[startGridX][startGridY];

  if (initialCellType === 0) {
    return false;
  }

  traversalQueue.push([startGridX, startGridY, {}]);

  while (traversalQueue.length > 0) {
    const [currentX, currentY, unusedObject] = traversalQueue.shift();

    const currentCellKey = `${currentX},${currentY}`;
    visitedCellsMap[currentCellKey] = true;

    // This check is for the *current* dequeued cell.
    // It handles out-of-bounds cells that were pushed to the queue,
    // or cells whose type does not match the starting cell's type.
    if (currentX < 0 || currentX >= gameGrid.length ||
        currentY < 0 || currentY >= gameGrid[0].length ||
        gameGrid[currentX][currentY] !== initialCellType) {
      continue;
    }

    if (currentX === targetGridX && currentY === targetGridY) {
      return true;
    }

    for (let i = 0; i < neighborDirections.length; i++) {
      const [dx, dy] = neighborDirections[i];
      const nextX = currentX + dx;
      const nextY = currentY + dy;
      const neighborKey = `${nextX},${nextY}`;

      // Only add to queue if this neighbor has not yet been processed (dequeued).
      // The original code marks a cell as visited *after* it's dequeued, not when pushed.
      if (!visitedCellsMap[neighborKey]) {
        traversalQueue.push([nextX, nextY, {}]);
      }
    }
  }

  return false;
}

let rawInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputBuffer += chunk;
});
process.stdin.on('end', function() {
  rawInputBuffer = rawInputBuffer.split('\n');
  processGameData();
});
