const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedLines = rawData.trim().split('\n');

const [itemCount, containerCount] = parsedLines[0].split(' ').map(Number);
const itemWeights = parsedLines.slice(1).map(Number);

const evaluateAllocation = (itemLoads, maxUnitCapacity, totalContainers) => {
  const outcome = itemLoads.reduce((state, currentLoad) => {
    if (!state.possible) return state;

    if (currentLoad > maxUnitCapacity) {
      return { ...state, possible: false };
    }

    if (state.currentContainerLoad + currentLoad <= maxUnitCapacity) {
      return { ...state, currentContainerLoad: state.currentContainerLoad + currentLoad };
    } else {
      const nextContainerCount = state.containersUsed + 1;
      if (nextContainerCount > totalContainers) {
        return { ...state, possible: false };
      }
      return { currentContainerLoad: currentLoad, containersUsed: nextContainerCount, possible: true };
    }
  }, { currentContainerLoad: 0, containersUsed: 1, possible: true });

  return outcome.possible;
};

const minPossibleCapacity = itemWeights.length > 0 ? Math.max(...itemWeights) : 0;
const maxPossibleCapacity = itemWeights.reduce((sum, val) => sum + val, 0);

let lowerBound = minPossibleCapacity;
let upperBound = maxPossibleCapacity;
let finalCapacity = maxPossibleCapacity;

while (lowerBound <= upperBound) {
  const testCapacity = Math.floor((lowerBound + upperBound) / 2);

  if (evaluateAllocation(itemWeights, testCapacity, containerCount)) {
    finalCapacity = testCapacity;
    upperBound = testCapacity - 1;
  } else {
    lowerBound = testCapacity + 1;
  }
}

console.log(finalCapacity);
