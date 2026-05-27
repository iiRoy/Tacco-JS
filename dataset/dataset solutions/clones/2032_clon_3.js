"use strict";
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenArray = rawData.split(/ |\n/);
var tokenIndex = 0;

function getNextToken(isString) {
  const currentTokenValue = tokenArray[tokenIndex];
  tokenIndex++;
  return isString ? currentTokenValue : +currentTokenValue;
}

function getMultipleTokens(count, isString) {
  const extractedTokens = tokenArray.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return isString ? extractedTokens : extractedTokens.map(val => +val);
}

function getMatrixTokens(height, width, isString) {
  const matrixResult = [];
  for (let rowCounter = 0; rowCounter < height; rowCounter++) {
    const rowData = tokenArray.slice(tokenIndex, tokenIndex + width);
    tokenIndex += width;
    matrixResult.push(isString ? rowData : rowData.map(val => +val));
  }
  return matrixResult;
}

// Rewritten multi-dimensional array creation function to avoid eval
function createMultiDimArray(initialFillValue, ...dimensions) {
  const buildDimensionRecursively = (currentDimensionIndex) => {
    if (currentDimensionIndex === dimensions.length - 1) {
      return Array(dimensions[currentDimensionIndex]).fill(initialFillValue);
    } else {
      return Array(dimensions[currentDimensionIndex]).fill(null).map(() => buildDimensionRecursively(currentDimensionIndex + 1));
    }
  };
  return buildDimensionRecursively(0);
}

// Unused function from original, kept as is
function multiplyModulo() {
  for (var a = arguments, r = a[0], i = a.length; --i;) r = ((r >> 16) * a[i] % mod * 65536 + (r & 65535) * a[i]) % mod;
  return r;
}

// Helper function to encapsulate the distance relaxation logic
function applyDistanceRelaxation(distanceMap, currentRow, currentCol) {
  const neighborLeftDistance = distanceMap[currentRow][currentCol - 1];
  const neighborRightDistance = distanceMap[currentRow][currentCol + 1];
  const neighborUpDistance = distanceMap[currentRow - 1][currentCol];
  const neighborDownDistance = distanceMap[currentRow + 1][currentCol];
  const currentDistanceMinusOne = distanceMap[currentRow][currentCol] - 1;

  const minimumCandidate = Math.min(
    neighborLeftDistance,
    neighborRightDistance,
    neighborUpDistance,
    neighborDownDistance,
    currentDistanceMinusOne
  );
  return minimumCandidate + 1;
}

const programOutput = executeProgram();
if (programOutput !== undefined) console.log(programOutput);

function executeProgram() {
  const totalNodes = getNextToken();
  const portalNodeX = getNextToken();
  const portalNodeY = getNextToken();

  // Define a constant for the initial large distance value
  const INITIAL_MAX_DISTANCE = 1e9;

  const distanceFrequencyCounts = createMultiDimArray(0, totalNodes - 1);
  const shortestPathMatrix = createMultiDimArray(INITIAL_MAX_DISTANCE, totalNodes + 2, totalNodes + 2);

  // Initialize direct connections and the special portal link
  for (let nodeIdentifier = 1; nodeIdentifier <= totalNodes; nodeIdentifier++) {
    shortestPathMatrix[nodeIdentifier][nodeIdentifier] = 0;
    shortestPathMatrix[nodeIdentifier][nodeIdentifier + 1] = 1;
    shortestPathMatrix[nodeIdentifier][nodeIdentifier - 1] = 1;

    // Explicitly set both directions for the portal
    if (nodeIdentifier === portalNodeX) {
      shortestPathMatrix[nodeIdentifier][portalNodeY] = 1;
      shortestPathMatrix[portalNodeY][nodeIdentifier] = 1;
    }
  }

  // First pass: Propagate shortest path distances in increasing order of indices
  for (let firstNodeIdx = 1; firstNodeIdx <= totalNodes; firstNodeIdx++) {
    for (let secondNodeIdx = firstNodeIdx + 1; secondNodeIdx <= totalNodes; secondNodeIdx++) {
      shortestPathMatrix[firstNodeIdx][secondNodeIdx] = applyDistanceRelaxation(shortestPathMatrix, firstNodeIdx, secondNodeIdx);
    }
  }

  // Second pass: Propagate shortest path distances in decreasing order of indices and count frequencies
  for (let firstNodeIdx = totalNodes - 1; firstNodeIdx > 0; firstNodeIdx--) {
    for (let secondNodeIdx = totalNodes; secondNodeIdx > firstNodeIdx; secondNodeIdx--) {
      shortestPathMatrix[firstNodeIdx][secondNodeIdx] = applyDistanceRelaxation(shortestPathMatrix, firstNodeIdx, secondNodeIdx);
      
      // Store the computed distance in a temporary variable before incrementing count
      const finalCalculatedDistance = shortestPathMatrix[firstNodeIdx][secondNodeIdx];
      distanceFrequencyCounts[finalCalculatedDistance - 1]++;
    }
  }

  return distanceFrequencyCounts.join("\n");
}
