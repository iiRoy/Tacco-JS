var gridSize = 0;

function shiftTileCounts(tileArray, sourceIndex, moveStep, gridBoundary) {
  let targetIndex = sourceIndex + moveStep;
  let movedQuantity = tileArray[sourceIndex];
  tileArray[sourceIndex] = 0;

  if (targetIndex < 0 || targetIndex >= gridBoundary) {
    return;
  }
  tileArray[targetIndex] += movedQuantity;
}

function prepareInitialState(initialCharString, currentGridSize) {
  const charMap = {};
  const tileCounts = new Array(currentGridSize).fill(0);

  for (let charIdx = 0; charIdx < initialCharString.length; charIdx++) {
    let currentChar = initialCharString[charIdx];
    tileCounts[charIdx] = 1;
    charMap[currentChar] = charMap[currentChar] || [];
    charMap[currentChar].push(charIdx);
  }
  return { charMap, tileCounts };
}

function executeMovementQueries(queryLines, charPositionMap, positionCounts, currentGridSize) {
  for (let queryIdx = 0; queryIdx < queryLines.length; queryIdx++) {
    let queryParts = queryLines[queryIdx].split(' ');
    let targetChar = queryParts[0];
    let charIndices = charPositionMap[targetChar];

    if (!charIndices) {
      continue;
    }

    let moveDirectionChar = queryParts[1];
    let actualShift = (moveDirectionChar === "R") ? 1 : -1;

    if (moveDirectionChar === "R") {
      for (let i = charIndices.length - 1; i >= 0; i--) {
        shiftTileCounts(positionCounts, charIndices[i], actualShift, currentGridSize);
      }
    } else {
      for (let i = 0; i < charIndices.length; i++) {
        shiftTileCounts(positionCounts, charIndices[i], actualShift, currentGridSize);
      }
    }
  }
}

function processInputData(rawData) {
  const inputLines = rawData.split('\n');
  const sizeAndQueries = inputLines[0].split(' ');
  gridSize = Number(sizeAndQueries[0]);

  const { charMap: charPositionMap, tileCounts: positionCounts } = prepareInitialState(inputLines[1], gridSize);

  executeMovementQueries(inputLines.slice(2), charPositionMap, positionCounts, gridSize);

  const totalActiveTiles = positionCounts.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

  console.log(totalActiveTiles);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
