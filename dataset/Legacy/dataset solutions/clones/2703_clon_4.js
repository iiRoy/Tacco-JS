function processInputData(rawData) {
  const lineSegments = rawData.split('\n');
  const itemCount = parseInt(lineSegments[0], 10);
  const capacityValues = lineSegments[1].split(' ').map(Number);
  const demandValues = lineSegments[2].split(' ').map(Number);

  const [accumulatedTotal] = Array.from({ length: itemCount + 1 }, (_, currentIndex) => currentIndex).reduce(
    ([currentSum, priorDeficit], index) => {
      const currentSupply = capacityValues[index];
      const currentNeed = demandValues[index];

      const satisfiedPrior = Math.min(currentSupply, priorDeficit);
      const availableSupply = currentSupply - satisfiedPrior;

      const satisfiedCurrent = Math.min(availableSupply, currentNeed);

      const currentContribution = satisfiedPrior + satisfiedCurrent;
      const subsequentDeficit = currentNeed - satisfiedCurrent;

      return [currentSum + currentContribution, subsequentDeficit];
    },
    [0, 0]
  );

  console.log(accumulatedTotal);
}

processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
