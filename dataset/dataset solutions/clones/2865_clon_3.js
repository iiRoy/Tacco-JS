const processInput = (inputLines) => {
  const gridDimensions = inputLines[0].split(" ");
  const gridHeight = parseInt(gridDimensions[0], 10);
  const gridWidth = parseInt(gridDimensions[1], 10);

  const getCellIdentifier = (r, c) => `${r}_${c}`;

  const gridContent = {};
  const horizontalPathLengths = {};
  const verticalPathLengths = {};
  const validCellIdentifiers = [];

  const initializePathCount = () => ({ count: 1 });

  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    gridContent[rowIdx] = inputLines[rowIdx + 1];

    for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
      const cellCharacter = gridContent[rowIdx].charAt(colIdx);

      if (cellCharacter !== "#") {
        const currentCellId = getCellIdentifier(rowIdx, colIdx);
        validCellIdentifiers.push(currentCellId);

        const leftNeighborId = getCellIdentifier(rowIdx, colIdx - 1);
        if (horizontalPathLengths[leftNeighborId]) {
          horizontalPathLengths[currentCellId] = horizontalPathLengths[leftNeighborId];
          horizontalPathLengths[currentCellId].count++;
        } else {
          horizontalPathLengths[currentCellId] = initializePathCount();
        }

        const upNeighborId = getCellIdentifier(rowIdx - 1, colIdx);
        if (verticalPathLengths[upNeighborId]) {
          verticalPathLengths[currentCellId] = verticalPathLengths[upNeighborId];
          verticalPathLengths[currentCellId].count++;
        } else {
          verticalPathLengths[currentCellId] = initializePathCount();
        }
      }
    }
  }

  let maximumPathLength = 0;
  const theoreticalMaxPossible = gridHeight + gridWidth - 1;

  for (let idx = validCellIdentifiers.length - 1; idx >= 0; idx--) {
    const cellIdToExamine = validCellIdentifiers[idx];

    const currentHorizontalCount = horizontalPathLengths[cellIdToExamine].count;
    const currentVerticalCount = verticalPathLengths[cellIdToExamine].count;

    const combinedPathForCell = currentHorizontalCount + currentVerticalCount - 1;

    maximumPathLength = Math.max(maximumPathLength, combinedPathForCell);

    if (maximumPathLength === theoreticalMaxPossible) {
      break;
    }
  }

  console.log(maximumPathLength);
};

processInput(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));
