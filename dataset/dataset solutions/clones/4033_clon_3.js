'use strict'

function processInput(inputStr) {
  const lines = inputStr.split('\n');

  const firstLineParts = lines[0].split(' ');
  const numRows = Number(firstLineParts[0]);
  const numCols = Number(firstLineParts[1]);

  const startRow = 0;
  const startCol = 0;

  const goalRow = numRows - 1;
  const goalCol = numCols - 1;

  const gridMap = lines.slice(1, -1).map(currentLine => currentLine.split(''));
  const distMatrix = Array.from({ length: numRows }, () => Array(numCols).fill('*'));

  const deltaRows = [0, 1, 0, -1];
  const deltaCols = [1, 0, -1, 0];

  const isWithinBounds = (r, c) => {
    return r >= 0 && r < numRows && c >= 0 && c < numCols;
  };

  const isWall = (r, c) => {
    return gridMap[r][c] === '#';
  };

  const isUnvisited = (r, c) => {
    return distMatrix[r][c] === '*';
  };

  const findShortestPath = () => {
    const queueNodes = [];

    queueNodes.push([startRow, startCol]);
    distMatrix[startRow][startCol] = 1;

    while (queueNodes.length > 0) {
      const currentNode = queueNodes.shift();
      const currentRow = currentNode[0];
      const currentCol = currentNode[1];

      if (currentRow === goalRow && currentCol === goalCol) {
        break;
      }

      for (let directionIdx = 0; directionIdx < 4; directionIdx++) {
        const nextRow = currentRow + deltaRows[directionIdx];
        const nextCol = currentCol + deltaCols[directionIdx];

        if (!isWithinBounds(nextRow, nextCol)) {
          continue;
        }
        if (isWall(nextRow, nextCol)) {
          continue;
        }
        if (!isUnvisited(nextRow, nextCol)) {
          continue;
        }

        queueNodes.push([nextRow, nextCol]);
        distMatrix[nextRow][nextCol] = distMatrix[currentRow][currentCol] + 1;
      }
    }

    return distMatrix[goalRow][goalCol];
  };

  const countEmptyCells = () => {
    let blankCellCount = 0;
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (gridMap[r][c] === '.') {
          blankCellCount++;
        }
      }
    }
    return blankCellCount;
  };

  let finalResult = 0;
  const pathLength = findShortestPath();

  if (pathLength === '*') {
    finalResult = -1;
  } else {
    const totalBlanks = countEmptyCells();
    finalResult = totalBlanks - pathLength;
  }

  console.log(finalResult);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
