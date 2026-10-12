const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const inputLines = fileContent.trim().split('\n');
const itemCount = parseInt(inputLines[0], 10);
const itemValues = inputLines[1].trim().split(' ').map(val => parseInt(val, 10));
const queryCount = parseInt(inputLines[2], 10);
const targetSums = inputLines[3].trim().split(' ').map(val => parseInt(val, 10));

class NestedMapKeyGenerator {
  constructor() {
    this.rootNode = {};
  }

  generateKeyObject(...keyComponents) {
    let currentNode = this.rootNode;
    keyComponents.forEach(component => {
      if (!currentNode[component]) {
        currentNode[component] = {};
      }
      currentNode = currentNode[component];
    });
    return currentNode;
  }
}

const memoizationStore = new Map();
const keyObjectFactory = new NestedMapKeyGenerator();

const calculateSubsetSumPossibility = (currentIdx, currentTarget) => {
  const cacheKey = keyObjectFactory.generateKeyObject(currentIdx, currentTarget);

  if (memoizationStore.has(cacheKey)) {
    return memoizationStore.get(cacheKey);
  }

  // Base cases
  if (currentTarget === 0) {
    memoizationStore.set(cacheKey, true);
    return true;
  }
  if (currentIdx === itemCount || currentTarget < 0) {
    memoizationStore.set(cacheKey, false);
    return false;
  }

  // Recursive step
  const currentValue = itemValues[currentIdx];
  const nextIdx = currentIdx + 1;

  // Option 1: Exclude the current item
  const resultWithoutCurrent = calculateSubsetSumPossibility(nextIdx, currentTarget);
  
  // Option 2: Include the current item
  const resultWithCurrent = calculateSubsetSumPossibility(nextIdx, currentTarget - currentValue);

  const finalResult = resultWithoutCurrent || resultWithCurrent;
  memoizationStore.set(cacheKey, finalResult);
  return finalResult;
};

for (let queryIndex = 0; queryIndex < queryCount; queryIndex++) {
  const currentQueryTarget = targetSums[queryIndex];
  console.log(calculateSubsetSumPossibility(0, currentQueryTarget) ? 'yes' : 'no');
}
