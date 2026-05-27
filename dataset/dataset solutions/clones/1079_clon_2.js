const fastSort = (inputArray, arraySize, comparisonFn) => {
  const exchangeElements = (firstIdx, secondIdx) => {
    const tempVal = inputArray[firstIdx];
    inputArray[firstIdx] = inputArray[secondIdx];
    inputArray[secondIdx] = tempVal;
  };

  const divideAndConquer = (startIndex, endIndex) => {
    let currentPivotIndex = startIndex;
    for (let jdx = startIndex; jdx < endIndex; jdx++) {
      if (comparisonFn(inputArray[jdx], inputArray[endIndex]) <= 0) {
        exchangeElements(currentPivotIndex, jdx);
        currentPivotIndex++;
      }
    }
    exchangeElements(currentPivotIndex, endIndex);
    return currentPivotIndex;
  };

  const sortRecursive = (startIndex, endIndex) => {
    if (startIndex >= endIndex) {
      return;
    }
    const pivotIndex = divideAndConquer(startIndex, endIndex);
    sortRecursive(startIndex, pivotIndex - 1);
    sortRecursive(pivotIndex + 1, endIndex);
  };

  sortRecursive(0, arraySize - 1);
};

const computeTotalCost = (originalArray, arrayLength) => {
  const sortedCopy = originalArray.slice();
  fastSort(sortedCopy, arrayLength, (valA, valB) => valA - valB);

  const valueToIndexMap = new Array(sortedCopy[arrayLength - 1] + 1).fill(0);
  sortedCopy.forEach((elementValue, idx) => {
    valueToIndexMap[elementValue] = idx;
  });

  const visitedFlags = new Array(arrayLength).fill(false);

  const traceCycleElements = (currentIdx, currentAccumulator) => {
    visitedFlags[currentIdx] = true;
    const nextIdxInCycle = valueToIndexMap[originalArray[currentIdx]];
    if (visitedFlags[nextIdxInCycle]) {
      return [originalArray[currentIdx], ...currentAccumulator];
    } else {
      return traceCycleElements(nextIdxInCycle, [originalArray[currentIdx], ...currentAccumulator]);
    }
  };

  const getCycleElements = (startingIdx) => traceCycleElements(startingIdx, []);

  const processElementsAndSumCosts = (currentIdx, totalAccumulatedCost) => {
    if (currentIdx === arrayLength) {
      return totalAccumulatedCost;
    }
    if (visitedFlags[currentIdx]) {
      return processElementsAndSumCosts(currentIdx + 1, totalAccumulatedCost);
    } else {
      const cycleElements = getCycleElements(currentIdx);
      const cycleLength = cycleElements.length;
      const cycleSum = cycleElements.reduce((sum, val) => sum + val, 0);
      const cycleMin = cycleElements.reduce((minVal, val) => Math.min(minVal, val), Number.MAX_SAFE_INTEGER);

      const costOption1 = cycleSum + (cycleLength - 2) * cycleMin;
      const costOption2 = cycleSum + cycleMin + (cycleLength + 1) * sortedCopy[0];

      return processElementsAndSumCosts(currentIdx + 1, totalAccumulatedCost + Math.min(costOption1, costOption2));
    }
  };

  return processElementsAndSumCosts(0, 0);
};

// Assume 'readline' is globally available for input, similar to competitive programming environments.
// For example, in Node.js, this might be provided by a custom setup or a library like 'readline-sync'.

const arrayLength = parseInt(readline());
const originalData = readline().split(' ').map(Number);
console.log(computeTotalCost(originalData, arrayLength));
