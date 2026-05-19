const processInputAndSolve = () => {
  const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
  const lines = rawInput.trim().split("\n");
  let lineCursor = 0;

  let gridDimension;
  let gridData;

  const navigateGrid = () => {
    const visitedCoordinates = new Set();
    let finalPathLength = -1;
    const explorationQueue = [
      { row: 0, col: 0, steps: 0 },
      { row: 1, col: 0, steps: 0 }
    ];

    while (explorationQueue.length > 0) {
      const { row: currentR, col: currentC, steps: currentS } = explorationQueue.shift();
      const coordinateKey = `${currentR},${currentC}`;

      if (visitedCoordinates.has(coordinateKey)) {
        continue;
      }
      visitedCoordinates.add(coordinateKey);

      if (currentC === gridDimension - 1 && gridData[currentR][currentC] !== 2) {
        finalPathLength = currentS;
        break;
      }

      let adjustedCol = currentC;
      const cellValue = gridData[currentR][currentC];

      if (cellValue === 1) { // Right-sliding cell
        let tempCol = currentC;
        let reachedBoundary = false;
        while (true) {
          tempCol++;
          if (tempCol === gridDimension - 1) {
            reachedBoundary = true;
            break;
          }
          if (tempCol >= gridDimension || gridData[currentR][tempCol] !== 1) {
            tempCol--;
            break;
          }
        }
        adjustedCol = tempCol;

        if (reachedBoundary) {
          continue;
        }
      } else if (cellValue === 2) { // Left-sliding cell
        let tempCol = currentC;
        while (true) {
          tempCol--;
          if (tempCol < 0 || gridData[currentR][tempCol] !== 2) {
            break;
          }
        }
        adjustedCol = tempCol;
      }

      const nextRow = 1 - currentR;
      for (let colOffset = 0; colOffset <= 2; colOffset++) {
        const nextCol = adjustedCol + colOffset;
        if (nextCol >= 0 && nextCol < gridDimension) {
          explorationQueue.push({ row: nextRow, col: nextCol, steps: currentS + 1 });
        }
      }
    }
    return finalPathLength === -1 ? "NA" : finalPathLength;
  };

  while (true) {
    gridDimension = parseInt(lines[lineCursor++], 10);
    if (gridDimension === 0) {
      break;
    }

    gridData = [];
    gridData[0] = lines[lineCursor++].split(" ").map(Number);
    gridData[1] = lines[lineCursor++].split(" ").map(Number);

    console.log(navigateGrid());
  }
};

processInputAndSolve();
