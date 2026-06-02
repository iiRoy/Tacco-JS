'use strict'

function processGrid(inputStr) {
  const lineSegments = inputStr.split('\n');
  const dimensions = lineSegments[0].split(' ');
  const gridHeight = Number(dimensions[0]);
  const gridWidth = Number(dimensions[0]);

  const cellMatrix = lineSegments.slice(1, -1).map(line => line.split(''));

  const adjacencies = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0]
  ];

  const finalVerdict = cellMatrix.every((row, rowIndex) => {
    return row.every((currentCell, colIndex) => {
      if (currentCell === '.') {
        return true;
      }

      return adjacencies.some(([dr, dc]) => {
        const neighborRow = rowIndex + dr;
        const neighborCol = colIndex + dc;

        const isWithinBounds = neighborRow >= 0 && neighborRow < gridHeight &&
                               neighborCol >= 0 && neighborCol < gridWidth;

        return isWithinBounds && cellMatrix[neighborRow][neighborCol] === '#';
      });
    });
  });

  console.log(finalVerdict ? 'Yes' : 'No');
}

processGrid(require("fs").readFileSync("/dev/stdin", "utf8"));
