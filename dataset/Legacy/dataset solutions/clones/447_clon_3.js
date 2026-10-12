const parseDimensionLine = (lineStr) => lineStr.split(' ').map(parseFloat);
const parseGridRow = (lineStr) => lineStr.split(' ').map(parseFloat);

const createPathKey = (xCoord, yCoord) => `${xCoord},${yCoord}`;

const getPathValue = (pathMap, xCoord, yCoord) => {
  const key = createPathKey(xCoord, yCoord);
  return pathMap[key] || 0;
};

const setPathValue = (pathMap, xCoord, yCoord, value) => {
  const key = createPathKey(xCoord, yCoord);
  pathMap[key] = value;
};

const addToPathValue = (pathMap, xCoord, yCoord, amount) => {
  const current = getPathValue(pathMap, xCoord, yCoord);
  setPathValue(pathMap, xCoord, yCoord, current + amount);
};

function processGridData() {
  let inputLineCursor = 0;
  let gridDimensions;
  let gridContent;
  let pathAccumulator;
  let finalPathSum;

  const blockingSentinelRow = Array(15).fill(2);

  for (;;) {
    gridDimensions = parseDimensionLine(rawDataInput[inputLineCursor++]);
    const gridWidth = gridDimensions[0];
    const gridHeight = gridDimensions[1];

    if (gridWidth === 0 && gridHeight === 0) {
      break;
    }

    gridContent = [];
    for (let currentRowIndex = 0; currentRowIndex < gridHeight; currentRowIndex++) {
      gridContent.push(parseGridRow(rawDataInput[inputLineCursor++]));
    }
    gridContent.push(blockingSentinelRow);

    finalPathSum = 0;
    pathAccumulator = {};

    for (let currentGridX = 0; currentGridX < gridWidth; currentGridX++) {
      if (gridContent[0][currentGridX] === 0) {
        setPathValue(pathAccumulator, currentGridX, 0, 1);
      } else {
        setPathValue(pathAccumulator, currentGridX, 0, 0);
      }
    }

    for (let currentGridY = 0; currentGridY < gridHeight; currentGridY++) {
      for (let currentGridX = 0; currentGridX < gridWidth; currentGridX++) {
        const currentCellType = gridContent[currentGridY][currentGridX];
        const currentCellPaths = getPathValue(pathAccumulator, currentGridX, currentGridY);

        if (currentCellPaths === 0) {
          continue;
        }

        const nextY = currentGridY + 1;
        const nextNextY = currentGridY + 2;
        const prevX = currentGridX - 1;
        const nextX = currentGridX + 1;

        switch (currentCellType) {
          case 0:
            if (gridContent[nextY][prevX] !== 2) {
              addToPathValue(pathAccumulator, prevX, nextY, currentCellPaths);
            }
            addToPathValue(pathAccumulator, currentGridX, nextY, currentCellPaths);
            if (gridContent[nextY][nextX] !== 2) {
              addToPathValue(pathAccumulator, nextX, nextY, currentCellPaths);
            }
            break;
          case 1:
            break;
          case 2:
            addToPathValue(pathAccumulator, currentGridX, nextNextY, currentCellPaths);
            break;
        }
      }
    }

    for (let sumY = gridHeight; sumY <= gridHeight + 1; sumY++) {
      for (let sumX = 0; sumX < gridWidth; sumX++) {
        finalPathSum += getPathValue(pathAccumulator, sumX, sumY);
      }
    }

    console.log(finalPathSum);
  }
}

/*
function visualizeGridState(dimensions, pathMap) {
  const gridWidth = dimensions[0];
  const gridHeight = dimensions[1];
  let currentGridX, currentGridY, rowLine;
  for (currentGridY = 0; currentGridY <= gridHeight; currentGridY++) {
    rowLine = [];
    for (currentGridX = 0; currentGridX < gridWidth; currentGridX++) {
      rowLine.push(getPathValue(pathMap, currentGridX, currentGridY));
    }
    console.log(rowLine.join(' '));
  }
}
*/

let rawDataInput = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(dataChunk) {
  rawDataInput += dataChunk;
});
process.stdin.on('end', function() {
  rawDataInput = rawDataInput.split('\n');
  processGridData();
});
