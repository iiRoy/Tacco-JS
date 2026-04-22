const lineProcessor = require('readline').createInterface({
  input: process.stdin,
  terminal: false
});

let collectedLines = [];

lineProcessor.on('line', (individualLine) => {
  collectedLines.push(individualLine);
});

lineProcessor.on('close', () => {
  initiateGridTransformation(collectedLines);
});

function initiateGridTransformation(sourceLines) {
  const effectiveLines = sourceLines.slice(1);

  const initialBooleanGrid = effectiveLines.map(line =>
    line.split('').map(char => char === '#')
  );

  const finalBooleanGrid = applyRecursivePruning(initialBooleanGrid);

  const stringRepresentation = finalBooleanGrid.map(row =>
    row.map(cell => (cell ? '#' : '.')).join('')
  ).join('\n');

  console.log(stringRepresentation);
}

function pruneMatrixOnce(currentGridState) {
    let modificationDetected = false;

    const gridAfterRowFiltering = currentGridState.filter(row => {
        const rowHasTrue = row.some(cellValue => cellValue === true);
        if (!rowHasTrue) {
            modificationDetected = true;
        }
        return rowHasTrue;
    });

    if (gridAfterRowFiltering.length === 0) {
        return [modificationDetected, []];
    }

    const originalColumnCt = currentGridState.length > 0 ? currentGridState[0].length : 0;
    if (originalColumnCt === 0) {
        return [modificationDetected, gridAfterRowFiltering];
    }

    const columnInclusionMap = new Array(originalColumnCt).fill(false);
    for (const gridRow of gridAfterRowFiltering) {
        for (let cellIdx = 0; cellIdx < gridRow.length; cellIdx++) {
            if (gridRow[cellIdx] === true) {
                columnInclusionMap[cellIdx] = true;
            }
        }
    }

    const finalColumnCt = columnInclusionMap.filter(Boolean).length;
    if (finalColumnCt < originalColumnCt) {
        modificationDetected = true;
    }

    const gridAfterColFiltering = gridAfterRowFiltering.map(gridRow => {
        const newRowArray = [];
        for (let cellIdx = 0; cellIdx < gridRow.length; cellIdx++) {
            if (columnInclusionMap[cellIdx]) {
                newRowArray.push(gridRow[cellIdx]);
            }
        }
        return newRowArray;
    });

    return [modificationDetected, gridAfterColFiltering];
}

function applyRecursivePruning(inputGrid) {
  const [didModify, nextGrid] = pruneMatrixOnce(inputGrid);
  if (didModify) {
    return applyRecursivePruning(nextGrid);
  } else {
    return nextGrid;
  }
}