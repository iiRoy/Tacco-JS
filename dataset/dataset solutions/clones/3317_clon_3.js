const MODULO_CONSTANT = 10**9 + 7;

function solveGridPath(rawInputData) {
  const inputLines = rawInputData.split("\n");

  const parseNumericString = (strVal) => {
    return parseInt(strVal, 10);
  };

  const dimensionStrings = inputLines[0].split(' ');
  const gridHeight = parseNumericString(dimensionStrings[0]);
  const gridWidth = parseNumericString(dimensionStrings[1]);

  const characterMap = [];
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    characterMap.push(inputLines[rowIdx + 1].split(''));
  }

  const totalPaths = computePathCombinations(gridHeight, gridWidth, characterMap);
  console.log(totalPaths);
}

function computePathCombinations(gridHeight, gridWidth, characterMap) {
  const pathCountMatrix = Array.from({ length: gridHeight }, () => Array(gridWidth).fill(0));

  pathCountMatrix[0][0] = 1;

  for (let currentRow = 0; currentRow < gridHeight; currentRow++) {
    for (let currentCol = 0; currentCol < gridWidth; currentCol++) {
      if (characterMap[currentRow][currentCol] === '#') {
        continue;
      }

      if (currentRow === 0 && currentCol === 0) {
        // Base case already handled, no further additions needed for (0,0)
        continue;
      }

      let pathsFromAbove = 0;
      if (currentRow > 0) {
        pathsFromAbove = pathCountMatrix[currentRow - 1][currentCol];
      }

      let pathsFromLeft = 0;
      if (currentCol > 0) {
        pathsFromLeft = pathCountMatrix[currentRow][currentCol - 1];
      }
      
      // Sum paths from valid adjacent cells and apply modulo
      pathCountMatrix[currentRow][currentCol] = (pathsFromAbove + pathsFromLeft) % MODULO_CONSTANT;
    }
  }
  return pathCountMatrix[gridHeight - 1][gridWidth - 1];
}

solveGridPath(require("fs").readFileSync("/dev/stdin", "utf8"));
