let rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
let lineSegments = rawData.trim().split('\n');
let linePointer = 0;

function propagateClear(startY, startX, targetChar, maxRows, maxCols, currentGrid) {
  const traversalQueue = [[startY, startX]];
  const directions = [[0, -1], [0, 1], [-1, 0], [1, 0]];
  let head = 0;

  while (head < traversalQueue.length) {
    const [cY, cX] = traversalQueue[head++];

    for (const [deltaY, deltaX] of directions) {
      const nY = cY + deltaY;
      const nX = cX + deltaX;

      if (nY >= 0 && nY < maxRows && nX >= 0 && nX < maxCols && currentGrid[nY][nX] === targetChar) {
        currentGrid[nY][nX] = '0';
        traversalQueue.push([nY, nX]);
      }
    }
  }
}

while (true) {
  let dimensions = lineSegments[linePointer++].split(' ').map(Number);
  let rowCount = dimensions[0];
  let colCount = dimensions[1];

  if (rowCount === 0 && colCount === 0) {
    break;
  }

  let gridMatrix = [];
  for (let r = 0; r < rowCount; r++) {
    gridMatrix.push(lineSegments[linePointer++].split(''));
  }

  let totalClusters = 0;
  const bombIndicators = new Set(['@', '#', '*']);

  for (let rIdx = 0; rIdx < rowCount; rIdx++) {
    for (let cIdx = 0; cIdx < colCount; cIdx++) {
      let cellContent = gridMatrix[rIdx][cIdx];

      if (bombIndicators.has(cellContent)) {
        totalClusters++;
        gridMatrix[rIdx][cIdx] = '0';
        propagateClear(rIdx, cIdx, cellContent, rowCount, colCount, gridMatrix);
      }
    }
  }
  console.log(totalClusters);
}
