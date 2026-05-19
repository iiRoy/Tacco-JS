let rawInputData = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => {
  rawInputData += chunk;
});
process.stdin.on('end', () => {
  const processedLines = rawInputData.split('\n');
  processGameRounds(processedLines);
});

function processGameRounds(lines) {
  let currentLineIndex = 0;
  while (true) {
    const dimensions = lines[currentLineIndex++].split(' ').map(Number);
    const [gridWidth, gridHeight] = dimensions;

    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    const gameGrid = constructGrid(gridWidth, gridHeight);

    const startCoordinates = lines[currentLineIndex++].split(' ').map(Number);
    const targetCoordinates = lines[currentLineIndex++].split(' ').map(Number);
    const obstacleCount = Number(lines[currentLineIndex++]);

    Array.from({ length: obstacleCount }).forEach(() => {
      const obstacleParameters = lines[currentLineIndex++].split(' ').map(Number);
      placeObstacle(gameGrid, ...obstacleParameters);
    });

    console.log(checkPathExistence(gameGrid, startCoordinates, targetCoordinates) ? 'OK' : 'NG');
  }
}

function constructGrid(width, height) {
  return Array.from({ length: width }, () => Array.from({ length: height }, () => 0));
}

function placeObstacle(grid, colorValue, orientationType, xPosition, yPosition) {
  const blockDimensions = orientationType === 0 ? { width: 4, height: 2 } : { width: 2, height: 4 };

  const startGridX = xPosition - 1;
  const startGridY = yPosition - 1;

  for (let rowOffset = 0; rowOffset < blockDimensions.width; rowOffset++) {
    for (let colOffset = 0; colOffset < blockDimensions.height; colOffset++) {
      grid[startGridX + rowOffset][startGridY + colOffset] = colorValue;
    }
  }
}

function checkPathExistence(grid, entryPoint, exitPoint) {
  const [entryX, entryY] = [entryPoint[0] - 1, entryPoint[1] - 1];
  const [exitX, exitY] = [exitPoint[0] - 1, exitPoint[1] - 1];

  const totalGridWidth = grid.length;
  const totalGridHeight = grid[0].length;

  if (entryX < 0 || entryX >= totalGridWidth || entryY < 0 || entryY >= totalGridHeight) {
    return false;
  }
  const requiredPathColor = grid[entryX][entryY];
  if (requiredPathColor === 0) {
    return false;
  }

  const visitedLocations = new Set();

  const directionalVectors = [
    { dx: -1, dy: -1 }, { dx: 0, dy: -1 }, { dx: 1, dy: -1 },
    { dx: -1, dy: 0 },                     { dx: 1, dy: 0 },
    { dx: -1, dy: 1 }, { dx: 0, dy: 1 }, { dx: 1, dy: 1 }
  ];

  function explore(currentX, currentY) {
    if (currentX < 0 || currentX >= totalGridWidth || currentY < 0 || currentY >= totalGridHeight) {
      return false;
    }

    if (grid[currentX][currentY] !== requiredPathColor) {
      return false;
    }

    if (currentX === exitX && currentY === exitY) {
      return true;
    }

    const locationKey = `${currentX},${currentY}`;
    if (visitedLocations.has(locationKey)) {
      return false;
    }
    visitedLocations.add(locationKey);

    for (const vector of directionalVectors) {
      const nextX = currentX + vector.dx;
      const nextY = currentY + vector.dy;
      if (explore(nextX, nextY)) {
        return true;
      }
    }

    return false;
  }

  return explore(entryX, entryY);
}
