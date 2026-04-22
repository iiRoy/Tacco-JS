function performRecursiveProcessing(currentLineIndex) {
  const dimensionData = entryLines[currentLineIndex].split(' ').map(Number);
  const widthVal = dimensionData[0];
  const heightVal = dimensionData[1];

  if (!widthVal && !heightVal) {
    return;
  }

  let currentCursor = currentLineIndex + 1;

  const gameGrid = constructMatrix(widthVal, heightVal);

  const initialSpot = entryLines[currentCursor++].split(' ').map(Number);
  const finalSpot = entryLines[currentCursor++].split(' ').map(Number);
  const numObstacles = Number(entryLines[currentCursor++]);

  Array.from({ length: numObstacles }).forEach(() => {
    const obstacleSpecs = entryLines[currentCursor++].split(' ').map(Number);
    placeObstacle(gameGrid, obstacleSpecs[0], obstacleSpecs[1], obstacleSpecs[2], obstacleSpecs[3]);
  });

  const outcome = verifyReachability(gameGrid, initialSpot, finalSpot) ? 'OK' : 'NG';
  console.log(outcome);

  performRecursiveProcessing(currentCursor);
}

function constructMatrix(dimX, dimY) {
  return Array.from({ length: dimX }, () => Array.from({ length: dimY }, () => 0));
}

function placeObstacle(gridRef, tint, orientation, startX, startY) {
  const formDimensions = [[4, 2], [2, 4]][orientation];
  Array.from({ length: formDimensions[0] }).forEach((_, rowOffset) => {
    Array.from({ length: formDimensions[1] }).forEach((_, colOffset) => {
      gridRef[startX - 1 + rowOffset][startY - 1 + colOffset] = tint;
    });
  });
}

function verifyReachability(gridRef, initialPosition, finalPosition) {
  const originX = initialPosition[0] - 1;
  const originY = initialPosition[1] - 1;
  const targetX = finalPosition[0] - 1;
  const targetY = finalPosition[1] - 1;

  const startingMaterial = gridRef[originX]?.[originY];

  if (startingMaterial === undefined || startingMaterial === 0) {
    return false;
  }

  const visitedLocations = new Set();
  const directionalShifts = [
    { deltaR: -1, deltaC: -1 }, { deltaR: 0, deltaC: -1 }, { deltaR: 1, deltaC: -1 },
    { deltaR: -1, deltaC: 0 },                             { deltaR: 1, deltaC: 0 },
    { deltaR: -1, deltaC: 1 }, { deltaR: 0, deltaC: 1 }, { deltaR: 1, deltaC: 1 }
  ];

  const traverseGrid = (currentR, currentC) => {
    if (currentR < 0 || currentR >= gridRef.length ||
        currentC < 0 || currentC >= gridRef[0].length) {
      return false;
    }

    if (gridRef[currentR][currentC] !== startingMaterial) {
      return false;
    }

    const coordinateKey = `${currentR},${currentC}`;
    if (visitedLocations.has(coordinateKey)) {
      return false;
    }

    if (currentR === targetX && currentC === targetY) {
      return true;
    }

    visitedLocations.add(coordinateKey);

    for (const shift of directionalShifts) {
      const nextR = currentR + shift.deltaR;
      const nextC = currentC + shift.deltaC;
      if (traverseGrid(nextR, nextC)) {
        return true;
      }
    }

    return false;
  };

  return traverseGrid(originX, originY);
}

var entryLines = '';

function commenceProcessing() {
  entryLines = entryLines.split('\n');
  performRecursiveProcessing(0);
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  entryLines += dataChunk;
});
process.stdin.on('end', function() {
  commenceProcessing();
});