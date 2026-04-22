'use strict';
console.log((function(originData) {
  const initialDataLines = originData.trim().split('\n');

  const matrixDimensions = initialDataLines[0].split(' ').map(Number);
  const rowQuantity = matrixDimensions[0];
  const columnQuantity = matrixDimensions[1];

  let totalPassableSpots = 0;
  const obstacleLocations = new Set();

  for (let rowIdx = 1; rowIdx <= rowQuantity; ++rowIdx) {
    const currentLine = initialDataLines[rowIdx];
    for (let colIdx = 1; colIdx <= columnQuantity; ++colIdx) {
      if (currentLine[colIdx - 1] === '#') {
        obstacleLocations.add(`${colIdx},${rowIdx}`);
      } else {
        totalPassableSpots++;
      }
    }
  }

  const startX = 1;
  const startY = 1;
  const endX = columnQuantity;
  const endY = rowQuantity;

  const processingQueue = [];
  const travelLog = new Map();

  const movementVectors = [
    { dx: 0, dy: 1 },
    { dx: 0, dy: -1 },
    { dx: 1, dy: 0 },
    { dx: -1, dy: 0 }
  ];

  processingQueue.push({ x: startX, y: startY, pathLength: 2 });
  travelLog.set(`${startX},${startY}`, 2);

  let finalPathLength = -1;

  while (processingQueue.length > 0) {
    const currentPosition = processingQueue.shift();
    const { x: currentX, y: currentY, pathLength: currentDistance } = currentPosition;

    if (currentX === endX && currentY === endY) {
      finalPathLength = currentDistance;
      break;
    }

    for (const vector of movementVectors) {
      const nextX = currentX + vector.dx;
      const nextY = currentY + vector.dy;
      const nextCoordKey = `${nextX},${nextY}`;

      if (
        nextX >= 1 && nextX <= columnQuantity &&
        nextY >= 1 && nextY <= rowQuantity &&
        !obstacleLocations.has(nextCoordKey)
      ) {
        if (!travelLog.has(nextCoordKey)) {
          const newDistance = currentDistance + 1;
          travelLog.set(nextCoordKey, newDistance);
          processingQueue.push({ x: nextX, y: nextY, pathLength: newDistance });
        }
      }
    }
  }

  return totalPassableSpots - finalPathLength;

})(require('fs').readFileSync('/dev/stdin', 'utf8')));