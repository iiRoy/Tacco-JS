const invertColor = (color) => color === "B" ? "W" : "B";

function determineColorBlock(initialColor, blockSize, rowCoord, colCoord) {
  const twoTimesBlockSize = 2 * blockSize;
  const threeTimesBlockSize = 3 * blockSize;

  const isInFirstRegion = (rowCoord >= 0 && rowCoord < blockSize && colCoord >= 0 && colCoord < blockSize);
  const isInSecondRegion = (rowCoord >= blockSize && rowCoord < twoTimesBlockSize && colCoord >= blockSize && colCoord < twoTimesBlockSize);
  const isInThirdRegion = (rowCoord >= twoTimesBlockSize && rowCoord < threeTimesBlockSize && colCoord >= 0 && colCoord < blockSize);

  if (isInFirstRegion || isInSecondRegion || isInThirdRegion) {
    return initialColor;
  } else {
    return invertColor(initialColor);
  }
}

const calculateBlockParity = (coordinate, blockSize) => {
  const blockIndex = Math.floor(coordinate / blockSize);
  return blockIndex % 2;
};

function countMatchesForOffset(currentOffsetX, currentOffsetY, points, blockSize) {
  let matches = 0;
  for (const point of points) {
    const pointX = point.x;
    const pointY = point.y;
    // point.color is always "B" due to normalization in the main processing loop.
    if (point.color === determineColorBlock("B", blockSize, currentOffsetX + pointX, currentOffsetY + pointY)) {
      matches++;
    }
  }
  return matches;
}

function processInputData(inputLines) {
  const inputHeader = inputLines[0].split(" ");
  const numPoints = parseInt(inputHeader[0], 10);
  const gridSize = parseInt(inputHeader[1], 10);

  const processedPoints = [];

  for (let i = 1; i <= numPoints; i++) {
    const currentPointData = inputLines[i].split(" ");
    const originalX = parseInt(currentPointData[0], 10);
    const originalY = parseInt(currentPointData[1], 10);
    const originalColor = currentPointData[2];

    const relativeX = originalX % gridSize;
    const relativeY = originalY % gridSize;

    const xBlockParity = calculateBlockParity(originalX, gridSize);
    const yBlockParity = calculateBlockParity(originalY, gridSize);
    const requiresColorShift = (xBlockParity + yBlockParity) % 2 === 1;

    let currentTransformedColor = originalColor;
    if (requiresColorShift) {
      currentTransformedColor = invertColor(currentTransformedColor);
    }

    let finalAdjustedX = relativeX;
    let finalTransformedColor = currentTransformedColor;

    if (finalTransformedColor === "W") {
      finalTransformedColor = "B";
      finalAdjustedX += gridSize;
    }

    processedPoints.push({
      x: finalAdjustedX,
      y: relativeY,
      color: finalTransformedColor
    });
  }

  let maximumMatches = 0;

  for (let offsetX = 0; offsetX < 2 * gridSize; offsetX++) {
    for (let offsetY = 0; offsetY < 2 * gridSize; offsetY++) {

      const currentBlackMatches = countMatchesForOffset(offsetX, offsetY, processedPoints, gridSize);

      if (maximumMatches < currentBlackMatches) {
        maximumMatches = currentBlackMatches;
      }

      if (maximumMatches === numPoints) {
        break;
      }
    }
    if (maximumMatches === numPoints) {
      break;
    }
  }

  console.log('%s', maximumMatches);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8").split("\n"));
