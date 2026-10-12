const pathFinder = (inputData) => {
  const gridLines = inputData.trim().split('\n');
  const [gridHeight, gridWidth] = gridLines.shift().split(' ').map(val => parseInt(val, 10));

  const pathCache = new Map();
  const obstacleChar = '#';
  const modulusValue = 1000000007;

  const calculatePathsRecursive = (rIdx, cIdx) => {
    if (rIdx < 0 || cIdx < 0 || rIdx >= gridHeight || cIdx >= gridWidth) {
      return 0;
    }
    if (gridLines[rIdx][cIdx] === obstacleChar) {
      return 0;
    }
    if (rIdx === 0 && cIdx === 0) {
      return 1;
    }

    const cacheKey = `${rIdx},${cIdx}`;
    if (pathCache.has(cacheKey)) {
      return pathCache.get(cacheKey);
    }

    const pathsFromAbove = calculatePathsRecursive(rIdx - 1, cIdx);
    const pathsFromLeft = calculatePathsRecursive(rIdx, cIdx - 1);

    const totalPaths = (pathsFromAbove + pathsFromLeft) % modulusValue;

    pathCache.set(cacheKey, totalPaths);
    return totalPaths;
  };

  const finalPaths = calculatePathsRecursive(gridHeight - 1, gridWidth - 1);

  return finalPaths.toString();
};

console.log(pathFinder(require('fs').readFileSync('/dev/stdin', 'utf8')));
