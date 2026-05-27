function processInput(inputData) {
  inputData = inputData.split("\n");

  const convertStringToInt = (numericString) => {
    return parseInt(numericString, 10);
  };

  const [gridHeight, gridWidth] = inputData[0].split(' ').map(convertStringToInt);

  const terrainMap = inputData.slice(1, gridHeight + 1).map(line => line.split(''));

  const pathMemo = new Map();
  const finalPathCount = calculatePathways(gridHeight - 1, gridWidth - 1, gridHeight, gridWidth, terrainMap, pathMemo);

  console.log(finalPathCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));

function calculatePathways(currentR, currentC, totalR, totalC, obstacleMap, memoCache) {
  const coordinateKey = `${currentR},${currentC}`;

  if (memoCache.has(coordinateKey)) {
    return memoCache.get(coordinateKey);
  }

  if (currentR < 0 || currentC < 0 || currentR >= totalR || currentC >= totalC) {
    return 0;
  }

  if (obstacleMap[currentR][currentC] === '#') {
    return 0;
  }

  if (currentR === 0 && currentC === 0) {
    return 1;
  }

  const MOD_CONSTANT = 10**9 + 7;

  let pathsFromUp = calculatePathways(currentR - 1, currentC, totalR, totalC, obstacleMap, memoCache);
  let pathsFromLeft = calculatePathways(currentR, currentC - 1, totalR, totalC, obstacleMap, memoCache);

  let totalPossiblePaths = (pathsFromUp + pathsFromLeft) % MOD_CONSTANT;

  memoCache.set(coordinateKey, totalPossiblePaths);
  return totalPossiblePaths;
}
