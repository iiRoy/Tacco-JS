'use strict';

function processInput(inputString) {
  let inputLines = inputString.split('\n');

  const numRows = parseInt(inputLines[0].split(' ')[0], 10);
  const numCols = parseInt(inputLines[0].split(' ')[1], 10);

  const startRowIdx = 0;
  const startColIdx = 0;

  const targetRowIdx = numRows - 1;
  const targetColIdx = numCols - 1;

  const gridMatrix = inputLines.slice(1, -1).map(aLine => aLine.split(''));
  const visitedDistances = Array.from({ length: numRows }).map(_ => Array.from({ length: numCols }).fill('UNVISITED'));

  const rowDelta = [0, 1, 0, -1];
  const colDelta = [1, 0, -1, 0];

  const calculateShortestPath = () => {
    const cellQueue = [];

    cellQueue.push([startRowIdx, startColIdx]);
    visitedDistances[startRowIdx][startColIdx] = 1;

    while (cellQueue.length > 0) {
      const currentCell = cellQueue.shift();

      if (currentCell[0] === targetRowIdx && currentCell[1] === targetColIdx) {
        break;
      }

      for (let direction = 0; direction < 4; direction++) {
        const nextRowCoord = currentCell[0] + rowDelta[direction];
        const nextColCoord = currentCell[1] + colDelta[direction];

        if (nextRowCoord < 0 || numRows <= nextRowCoord) continue;
        if (nextColCoord < 0 || numCols <= nextColCoord) continue;
        if (gridMatrix[nextRowCoord][nextColCoord] === '#') continue;
        if (visitedDistances[nextRowCoord][nextColCoord] !== 'UNVISITED') continue;

        cellQueue.push([nextRowCoord, nextColCoord]);
        visitedDistances[nextRowCoord][nextColCoord] = visitedDistances[currentCell[0]][currentCell[1]] + 1;
      }
    }

    return visitedDistances[targetRowIdx][targetColIdx];
  };

  const determineAccessibleCells = () => {
    return gridMatrix.map(rowContent => rowContent.filter(cellSymbol => cellSymbol === '.').length).reduce((accum, current) => accum + current, 0);
  };

  let finalOutcome = 0;
  const minimumStepsToTarget = calculateShortestPath();

  if (minimumStepsToTarget === 'UNVISITED') {
    finalOutcome = -1;
  } else {
    finalOutcome = determineAccessibleCells() - minimumStepsToTarget;
  }

  console.log(finalOutcome);
}

processInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));