(function processMatrixChain() {
  const rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  const matrixQuantity = Number(rawInputLines.shift());

  const matrixDimensions = [];
  const parsedMatrixSpecs = rawInputLines.map(line => line.split(' ').map(Number));

  matrixDimensions.push(parsedMatrixSpecs[0][0]);
  parsedMatrixSpecs.forEach(spec => matrixDimensions.push(spec[1]));

  const costMemo = Array.from({ length: matrixQuantity + 1 }, () => Array(matrixQuantity + 1).fill(null));

  function computeMinCost(startMatrixIndex, endMatrixIndex) {
    if (startMatrixIndex === endMatrixIndex) {
      return 0;
    }

    if (costMemo[startMatrixIndex][endMatrixIndex] !== null) {
      return costMemo[startMatrixIndex][endMatrixIndex];
    }

    let currentMinCost = Infinity;

    for (let splitPoint = startMatrixIndex; splitPoint < endMatrixIndex; splitPoint++) {
      const costOfCurrentSplit =
        computeMinCost(startMatrixIndex, splitPoint) +
        computeMinCost(splitPoint + 1, endMatrixIndex) +
        matrixDimensions[startMatrixIndex - 1] *
        matrixDimensions[splitPoint] *
        matrixDimensions[endMatrixIndex];

      currentMinCost = Math.min(currentMinCost, costOfCurrentSplit);
    }

    costMemo[startMatrixIndex][endMatrixIndex] = currentMinCost;
    return currentMinCost;
  }

  const finalResult = computeMinCost(1, matrixQuantity);

  console.log(finalResult);
})();
