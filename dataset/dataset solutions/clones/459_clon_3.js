function processGameRounds() {
  let inputLineIndex = 0;
  let boardDimensions;
  let startCoordinates;
  let targetCoordinates;
  let numberOfBlocks;
  let gameBoard;

  while (true) {
    boardDimensions = rawInputLines[inputLineIndex++].split(' ').map(Number);
    if (!boardDimensions[0] && !boardDimensions[1]) break;

    gameBoard = createEmptyBoard(boardDimensions[0], boardDimensions[1]);

    startCoordinates = rawInputLines[inputLineIndex++].split(' ').map(Number);
    targetCoordinates = rawInputLines[inputLineIndex++].split(' ').map(Number);
    numberOfBlocks = Number(rawInputLines[inputLineIndex++]);

    for (let blockIteration = 0; blockIteration < numberOfBlocks; blockIteration++) {
      const blockParameters = rawInputLines[inputLineIndex++].split(' ').map(Number);
      placeBlockOnBoard(gameBoard, ...blockParameters);
    }

    const canReachGoal = checkPathToGoal(gameBoard, startCoordinates, targetCoordinates);
    console.log(canReachGoal ? 'OK' : 'NG');
  }
}

function createEmptyBoard(width, height) {
  const boardGrid = [];
  for (let colIndex = 0; colIndex < width; colIndex++) {
    boardGrid.push(Array(height).fill(0));
  }
  return boardGrid;
}

function placeBlockOnBoard(boardGrid, blockType, blockDirection, blockX, blockY) {
  const predefinedBlockShapes = [[4, 2], [2, 4]];
  const currentBlockShape = predefinedBlockShapes[blockDirection];
  const blockWidth = currentBlockShape[0];
  const blockHeight = currentBlockShape[1];

  for (let i = 0; i < blockWidth; i++) {
    for (let j = 0; j < blockHeight; j++) {
      boardGrid[blockX - 1 + i][blockY - 1 + j] = blockType;
    }
  }
}

function checkPathToGoal(boardGrid, startCoordinates, targetCoordinates) {
  const pathQueue = [];
  const neighborOffsets = [
    [-1, -1], [0, -1], [1, -1],
    [-1, 0],           [1, 0],
    [-1, 1], [0, 1], [1, 1]
  ];

  const startX = startCoordinates[0] - 1;
  const startY = startCoordinates[1] - 1;
  const targetX = targetCoordinates[0] - 1;
  const targetY = targetCoordinates[1] - 1;

  const visitedCells = {};
  const initialBlockType = boardGrid[startX][startY];
  const boardWidth = boardGrid.length;
  const boardHeight = boardGrid[0].length;

  if (initialBlockType === 0) {
    return false;
  }

  pathQueue.push([startX, startY]);

  while (pathQueue.length > 0) {
    const [currentX, currentY] = pathQueue.shift();

    // Guard clause for out-of-bounds or incorrect block type
    if (currentX < 0 || currentX >= boardWidth || currentY < 0 || currentY >= boardHeight || initialBlockType !== boardGrid[currentX][currentY]) {
      continue;
    }

    // Check if target has been reached
    if (currentX === targetX && currentY === targetY) {
      return true;
    }

    // Mark the current cell as visited
    const currentCellKey = `${currentX},${currentY}`;
    visitedCells[currentCellKey] = true;

    // Explore all 8 neighbors
    for (let offsetIndex = 0; offsetIndex < neighborOffsets.length; offsetIndex++) {
      const [offsetX, offsetY] = neighborOffsets[offsetIndex];
      const nextX = currentX + offsetX;
      const nextY = currentY + offsetY;
      const nextCellKey = `${nextX},${nextY}`;

      // Only add to queue if not already visited
      if (!visitedCells[nextCellKey]) {
        pathQueue.push([nextX, nextY]);
      }
    }
  }

  return false;
}

let rawInputLines = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  rawInputLines += chunk;
});
process.stdin.on('end', function() {
  rawInputLines = rawInputLines.split('\n');
  processGameRounds();
});
