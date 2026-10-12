config = { input: '/dev/stdin', newline: '\n' };

const assert = require('assert');

const SIZE_DIMENSION = 16;

const tileAdjacencies = [
  [1,4], [0,2,5], [1,3,6], [2,7],
  [0,5,8], [1,4,6,9], [2,5,7,10], [3,6,11],
  [4,9,12], [5,8,10,13], [6,9,11,14], [7,10,15],
  [8,13], [9,12,14], [10,13,15], [11,14]
];

const initialTileArrangement = require('fs').readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline)
  .flatMap(line => line.split(' ').map(Number));

const targetTileArrangement = Array.from({ length: SIZE_DIMENSION }, (_, idx) => (idx + 1) % SIZE_DIMENSION);

function assessMisplacedTiles(currentLayout, finalLayout) {
  let count = 0;
  for (let k = 0; k < SIZE_DIMENSION; k++) {
    if (currentLayout[k] !== finalLayout[k]) {
      count++;
    }
  }
  return Math.floor(count / 2);
}

let solutionDepth = -1;

for (let currentMaxDepth = 0; currentMaxDepth <= 45; currentMaxDepth++) {
  const initialEmptyTilePosition = initialTileArrangement.indexOf(0);
  
  const searchQueue = [[initialTileArrangement, 0, initialEmptyTilePosition]];
  
  const visitedStates = new Set();
  visitedStates.add(JSON.stringify(initialTileArrangement));

  let depthFound = false;

  while (searchQueue.length > 0) {
    const [currentLayout, currentMoves, currentEmptyPos] = searchQueue.shift();

    if (currentMoves === currentMaxDepth) {
      let isTarget = true;
      for (let k = 0; k < SIZE_DIMENSION; k++) {
        if (currentLayout[k] !== targetTileArrangement[k]) {
          isTarget = false;
          break;
        }
      }
      if (isTarget) {
        depthFound = true;
        break;
      }
      continue;
    }

    const heuristicEstimate = assessMisplacedTiles(currentLayout, targetTileArrangement);
    if (currentMoves + heuristicEstimate > currentMaxDepth) {
      continue;
    }

    for (const nextEmptyPosCandidate of tileAdjacencies[currentEmptyPos]) {
      const nextLayout = [...currentLayout];
      
      nextLayout[currentEmptyPos] = nextLayout[nextEmptyPosCandidate];
      nextLayout[nextEmptyPosCandidate] = 0;

      const layoutKey = JSON.stringify(nextLayout);
      
      if (!visitedStates.has(layoutKey)) {
        visitedStates.add(layoutKey);
        searchQueue.push([nextLayout, currentMoves + 1, nextEmptyPosCandidate]);
      }
    }
  }

  if (depthFound) {
    solutionDepth = currentMaxDepth;
    break;
  }
}

console.log(solutionDepth);
