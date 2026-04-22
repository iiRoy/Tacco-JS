const processGridData = (inputLines) => {
  const [gridHeight, gridWidth] = inputLines[0].split(' ').map(Number);

  const cellRegistry = new Map();
  let maxPathLength = 0;
  let exitEarly = false;

  for (let rIdx = 0; rIdx < gridHeight; ++rIdx) {
    const currentRow = inputLines[rIdx + 1];
    for (let cIdx = 0; cIdx < gridWidth; ++cIdx) {
      if (exitEarly) break;
      
      const currentCellKey = `${rIdx}_${cIdx}`;
      const cellContent = currentRow[cIdx];

      if (cellContent === '#') {
        cellRegistry.set(currentCellKey, { kind: '#', horizontalReach: 0, verticalReach: 0 });
      } else {
        let currentHorizontalReach = 1;
        let currentVerticalReach = 1;

        const leftCellKey = `${rIdx}_${cIdx - 1}`;
        const upperCellKey = `${rIdx - 1}_${cIdx}`;

        const leftCellData = cellRegistry.get(leftCellKey);
        if (leftCellData && leftCellData.kind === '.') {
          currentHorizontalReach += leftCellData.horizontalReach;
        }

        const upperCellData = cellRegistry.get(upperCellKey);
        if (upperCellData && upperCellData.kind === '.') {
          currentVerticalReach += upperCellData.verticalReach;
        }

        cellRegistry.set(currentCellKey, {
          kind: '.',
          horizontalReach: currentHorizontalReach,
          verticalReach: currentVerticalReach
        });

        const currentCrossTotal = currentHorizontalReach + currentVerticalReach - 1;
        if (currentCrossTotal > maxPathLength) {
          maxPathLength = currentCrossTotal;
        }

        if (maxPathLength === gridHeight + gridWidth - 1) {
          exitEarly = true;
        }
      }
    }
    if (exitEarly) break;
  }

  console.log(maxPathLength);
};

processGridData(require('fs').readFileSync('/dev/stdin', 'UTF-8').trim().split("\n"));