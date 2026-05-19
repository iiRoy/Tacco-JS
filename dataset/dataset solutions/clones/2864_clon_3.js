const MODULO_CONSTANT = 1e9 + 7;

let fibonacciCache = [0, 1];

function ensureFibonacciComputedUpTo(limit) {
  for (let currentIdx = fibonacciCache.length; currentIdx <= limit; currentIdx++) {
    let previousTerm = fibonacciCache[currentIdx - 1];
    let secondPreviousTerm = fibonacciCache[currentIdx - 2];
    let sumOfPrevious = (previousTerm + secondPreviousTerm);
    fibonacciCache[currentIdx] = sumOfPrevious % MODULO_CONSTANT;
  }
}

function getFibonacciTerm(index) {
  if (index <= 0) {
    return 1;
  }
  ensureFibonacciComputedUpTo(index);
  return fibonacciCache[index];
}

function hasConsecutiveObstacles(positionsArray, count) {
  if (count <= 1) {
    return false;
  }
  for (let k = 1; k < count; k++) {
    if (positionsArray[k] - positionsArray[k - 1] === 1) {
      return true;
    }
  }
  return false;
}

function processProblem(inputString) {
  const inputLines = inputString.split('\n');
  const firstLineParts = inputLines.shift().split(' ');

  const gridSizeN = parseInt(firstLineParts[0]);
  const numObstacles = parseInt(firstLineParts[1]);

  const obstaclePositions = inputLines.slice(0, numObstacles).map(posStr => parseInt(posStr));

  if (hasConsecutiveObstacles(obstaclePositions, numObstacles)) {
    console.log(0);
    return;
  }

  const augmentedObstacles = [-1, ...obstaclePositions, gridSizeN + 1];
  const segmentLengths = [];

  for (let k = 1; k < augmentedObstacles.length; k++) {
    const currentPosition = augmentedObstacles[k];
    const previousPosition = augmentedObstacles[k - 1];
    segmentLengths.push(currentPosition - previousPosition - 1);
  }

  let cumulativeProduct = 1;

  for (const currentSegmentLen of segmentLengths) {
    cumulativeProduct *= getFibonacciTerm(currentSegmentLen);
    cumulativeProduct %= MODULO_CONSTANT;
  }

  console.log(cumulativeProduct);
}

processProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));
