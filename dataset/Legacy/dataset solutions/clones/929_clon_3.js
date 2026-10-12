function createNumSequence(startVal, endVal) {
  return Array.from({ length: endVal - startVal }, (_, idx) => startVal + idx);
}

(function executeMatrixChain() {
  const fileSystem = require('fs');
  const rawInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const inputLines = rawInputContent.trim().split('\n');

  const matrixCount = Number(inputLines.shift());

  const dimensions = [];
  for (let lineIndex = 0; lineIndex < matrixCount; lineIndex++) {
    const lineParts = inputLines[lineIndex].split(' ');
    dimensions.push(Number(lineParts[0]));
  }
  const lastMatrixLastDimension = Number(inputLines[matrixCount - 1].split(' ')[1]);
  dimensions.push(lastMatrixLastDimension);

  const minCostMatrix = Array.from({ length: matrixCount + 1 }, () => (Array(matrixCount + 1)));

  for (let currentIdx = 0; currentIdx < matrixCount + 1; currentIdx++) {
    minCostMatrix[currentIdx][currentIdx] = 0;
  }

  const maxChainLength = matrixCount - 1;

  for (let chainLength = 1; chainLength <= maxChainLength; chainLength++) {
    const maxStartIndex = matrixCount - chainLength;
    for (let startIndex = 1; startIndex <= maxStartIndex; startIndex++) {
      const endIndex = startIndex + chainLength;

      let minimumCurrentCost = Infinity;

      for (let splitPoint = startIndex; splitPoint < endIndex; splitPoint++) {
        const costLeftSubproblem = minCostMatrix[startIndex][splitPoint];
        const costRightSubproblem = minCostMatrix[splitPoint + 1][endIndex];
        const costOfMultiplication = dimensions[startIndex - 1] * dimensions[splitPoint] * dimensions[endIndex];
        const totalCombinationCost = costLeftSubproblem + costRightSubproblem + costOfMultiplication;

        if (totalCombinationCost < minimumCurrentCost) {
          minimumCurrentCost = totalCombinationCost;
        }
      }
      minCostMatrix[startIndex][endIndex] = minimumCurrentCost;
    }
  }
  console.log(minCostMatrix[1][matrixCount]);
})();
