const _3dMovementVectors = [
  [-1, -1, 0], [0, -1, 0], [1, -1, 0], [-1, 0, 0],
  [0, -1, -1], [0, 0, -1], [0, 1, -1], [0, -1, 0],
  [-1, 0, -1], [-1, 0, 0],
  [-1, 0, 1], [0, 0, -1],
  [1, -1, -1], [-1, -1, -1], [1, -1, 1], [-1, -1, 1]
].map(([dx, dy, dz]) => ({ dx, dy, dz }));

const measureAlignment = (marker, currentX, currentY, currentZ, gameBoard, boardWidth, boardHeight, boardDepth) => {
  const evaluateLineSegment = (startCoords, direction) => {
    let [x, y, z] = startCoords;
    let currentStreak = 0;
    let maximumStreak = 0;

    while (true) {
      x += direction.dx;
      y += direction.dy;
      z += direction.dz;

      if (x < 0 || y < 0 || z < 0 || x >= boardWidth || y >= boardHeight || z >= boardDepth) {
        break;
      }

      if (gameBoard[x][y][z] === marker) {
        currentStreak++;
      } else {
        currentStreak = 0;
      }
      maximumStreak = Math.max(maximumStreak, currentStreak);
    }
    return maximumStreak;
  };

  return _3dMovementVectors.reduce((overallMax, vector) => {
    let traceX = currentX;
    let traceY = currentY;
    let traceZ = currentZ;

    while (true) {
      const nextX = traceX - vector.dx;
      const nextY = traceY - vector.dy;
      const nextZ = traceZ - vector.dz;

      if (nextX < 0 || nextY < 0 || nextZ < 0 || nextX >= boardWidth || nextY >= boardHeight || nextZ >= boardDepth) {
        break;
      }
      traceX = nextX;
      traceY = nextY;
      traceZ = nextZ;
    }
    
    return Math.max(overallMax, evaluateLineSegment([traceX, traceY, traceZ], vector));
  }, 0);
};

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let processedLines = rawInputData.trim().split("\n");
let currentLineIndex = 0;

const retrieveNextLine = () => processedLines[currentLineIndex++];
const convertToNumbers = (line) => line.split(" ").map(Number);

while (true) {
  const dimensionSpecification = retrieveNextLine();
  if (dimensionSpecification === "0 0 0") break;

  const [gridXDimension, requiredConsecutive, gridZDimension] = convertToNumbers(dimensionSpecification);

  const playfield = Array.from({ length: gridXDimension }, () =>
    Array.from({ length: gridXDimension }, () =>
      Array.from({ length: gridZDimension }, () => 0)
    )
  );

  const playerMoveCoordinates = Array.from({ length: gridZDimension }, () =>
    convertToNumbers(retrieveNextLine())
  );

  let activePlayerIdentifier = 1;
  let gameConcluded = false;

  for (let moveNumber = 0; moveNumber < gridZDimension; moveNumber++) {
    const [colPlacement, rowPlacement] = playerMoveCoordinates[moveNumber];
    const targetColumn = colPlacement - 1;
    const targetRow = rowPlacement - 1;

    let currentStackHeight = 0;
    while (currentStackHeight < gridZDimension && playfield[targetColumn][targetRow][currentStackHeight] !== 0) {
      currentStackHeight++;
    }
    
    playfield[targetColumn][targetRow][currentStackHeight] = activePlayerIdentifier;

    if (measureAlignment(activePlayerIdentifier, targetColumn, targetRow, currentStackHeight, playfield, gridXDimension, gridXDimension, gridZDimension) >= requiredConsecutive) {
      console.log((activePlayerIdentifier === 2) ? "White" : "Black", moveNumber + 1);
      gameConcluded = true;
      break;
    }
    
    activePlayerIdentifier = (activePlayerIdentifier === 1) ? 2 : 1;
  }

  if (!gameConcluded) {
    console.log("Draw");
  }
}