const arrangeElements = (dataArray, count, comparisonLogic) => {
  const stack = [];
  stack.push(0, count - 1);

  while (stack.length > 0) {
    const high = stack.pop();
    const low = stack.pop();

    if (low < high) {
      const pivotValue = dataArray[high];
      let boundary = low;

      for (let cursor = low; cursor < high; cursor++) {
        if (comparisonLogic(dataArray[cursor], pivotValue) <= 0) {
          [dataArray[boundary], dataArray[cursor]] = [dataArray[cursor], dataArray[boundary]];
          boundary++;
        }
      }
      [dataArray[boundary], dataArray[high]] = [dataArray[high], dataArray[boundary]];
      const pivotIndex = boundary;

      if (pivotIndex - 1 > low) {
        stack.push(low, pivotIndex - 1);
      }
      if (pivotIndex + 1 < high) {
        stack.push(pivotIndex + 1, high);
      }
    }
  }
};

const determineMinimumSwaps = (initialArrangement, elementCount) => {
  const orderedElements = [...initialArrangement].sort((a, b) => a - b);

  const valueToSortedPosition = new Map();
  orderedElements.forEach((val, idx) => {
    valueToSortedPosition.set(val, idx);
  });

  const processedIndices = new Set();

  const totalOperationCost = Array.from({ length: elementCount }, (_, index) => index)
    .reduce((currentTotal, currentIndex) => {
      if (processedIndices.has(currentIndex)) {
        return currentTotal;
      }

      const currentCycleMembers = [];
      let walkerIndex = currentIndex;
      while (!processedIndices.has(walkerIndex)) {
        processedIndices.add(walkerIndex);
        currentCycleMembers.push(initialArrangement[walkerIndex]);
        walkerIndex = valueToSortedPosition.get(initialArrangement[walkerIndex]);
      }

      const cycleSize = currentCycleMembers.length;
      if (cycleSize <= 1) {
        return currentTotal;
      }

      const sumOfCycleMembers = currentCycleMembers.reduce((sum, val) => sum + val, 0);
      const minInCycle = currentCycleMembers.reduce((minVal, val) => Math.min(minVal, val), Infinity);

      const overallMinElement = orderedElements[0];

      const costOptionA = sumOfCycleMembers + (cycleSize - 2) * minInCycle;
      const costOptionB = sumOfCycleMembers + minInCycle + (cycleSize + 1) * overallMinElement;

      return currentTotal + Math.min(costOptionA, costOptionB);
    }, 0);

  return totalOperationCost;
};

const { createInterface } = require('readline');

const processInput = async () => {
  const ioInterface = createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });

  const inputLines = [];
  for await (const line of ioInterface) {
    inputLines.push(line);
  }

  const totalElements = parseInt(inputLines[0], 10);
  const sourceArray = inputLines[1].split(' ').map(Number);

  const finalResult = determineMinimumSwaps(sourceArray, totalElements);
  console.log(finalResult);
};

processInput();
