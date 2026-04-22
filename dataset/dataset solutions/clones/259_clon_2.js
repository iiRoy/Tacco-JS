let systemConfig = {};

// A two-dimensional rectangular grid. Elements represent connections: -1 (right of bar), 0 (no bar), 1 (left of bar).
let connectionGrid = [];

// Function to determine a path
let traceForward = function (initialPosition, initialRow) {
  if (!initialRow) initialRow = 0;
  let currentPosition = initialPosition;
  let pathHistory = [currentPosition];
  for (let rowIndex = initialRow; rowIndex < connectionGrid.length; rowIndex++) {
    currentPosition += connectionGrid[rowIndex][currentPosition];
    pathHistory.push(currentPosition);
  }
  return pathHistory;
};

// Path determination when the destination is known (path from start to destination)
let traceBackward = function (finalPosition) {
  let currentPosition = finalPosition;
  let pathHistory = [currentPosition];
  for (let rowIndex = connectionGrid.length - 1; rowIndex >= 0; rowIndex--) {
    currentPosition += connectionGrid[rowIndex][currentPosition];
    pathHistory.push(currentPosition);
  }
  return pathHistory.reverse();
};

let collectedInputLines = [];
process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function (dataBlock) {
  dataBlock
    .trim()
    .split('\n')
    .forEach(function (textLine) {
      collectedInputLines.push(textLine);
    });
});

process.stdin.on('end', function () {
  let finalOutcome = '';

  // Prepare and parse the input data
  systemConfig = {};
  connectionGrid = [];
  for (let lineIndex = 0; lineIndex < collectedInputLines.length; lineIndex++) {
    let currentInputLine = collectedInputLines[lineIndex];
    if (currentInputLine == '0') break;

    let configKeys = ['numLines', 'beginPoint', 'endPoint', 'maxSteps'];
    if (lineIndex < configKeys.length) {
      systemConfig[configKeys[lineIndex]] = parseInt(currentInputLine);
      continue;
    }

    // For grid rows beyond initial configuration
    let gridRow = [];
    for (let columnIndex = 0; columnIndex < systemConfig.numLines - 1; columnIndex++) {
      let cellValue = parseInt(currentInputLine.charAt(columnIndex));
      if (columnIndex > 0 && cellValue == 0 && gridRow[columnIndex - 1] == 1) cellValue = -1;
      gridRow.push(cellValue);
    }
    gridRow.push(gridRow[gridRow.length - 1] == 1 ? -1 : 0);
    connectionGrid.push(gridRow);
  }
  systemConfig.beginPoint -= 1;
  systemConfig.endPoint -= 1;

  let forwardMovement = traceForward(systemConfig.beginPoint);
  if (forwardMovement[forwardMovement.length - 1] == systemConfig.endPoint) {
    console.log('0');
    return;
  }
  let backwardMovement = traceBackward(systemConfig.endPoint);

  for (let rowIndex = 0; rowIndex < systemConfig.maxSteps; rowIndex++) {
    // Check if positions are adjacent
    if (
      Math.abs(forwardMovement[rowIndex] - backwardMovement[rowIndex]) == 1 &&
      connectionGrid[rowIndex][forwardMovement[rowIndex]] == 0 &&
      connectionGrid[rowIndex][backwardMovement[rowIndex]] == 0
    ) {
      finalOutcome =
        rowIndex + 1 + ' ' + (Math.min(forwardMovement[rowIndex], backwardMovement[rowIndex]) + 1);
      break;
    }
  }
  if (finalOutcome == '') finalOutcome = '1';

  console.log(finalOutcome);
});