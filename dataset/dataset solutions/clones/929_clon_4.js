function* numericSequence(startValue, exclusiveEndValue) {
  let current = startValue;
  while (current < exclusiveEndValue) {
    yield current;
    current++;
  }
}

(function processMatrixChain() {
  const fileSystem = require('fs');
  const rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputDataLines = rawInput.trim().split('\n');

  const matrixCountRaw = inputDataLines.splice(0, 1)[0];
  const matrixCount = Number(matrixCountRaw);

  const dimensionArray = [];
  for (let i = 0; i < matrixCount; i++) {
    const parts = inputDataLines[i].split(' ');
    dimensionArray.push(Number(parts[0]));
    if (i === matrixCount - 1) {
      dimensionArray.push(Number(parts[1]));
    }
  }

  const minOpCache = Array.from({
    length: matrixCount + 1
  }, () => Array(matrixCount + 1).fill(null));

  function computeOptimalCost(startIdx, endIdx) {
    if (minOpCache[startIdx][endIdx] !== null) {
      return minOpCache[startIdx][endIdx];
    }

    if (startIdx === endIdx) {
      return 0;
    }

    let minimumCurrentCost = Infinity;

    for (let splitPoint of numericSequence(startIdx, endIdx)) {
      const costLeft = computeOptimalCost(startIdx, splitPoint);
      const costRight = computeOptimalCost(splitPoint + 1, endIdx);
      const multiplicationCost = dimensionArray[startIdx - 1] * dimensionArray[splitPoint] * dimensionArray[endIdx];

      const totalCurrentCost = costLeft + costRight + multiplicationCost;

      if (totalCurrentCost < minimumCurrentCost) {
        minimumCurrentCost = totalCurrentCost;
      }
    }

    minOpCache[startIdx][endIdx] = minimumCurrentCost;
    return minimumCurrentCost;
  }

  const finalMinimumOperations = computeOptimalCost(1, matrixCount);

  console.log(finalMinimumOperations);
})();