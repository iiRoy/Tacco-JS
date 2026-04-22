function analyzeNetwork(rawDataString) {
  const [upperBound, specialPointOne, specialPointTwo] = rawDataString.trim().split(/\s+/).map(Number);

  const calculateAbsoluteDifference = (valA, valB) => {
    return valA > valB ? valA - valB : valB - valA;
  };

  const determineOptimalTraversalCost = (pointAlpha, pointBeta, referenceX, referenceY) => {
    const directHopCost = pointBeta - pointAlpha;
    const detourViaReferenceCost = calculateAbsoluteDifference(referenceX, pointAlpha) + calculateAbsoluteDifference(referenceY, pointBeta) + 1;
    return Math.min(directHopCost, detourViaReferenceCost);
  };

  const collectedTraversalCosts = [];
  for (let startNode = 1; startNode < upperBound; ++startNode) {
    for (let endNode = startNode + 1; endNode <= upperBound; ++endNode) {
      collectedTraversalCosts.push(determineOptimalTraversalCost(startNode, endNode, specialPointOne, specialPointTwo));
    }
  }

  const costDistributionMap = collectedTraversalCosts.reduce((accumulator, costValue) => {
    accumulator[costValue] = (accumulator[costValue] || 0) + 1;
    return accumulator;
  }, {});

  const resultAggregates = [];
  for (let desiredLength = 1; desiredLength < upperBound; ++desiredLength) {
    resultAggregates.push(costDistributionMap[desiredLength] || 0);
  }

  process.stdout.write(resultAggregates.join('\n') + '\n');
}

analyzeNetwork(require('fs').readFileSync('/dev/stdin', 'utf8'));