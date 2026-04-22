const fileSystemModule = require('fs');

let finalTraversalResult = "";

function navigateCells(currentY, currentX, mazeGrid) {
  if (currentY < 0 || currentX < 0 || currentY >= mazeGrid.length || currentX >= mazeGrid[0].length) {
    if (finalTraversalResult === "") {
        finalTraversalResult = "OUT_OF_BOUNDS_ERROR";
    }
    return;
  }

  const cellContent = mazeGrid[currentY][currentX];

  if (cellContent === "X") {
    if (finalTraversalResult === "") {
      finalTraversalResult = "PATH_LOOP";
    }
    return;
  }

  if (cellContent === ".") {
    if (finalTraversalResult === "") {
      finalTraversalResult = `${currentX} ${currentY}`;
    }
    return;
  }

  let moveDeltaCol = 0;
  let moveDeltaRow = 0;

  switch (cellContent) {
    case ">":
      moveDeltaCol = 1;
      break;
    case "<":
      moveDeltaCol = -1;
      break;
    case "^":
      moveDeltaRow = -1;
      break;
    case "v":
      moveDeltaRow = 1;
      break;
    default:
      if (finalTraversalResult === "") {
         finalTraversalResult = "INVALID_CELL_TYPE";
      }
      return;
  }

  mazeGrid[currentY][currentX] = "X";

  const nextYCoordinate = currentY + moveDeltaRow;
  const nextXCoordinate = currentX + moveDeltaCol;

  navigateCells(nextYCoordinate, nextXCoordinate, mazeGrid);
}

const rawInputBuffer = fileSystemModule.readFileSync(0, 'utf8');

let inputLineSegments = rawInputBuffer.trim().split('\n').filter(line => line.length > 0);

const parseGridDimensions = (dimensionLine) => {
  const dimensionParts = dimensionLine.split(' ');
  if (dimensionParts.length !== 2) {
    return [0, 0];
  }
  const parsedRows = Number(dimensionParts[0]);
  const parsedCols = Number(dimensionParts[1]);

  if (isNaN(parsedRows) || isNaN(parsedCols)) {
    return [0, 0];
  }
  return [parsedRows, parsedCols];
};

while (true) {
  if (inputLineSegments.length === 0) {
    break;
  }

  const currentDimensionString = inputLineSegments.shift();
  const [gridRowsCount, gridColumnsCount] = parseGridDimensions(currentDimensionString);

  if (gridRowsCount === 0 && gridColumnsCount === 0) {
    break;
  }

  const mazeStructure = [];

  for (let rowIndex = 0; rowIndex < gridRowsCount; rowIndex++) {
    if (inputLineSegments.length === 0) {
      break;
    }
    const currentGridRowLine = inputLineSegments.shift();
    if (currentGridRowLine.length !== gridColumnsCount) {
    }
    mazeStructure.push(currentGridRowLine.split(''));
  }

  finalTraversalResult = "";

  navigateCells(0, 0, mazeStructure);

  console.log(finalTraversalResult);
}