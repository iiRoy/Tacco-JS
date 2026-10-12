const directionVectors = (() => {
  const vectors = [];
  for (let dz = -1; dz <= 1; dz++) {
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx !== 0 || dy !== 0 || dz !== 0) {
          vectors.push([dx, dy, dz]);
        }
      }
    }
  }
  return vectors;
})();

function evaluateBoardForWin(activePlayer, placedColX, placedRowY, placedLayerZ, gameBoard, gridSize, boardDepth, winLength) {
  let overallMaxConsecutive = 0;

  for (const [dirX, dirY, dirZ] of directionVectors) {
    const linePoints = [];
    let currentX, currentY, currentZ;

    // Collect points in the negative direction (from the placed point, inclusive)
    currentX = placedColX; currentY = placedRowY; currentZ = placedLayerZ;
    while (currentX >= 0 && currentX < gridSize &&
           currentY >= 0 && currentY < gridSize &&
           currentZ >= 0 && currentZ < boardDepth) {
      linePoints.unshift([currentX, currentY, currentZ]);
      currentX -= dirX; currentY -= dirY; currentZ -= dirZ;
    }

    // Collect points in the positive direction (from the point after the placed point, exclusive)
    currentX = placedColX + dirX; currentY = placedRowY + dirY; currentZ = placedLayerZ + dirZ;
    while (currentX >= 0 && currentX < gridSize &&
           currentY >= 0 && currentY < gridSize &&
           currentZ >= 0 && currentZ < boardDepth) {
      linePoints.push([currentX, currentY, currentZ]);
      currentX += dirX; currentY += dirY; currentZ += dirZ;
    }

    // Analyze the collected line points for maximum consecutive pieces
    let currentConsecutive = 0;
    let maxConsecutiveInLine = 0;
    for (const [px, py, pz] of linePoints) {
      if (gameBoard[px][py][pz] === activePlayer) {
        currentConsecutive++;
      } else {
        currentConsecutive = 0;
      }
      maxConsecutiveInLine = Math.max(maxConsecutiveInLine, currentConsecutive);
    }
    overallMaxConsecutive = Math.max(overallMaxConsecutive, maxConsecutiveInLine);

    if (overallMaxConsecutive >= winLength) {
      return overallMaxConsecutive;
    }
  }
  return overallMaxConsecutive;
}

const inputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputData.trim().split("\n");
let currentLineIndex = 0;

while (true) {
  const gameParametersLine = inputLines[currentLineIndex++];
  if (gameParametersLine === "0 0 0") break;

  const [gridSize, winLength, depthAndMoveCount] = gameParametersLine.split(" ").map(Number);

  const gameBoard = Array.from({ length: gridSize }, () =>
    Array.from({ length: gridSize }, () =>
      Array.from({ length: depthAndMoveCount }, () => 0)
    )
  );

  const moveCoordinates = Array.from({ length: depthAndMoveCount }, () =>
    inputLines[currentLineIndex++].split(" ").map(Number)
  );

  let activePlayer = 1;
  let isDraw = true;

  for (let moveNumber = 0; moveNumber < depthAndMoveCount; moveNumber++) {
    const [inputCol, inputRow] = moveCoordinates[moveNumber];
    const placedColX = inputCol - 1;
    const placedRowY = inputRow - 1;

    const targetLayerZ = gameBoard[placedColX][placedRowY].findIndex(cell => cell === 0);

    gameBoard[placedColX][placedRowY][targetLayerZ] = activePlayer;

    if (evaluateBoardForWin(activePlayer, placedColX, placedRowY, targetLayerZ, gameBoard, gridSize, depthAndMoveCount, winLength) >= winLength) {
      console.log((activePlayer === 2) ? "White" : "Black", moveNumber + 1);
      isDraw = false;
      break;
    }

    activePlayer = (activePlayer === 1) ? 2 : 1;
  }

  if (isDraw) {
    console.log("Draw");
  }
}
