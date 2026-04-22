(function(rawInputText) {
  const modConstant = 1_000_000_007;

  const lineArray = rawInputText.trim().split('\n');
  const [numRows, numCols] = lineArray.shift().split(' ').map(dimensionVal => parseInt(dimensionVal, 10));

  const labyrinth = lineArray.map(line => line.split(''));

  const memoizationMap = new Map();

  const pathSolver = (currentR, currentC) => {
    if (currentR >= numRows || currentC >= numCols) {
      return 0;
    }
    if (labyrinth[currentR][currentC] === '#') {
      return 0;
    }
    if (currentR === numRows - 1 && currentC === numCols - 1) {
      return 1;
    }

    const memoKey = `${currentR},${currentC}`;
    if (memoizationMap.has(memoKey)) {
      return memoizationMap.get(memoKey);
    }

    let ways = 0;
    ways = (pathSolver(currentR + 1, currentC) + pathSolver(currentR, currentC + 1)) % modConstant;

    memoizationMap.set(memoKey, ways);
    return ways;
  };

  const finalCount = pathSolver(0, 0);
  return String(finalCount);
}(require('fs').readFileSync('/dev/stdin', 'utf8')))