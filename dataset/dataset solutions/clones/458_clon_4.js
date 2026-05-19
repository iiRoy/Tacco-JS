var inputDataBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(chunk) {
  inputDataBuffer += chunk;
});
process.stdin.on('end', function() {
  const lines = inputDataBuffer.split('\n');
  processInputLines(lines);
});

function processInputLines(allInputLines) {
  let linePointer = 0;

  while (true) {
    const dimensions = allInputLines[linePointer++].split(' ').map(Number);
    const boardWidth = dimensions[0];
    const boardHeight = dimensions[1];

    if (boardWidth === 0 && boardHeight === 0) {
      break;
    }

    const gameGrid = createGrid(boardWidth, boardHeight);

    const initialPosition = allInputLines[linePointer++].split(' ').map(Number);
    const finalDestination = allInputLines[linePointer++].split(' ').map(Number);

    const blockDefinitionCount = Number(allInputLines[linePointer++]);
    for (let k = 0; k < blockDefinitionCount; k++) {
      const blockDetails = allInputLines[linePointer++].split(' ').map(Number);
      applyBlockToGrid(gameGrid, blockDetails[0], blockDetails[1], blockDetails[2], blockDetails[3]);
    }

    const pathFound = findPath(gameGrid, initialPosition, finalDestination);
    console.log(pathFound ? 'OK' : 'NG');
  }
}

function createGrid(gridCols, gridRows) {
  return Array.from({ length: gridCols }, () => Array.from({ length: gridRows }, () => 0));
}

function applyBlockToGrid(targetGrid, blockColor, blockOrientation, colStart, rowStart) {
  const blockDimensions = blockOrientation === 0 ? { width: 4, height: 2 } : { width: 2, height: 4 };

  const actualColStart = colStart - 1;
  const actualRowStart = rowStart - 1;

  const cellsToFill = Array.from({ length: blockDimensions.height }, (_, rOffset) =>
    Array.from({ length: blockDimensions.width }, (_, cOffset) => ({
      column: actualColStart + cOffset,
      row: actualRowStart + rOffset
    }))
  ).flat();

  cellsToFill.forEach(cell => {
    targetGrid[cell.column][cell.row] = blockColor;
  });
}

function findPath(currentGrid, startCoordinates, endCoordinates) {
  const startColIdx = startCoordinates[0] - 1;
  const startRowIdx = startCoordinates[1] - 1;
  const endColIdx = endCoordinates[0] - 1;
  const endRowIdx = endCoordinates[1] - 1;

  const initialCellIdentifier = currentGrid[startColIdx][startRowIdx];

  if (initialCellIdentifier === 0) {
    return false;
  }

  const visitedNodes = new Set();
  const traversalQueue = [];

  const startNodeKey = `${startColIdx},${startRowIdx}`;
  traversalQueue.push([startColIdx, startRowIdx]);
  visitedNodes.add(startNodeKey);

  const movementDirections = [
    { deltaC: -1, deltaR: -1 }, { deltaC: 0, deltaR: -1 }, { deltaC: 1, deltaR: -1 },
    { deltaC: -1, deltaR: 0 },                           { deltaC: 1, deltaR: 0 },
    { deltaC: -1, deltaR: 1 },  { deltaC: 0, deltaR: 1 },  { deltaC: 1, deltaR: 1 }
  ];

  while (traversalQueue.length > 0) {
    const [currentC, currentR] = traversalQueue.shift();

    if (currentC === endColIdx && currentR === endRowIdx) {
      return true;
    }

    for (const direction of movementDirections) {
      const nextC = currentC + direction.deltaC;
      const nextR = currentR + direction.deltaR;
      const nextNodeKey = `${nextC},${nextR}`;

      if (nextC < 0 || nextC >= currentGrid.length || nextR < 0 || nextR >= currentGrid[0].length) {
        continue;
      }

      if (visitedNodes.has(nextNodeKey)) {
        continue;
      }

      if (currentGrid[nextC][nextR] !== initialCellIdentifier) {
        continue;
      }

      visitedNodes.add(nextNodeKey);
      traversalQueue.push([nextC, nextR]);
    }
  }

  return false;
}
