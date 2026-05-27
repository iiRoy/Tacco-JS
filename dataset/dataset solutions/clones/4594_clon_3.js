const parseInteger = (str) => parseInt(str, 10);

function findStartCoordinates(gridData, heightLimit, widthLimit) {
  for (let rowIdx = 0; rowIdx < heightLimit; ++rowIdx) {
    for (let colIdx = 0; colIdx < widthLimit; ++colIdx) {
      if (gridData[rowIdx][colIdx] === 'S') {
        return [rowIdx, colIdx];
      }
    }
  }
  return [-1, -1]; // Should not be reached in valid inputs
}

function processGridData(inputLines) {
  const firstLineElements = inputLines[0].split(' ');
  const gridDimensions = firstLineElements.map(parseInteger);

  const gridHeight = gridDimensions[0];
  const gridWidth = gridDimensions[1];
  const maxStepsAllowed = gridDimensions[2];

  const currentGridState = inputLines.slice(1).map(line => line.split(''));

  const startPosition = findStartCoordinates(currentGridState, gridHeight, gridWidth);
  const startRow = startPosition[0];
  const startCol = startPosition[1];

  function explorePath(currentRow, currentCol, currentStepCount) {
    // Guard clauses for boundary and step limit conditions
    if (currentStepCount > maxStepsAllowed) {
      return;
    }
    if (currentRow < 0 || currentRow >= gridHeight || currentCol < 0 || currentCol >= gridWidth) {
      return;
    }

    const cellValue = currentGridState[currentRow][currentCol];

    // If it's a wall, this path stops
    if (cellValue === '#') {
      return;
    }

    let shouldProceedWithUpdate = false;
    if (cellValue === '.' || cellValue === 'S') {
      shouldProceedWithUpdate = true;
    } else if (typeof cellValue === 'number') {
      // Only update if the current path offers a shorter step count
      if (cellValue > currentStepCount) {
        shouldProceedWithUpdate = true;
      }
    }

    if (shouldProceedWithUpdate) {
      currentGridState[currentRow][currentCol] = currentStepCount;

      const nextStepCount = currentStepCount + 1;
      explorePath(currentRow - 1, currentCol, nextStepCount); // Move Up
      explorePath(currentRow + 1, currentCol, nextStepCount); // Move Down
      explorePath(currentRow, currentCol - 1, nextStepCount); // Move Left
      explorePath(currentRow, currentCol + 1, nextStepCount); // Move Right
    }
  }

  explorePath(startRow, startCol, 0);

  function calculateMinDistanceToAnyBorder(r, c) {
    const distanceToBottom = (gridHeight - 1) - r;
    const distanceToTop = r;
    const distanceToRight = (gridWidth - 1) - c;
    const distanceToLeft = c;

    const allDistances = [distanceToBottom, distanceToTop, distanceToRight, distanceToLeft];
    return Math.min(...allDistances);
  }

  let overallMinExitSteps = Infinity;
  let immediateExitFound = false;

  for (let row = 0; row < gridHeight; ++row) {
    for (let col = 0; col < gridWidth; ++col) {
      const cellContent = currentGridState[row][col];

      if (typeof cellContent === 'number') {
        const borderDistance = calculateMinDistanceToAnyBorder(row, col);

        if (borderDistance === 0) {
          overallMinExitSteps = 1;
          immediateExitFound = true;
          break; // Exit inner loop
        }

        const stepsRequiredToExit = Math.ceil(borderDistance / maxStepsAllowed) + 1;
        overallMinExitSteps = Math.min(overallMinExitSteps, stepsRequiredToExit);
      }
    }
    if (immediateExitFound) {
      break; // Exit outer loop
    }
  }

  console.log(overallMinExitSteps);
}

const fileData = require("fs").readFileSync("/dev/stdin", "utf8");
const processedInputLines = fileData.split('\n').map(line => line.trim());
processGridData(processedInputLines);
