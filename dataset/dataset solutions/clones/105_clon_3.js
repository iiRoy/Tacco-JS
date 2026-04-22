const GRID_OFFSET_VAL = 2;
const INITIAL_GRID_SIZE = 14;
const RESULT_SUBGRID_SIZE = 10;

function findMaximumValue(valA, valB) {
  const difference = valA - valB;
  return valA - (difference & (difference >> 31));
}

function parseCoordinateComponent(charValue) {
    return parseInt(charValue, 10);
}

function applyCellImpact(impactGrid, r, c) {
    if (r >= 0 && r < INITIAL_GRID_SIZE && c >= 0 && c < INITIAL_GRID_SIZE) {
        impactGrid[r][c]++;
    } else {
        // console.warn(`Attempted to access out-of-bounds cell: [${r}, ${c}]`);
    }
}

function processInputData(rawInputLines) {
  if (!rawInputLines || rawInputLines.length === 0 || (rawInputLines.length === 1 && rawInputLines[0].trim() === '')) {
    console.error("No valid input lines provided for processing.");
    return;
  }

  const impactGrid = Array.from({ length: INITIAL_GRID_SIZE }, () =>
    Array.from({ length: INITIAL_GRID_SIZE }, () => 0)
  );

  for (let entryIndex = rawInputLines.length - 1; entryIndex >= 0; entryIndex--) {
    const currentEntry = rawInputLines[entryIndex];

    if (!currentEntry.trim()) {
        continue;
    }

    const colCoordinate = parseCoordinateComponent(currentEntry[0]);
    const rowCoordinate = parseCoordinateComponent(currentEntry[2]);
    const impactType = currentEntry[4];

    const adjustedRow = rowCoordinate + GRID_OFFSET_VAL;
    const adjustedCol = colCoordinate + GRID_OFFSET_VAL;

    switch (impactType) {
      case '3':
        applyCellImpact(impactGrid, adjustedRow + 2, adjustedCol);
        applyCellImpact(impactGrid, adjustedRow - 2, adjustedCol);
        applyCellImpact(impactGrid, adjustedRow, adjustedCol - 2);
        applyCellImpact(impactGrid, adjustedRow, adjustedCol + 2);
      case '2':
        applyCellImpact(impactGrid, adjustedRow + 1, adjustedCol - 1);
        applyCellImpact(impactGrid, adjustedRow + 1, adjustedCol + 1);
        applyCellImpact(impactGrid, adjustedRow - 1, adjustedCol - 1);
        applyCellImpact(impactGrid, adjustedRow - 1, adjustedCol + 1);
      case '1':
        applyCellImpact(impactGrid, adjustedRow + 1, adjustedCol);
        applyCellImpact(impactGrid, adjustedRow, adjustedCol - 1);
        applyCellImpact(impactGrid, adjustedRow, adjustedCol);
        applyCellImpact(impactGrid, adjustedRow, adjustedCol + 1);
        applyCellImpact(impactGrid, adjustedRow - 1, adjustedCol);
        break;
      default:
        console.warn(`Unrecognized impact type '${impactType}' for entry: ${currentEntry}. Skipping.`);
        break;
    }
  }

  let unaffectedCellCount = 0;
  let peakImpactValue = 0;

  for (let rowIdx = 0; rowIdx < RESULT_SUBGRID_SIZE; rowIdx++) {
    for (let colIdx = 0; colIdx < RESULT_SUBGRID_SIZE; colIdx++) {
      const currentCellValue = impactGrid[rowIdx + GRID_OFFSET_VAL][colIdx + GRID_OFFSET_VAL];

      if (currentCellValue === 0) {
        unaffectedCellCount++;
      }

      peakImpactValue = findMaximumValue(currentCellValue, peakImpactValue);
    }
  }

  console.log(unaffectedCellCount);
  console.log(peakImpactValue);
}

let accumulatedInputBuffer = '';

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function(chunk) {
  accumulatedInputBuffer += chunk;
});

process.stdin.on('end', function() {
  const cleanedInput = accumulatedInputBuffer.trim();

  if (!cleanedInput) {
    console.error("Input stream ended, but no data was received or it was all whitespace.");
    return;
  }

  const linesArray = cleanedInput.split('\n');

  processInputData(linesArray);
});