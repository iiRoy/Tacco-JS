let rawInputData = '';

const parseNumericLine = (lineContent) => {
  if (!lineContent) return [];
  return lineContent.split(' ').map(val => parseInt(val.trim(), 10));
};

const areCoordsValid = (x, y, maxWidth, maxHeight) => {
  return x >= 0 && x < maxWidth && y >= 0 && y < maxHeight;
};

function orchestrateGameRounds() {
  let currentInputLineIndex = 0;
  let gameGrid;
  let roundCounter = 0;

  while (true) {
    const dimensionTokens = parseNumericLine(rawInputData[currentInputLineIndex++]);
    
    if (dimensionTokens.length < 2 || (dimensionTokens[0] === 0 && dimensionTokens[1] === 0)) {
      break;
    }

    roundCounter++;
    const gridWidth = dimensionTokens[0];
    const gridHeight = dimensionTokens[1];
    
    if (gridWidth <= 0 || gridHeight <= 0) {
        console.error(`Error: Invalid grid dimensions for round ${roundCounter}. Skipping.`);
        currentInputLineIndex += 3;
        const skipBlocks = parseInt(rawInputData[currentInputLineIndex-1], 10);
        currentInputLineIndex += skipBlocks;
        continue;
    }

    gameGrid = createEmptyPlayfield(gridWidth, gridHeight);

    const startPointCoords = parseNumericLine(rawInputData[currentInputLineIndex++]);
    const endPointCoords = parseNumericLine(rawInputData[currentInputLineIndex++]);

    if (startPointCoords.length < 2 || endPointCoords.length < 2) {
        console.error(`Error: Incomplete start/end coordinates for round ${roundCounter}. Skipping.`);
        const blockCount = parseInt(rawInputData[currentInputLineIndex++], 10);
        currentInputLineIndex += blockCount;
        continue;
    }

    const blockCount = parseInt(rawInputData[currentInputLineIndex++], 10);

    for (let blockIdx = 0; blockIdx < blockCount; blockIdx++) {
      const blockParams = parseNumericLine(rawInputData[currentInputLineIndex++]);
      if (blockParams.length === 5) {
        applyObstacleToGrid(gameGrid, ...blockParams);
      } else {
        console.warn(`Warning: Malformed block definition line ${currentInputLineIndex - 1}. Skipping block.`);
      }
    }
    
    const pathExists = checkPathPossibility(gameGrid, 
                                            {x: startPointCoords[0], y: startPointCoords[1]},
                                            {x: endPointCoords[0], y: endPointCoords[1]});
    
    console.log(pathExists ? 'OK' : 'NG');
  }
}

function createEmptyPlayfield(widthVal, heightVal) {
  const newGrid = [];
  for (let rowIdx = 0; rowIdx < widthVal; rowIdx++) {
    newGrid.push(Array(heightVal).fill(0));
  }
  return newGrid;
}

function applyObstacleToGrid(targetGrid, blockType, orientationId, startX, startY) {
  const blockDimensionsMap = new Map([
    [0, { width: 4, height: 2 }],
    [1, { width: 2, height: 4 }]
  ]);

  const selectedBlockShape = blockDimensionsMap.get(orientationId);

  if (!selectedBlockShape) {
      console.warn(`Warning: Invalid block orientation ID '${orientationId}'. Skipping block placement.`);
      return;
  }

  const effectiveStartX = startX - 1;
  const effectiveStartY = startY - 1;

  for (let dx = 0; dx < selectedBlockShape.width; dx++) {
    for (let dy = 0; dy < selectedBlockShape.height; dy++) {
      const currentGridX = effectiveStartX + dx;
      const currentGridY = effectiveStartY + dy;

      if (areCoordsValid(currentGridX, currentGridY, targetGrid.length, targetGrid[0].length)) {
        targetGrid[currentGridX][currentGridY] = blockType;
      } else {
        console.warn(`Warning: Block piece for type ${blockType} at (${startX},${startY}) with orientation ${orientationId} attempts to place outside grid boundaries at (${currentGridX},${currentGridY}).`);
      }
    }
  }
}

function checkPathPossibility(currentGrid, startingPoint, endingPoint) {
  const searchQueue = [];
  
  const movementOffsets = [
    { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },                     { dx: 1, dy: 0 },
    { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
  ];

  const startX_0idx = startingPoint.x - 1;
  const startY_0idx = startingPoint.y - 1;
  const endX_0idx = endingPoint.x - 1;
  const endY_0idx = endingPoint.y - 1;

  const gridRows = currentGrid.length;
  const gridCols = currentGrid[0] ? currentGrid[0].length : 0;

  if (!areCoordsValid(startX_0idx, startY_0idx, gridRows, gridCols) ||
      !areCoordsValid(endX_0idx, endY_0idx, gridRows, gridCols)) {
      return false;
  }

  const initialCellType = currentGrid[startX_0idx][startY_0idx];
  
  if (initialCellType === 0) { 
    return false;
  }

  const visitedCells = new Set();

  searchQueue.push({ x: startX_0idx, y: startY_0idx });
  visitedCells.add(`${startX_0idx},${startY_0idx}`);

  while (searchQueue.length > 0) {
    const currentPos = searchQueue.shift();
    const currentX = currentPos.x;
    const currentY = currentPos.y;

    if (currentX === endX_0idx && currentY === endY_0idx) {
      return true;
    }

    for (const offset of movementOffsets) {
      const neighborX = currentX + offset.dx;
      const neighborY = currentY + offset.dy;
      const neighborCoordsKey = `${neighborX},${neighborY}`;

      if (areCoordsValid(neighborX, neighborY, gridRows, gridCols) && 
          !visitedCells.has(neighborCoordsKey)) {
        
        if (currentGrid[neighborX][neighborY] === initialCellType) {
          visitedCells.add(neighborCoordsKey);
          searchQueue.push({ x: neighborX, y: neighborY });
        }
      }
    }
  }
  
  return false;
}

function setupInputProcessing() {
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function(chunk) {
    rawInputData += chunk;
  });

  process.stdin.on('end', function() {
    rawInputData = rawInputData.split('\n').filter(line => line.trim() !== ''); 
    orchestrateGameRounds();
  });
}

setupInputProcessing();