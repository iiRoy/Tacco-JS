const fileSystem = require('fs');
const acquiredInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
const allRelevantLines = acquiredInput.split('\n').filter(Boolean);

let mapCollections = [];
let currentParsingIndex = 0;

while (currentParsingIndex < allRelevantLines.length) {
  const dimensionPair = allRelevantLines[currentParsingIndex].split(' ').map(Number);
  const mapExtentX = dimensionPair[0];
  const mapExtentY = dimensionPair[1];

  if (mapExtentX === 0 && mapExtentY === 0) {
    break;
  }

  currentParsingIndex++;
  const mapDataCells = [];
  for (let rowCursor = 0; rowCursor < mapExtentY; rowCursor++) {
    const rowContent = allRelevantLines[currentParsingIndex + rowCursor].split(' ').map(Number);
    mapDataCells.push(...rowContent);
  }

  mapCollections.push({
    widthDimension: mapExtentX,
    heightDimension: mapExtentY,
    cellValues: mapDataCells
  });
  currentParsingIndex += mapExtentY;
}

const propagateAndClear = (initialCol, initialRow, mutableGrid, gridWidthVal, gridHeightVal) => {
  const traversalStack = [[initialCol, initialRow]];
  const adjacencies = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, -1],           [0, 1],
    [1, -1],  [1, 0],  [1, 1]
  ];

  while (traversalStack.length > 0) {
    const [currentX, currentY] = traversalStack.pop();
    const linearIndex = currentY * gridWidthVal + currentX;

    if (
      currentX >= 0 && currentX < gridWidthVal &&
      currentY >= 0 && currentY < gridHeightVal &&
      mutableGrid[linearIndex] === 1
    ) {
      mutableGrid[linearIndex] = 0;

      for (const [deltaX, deltaY] of adjacencies) {
        const nextX = currentX + deltaX;
        const nextY = currentY + deltaY;
        traversalStack.push([nextX, nextY]);
      }
    }
  }
};

for (const currentMapData of mapCollections) {
  let islandCount = 0;
  const thisMapWidth = currentMapData.widthDimension;
  const thisMapHeight = currentMapData.heightDimension;
  const processingCopyGrid = [...currentMapData.cellValues];

  for (let yCoord = 0; yCoord < thisMapHeight; yCoord++) {
    for (let xCoord = 0; xCoord < thisMapWidth; xCoord++) {
      const cellLinearIndex = yCoord * thisMapWidth + xCoord;
      if (processingCopyGrid[cellLinearIndex] === 1) {
        islandCount++;
        propagateAndClear(xCoord, yCoord, processingCopyGrid, thisMapWidth, thisMapHeight);
      }
    }
  }
  console.log(islandCount);
}