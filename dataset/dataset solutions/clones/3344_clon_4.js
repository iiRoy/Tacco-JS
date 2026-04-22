'use strict';
(function(sourceContent){
  const allNumbers = sourceContent.trim().split(/\s+/).map(val => Number(val));
  const totalItems = allNumbers[0];
  const itemValues = allNumbers.slice(1);

  const cumulativeQuantities = new Array(totalItems + 1).fill(0);
  for (let idx = 0; idx < totalItems; ++idx) {
    cumulativeQuantities[idx + 1] = cumulativeQuantities[idx] + itemValues[idx];
  }

  const getRangeSum = (start, end) => {
    return cumulativeQuantities[end + 1] - cumulativeQuantities[start];
  };

  const computationCache = new Map();
  const unachievableCost = Infinity;

  const determineOptimalCombinationCost = (segmentStart, segmentEnd) => {
    if (segmentStart === segmentEnd) {
      return 0;
    }

    const cacheKey = `${segmentStart}_${segmentEnd}`;
    if (computationCache.has(cacheKey)) {
      return computationCache.get(cacheKey);
    }

    let minimumEncounteredCost = unachievableCost;
    const currentSegmentTotal = getRangeSum(segmentStart, segmentEnd);

    for (let divisionPoint = segmentStart; divisionPoint < segmentEnd; ++divisionPoint) {
      const leftSubProblemCost = determineOptimalCombinationCost(segmentStart, divisionPoint);
      const rightSubProblemCost = determineOptimalCombinationCost(divisionPoint + 1, segmentEnd);
      
      const totalCombinationCost = leftSubProblemCost + rightSubProblemCost + currentSegmentTotal;
      minimumEncounteredCost = Math.min(minimumEncounteredCost, totalCombinationCost);
    }

    computationCache.set(cacheKey, minimumEncounteredCost);
    return minimumEncounteredCost;
  };

  const finalResult = determineOptimalCombinationCost(0, totalItems - 1);
  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin','utf8'));