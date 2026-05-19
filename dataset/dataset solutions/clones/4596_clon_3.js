function parseInteger(inputString) { return parseInt(inputString, 10); }
function parseFloatValue(inputString) { return parseFloat(inputString); }

function findStartCoordinates(gridMatrix, heightDim, widthDim) {
  let startPosition = [];
  findStartLoop: for (let row = 0; row < heightDim; row++) {
    for (let col = 0; col < widthDim; col++) {
      if (gridMatrix[row][col] === 'S') {
        startPosition = [row, col];
        break findStartLoop;
      }
    }
  }
  return startPosition;
}

function calculateMinDistanceToBoundary(currentRow, currentCol, totalHeight, totalWidth) {
  const distanceToBottom = (totalHeight - 1) - currentRow;
  const distanceToTop = currentRow;
  const distanceToRight = (totalWidth - 1) - currentCol;
  const distanceToLeft = currentCol;
  return Math.min(distanceToBottom, distanceToTop, distanceToRight, distanceToLeft);
}

function processGridData(inputLines) {
  const initialParams = inputLines[0].split(' ').map(parseInteger);
  const gridHeight = initialParams[0];
  const gridWidth = initialParams[1];
  const maxStepsPerMove = initialParams[2];

  const gridState = inputLines.slice(1).map(line => line.split(''));

  const startCoords = findStartCoordinates(gridState, gridHeight, gridWidth);
  const initialStartRow = startCoords[0];
  const initialStartCol = startCoords[1];

  const explorePathAsync = (currentRow, currentCol, currentPathLength) => {
    if (currentPathLength > maxStepsPerMove) {
      return;
    }

    const isOutOfBounds = currentRow < 0 || gridHeight <= currentRow || currentCol < 0 || gridWidth <= currentCol;
    if (isOutOfBounds) {
      return;
    }

    const cellContent = gridState[currentRow][currentCol];
    const isPathStartOrEmpty = cellContent === '.' || cellContent === 'S';
    const isShorterPathFound = (typeof cellContent === 'number') && cellContent > currentPathLength;

    if (isPathStartOrEmpty || isShorterPathFound) {
      gridState[currentRow][currentCol] = currentPathLength;

      const asyncDelay = 0;
      setTimeout(() => {
        explorePathAsync(currentRow - 1, currentCol, currentPathLength + 1);
        explorePathAsync(currentRow + 1, currentCol, currentPathLength + 1);
        explorePathAsync(currentRow, currentCol - 1, currentPathLength + 1);
        explorePathAsync(currentRow, currentCol + 1, currentPathLength + 1);
      }, asyncDelay);
    }
  };

  explorePathAsync(initialStartRow, initialStartCol, 0);

  let overallMinimumSteps = Infinity;

  calculateMinPathLoop: for (let row = 0; row < gridHeight; row++) {
    for (let col = 0; col < gridWidth; col++) {
      const currentCellValue = gridState[row][col];
      if (typeof currentCellValue === 'number') {
        const boundaryDistance = calculateMinDistanceToBoundary(row, col, gridHeight, gridWidth);

        if (boundaryDistance === 0) {
          overallMinimumSteps = 1;
          break calculateMinPathLoop;
        }

        const stepsToExit = Math.ceil(boundaryDistance / maxStepsPerMove) + 1;
        overallMinimumSteps = Math.min(overallMinimumSteps, stepsToExit);
      }
    }
  }

  console.log(overallMinimumSteps);
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const trimmedLines = fileContent.split('\n').map(line => line.trim());
processGridData(trimmedLines);
