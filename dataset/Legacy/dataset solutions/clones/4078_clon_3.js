function determineBlockType(blockSize, rowCoord, colCoord) {
  const doubleBlockSize = 2 * blockSize;
  const isFirstQuadrant = (rowCoord >= 0 && rowCoord < blockSize && colCoord >= 0 && colCoord < blockSize);
  const isSecondQuadrant = (rowCoord >= blockSize && rowCoord < doubleBlockSize && colCoord >= blockSize && colCoord < doubleBlockSize);

  if (isFirstQuadrant || isSecondQuadrant) {
    return "B";
  }
  return "W";
}

function parseAndTransformPoint(pointString, gridSize) {
  const parts = pointString.split(" ");
  const originalX = parseInt(parts[0], 10);
  const originalY = parseInt(parts[1], 10);
  const originalColor = parts[2];

  const normalizedX = originalX % gridSize;
  const normalizedY = originalY % gridSize;

  const xBlockFactor = Math.floor(originalX / gridSize);
  const yBlockFactor = Math.floor(originalY / gridSize);

  const needsColorFlip = (xBlockFactor % 2 + yBlockFactor % 2) % 2 === 1;

  let adjustedColor = originalColor;
  if (needsColorFlip) {
    adjustedColor = (originalColor === "B") ? "W" : "B";
  }

  const finalXCoord = (adjustedColor === "W") ? normalizedX + gridSize : normalizedX;
  return [finalXCoord, normalizedY];
}

function processInputData(rawDataLines) {
  const firstLineParts = rawDataLines[0].split(" ");
  const numPoints = parseInt(firstLineParts[0], 10);
  const gridSize = parseInt(firstLineParts[1], 10);

  const transformedPoints = [];

  for (let pointIdx = 1; pointIdx <= numPoints; pointIdx++) {
    transformedPoints.push(parseAndTransformPoint(rawDataLines[pointIdx], gridSize));
  }

  let maximumMatches = 0;
  let shouldTerminateSearch = false;

  const calculateMatchesForOffset = (currentOffsetRow, currentOffsetCol, points, blockSize) => {
    let matchCount = 0;
    for (const point of points) {
      const [transformedX, transformedY] = point;
      const targetRow = currentOffsetCol + transformedX;
      const targetCol = currentOffsetRow + transformedY;
      if ("B" === determineBlockType(blockSize, targetRow, targetCol)) {
        matchCount++;
      }
    }
    return matchCount;
  };

  for (let offsetRow = 0; offsetRow < 2 * gridSize; offsetRow++) {
    for (let offsetCol = 0; offsetCol < gridSize; offsetCol++) {

      const currentMatchCount = calculateMatchesForOffset(offsetRow, offsetCol, transformedPoints, gridSize);

      maximumMatches = Math.max(maximumMatches, currentMatchCount);

      if (maximumMatches === numPoints) {
        shouldTerminateSearch = true;
        break;
      }
    }
    if (shouldTerminateSearch) {
      break;
    }
  }

  console.log(maximumMatches.toString());
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
