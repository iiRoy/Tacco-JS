((inputString) => {
  const contentRows = inputString.split('\n');
  const countOfItems = Number.parseInt(contentRows[0], 10);
  const resourceQuantities = contentRows[1].split(' ').map(Number);
  const requirementVolumes = contentRows[2].split(' ').map(Number);

  const iterativeOutcome = Array.from({ length: countOfItems + 1 }, (_, indexPosition) => indexPosition)
    .reduce((currentStatus, currentPosition) => {
      const currentResource = resourceQuantities[currentPosition];
      const currentRequirement = requirementVolumes[currentPosition];
      const outstandingNeedFromPrevious = currentStatus.priorUnsatisfied;

      const aggregatedDemand = currentRequirement + outstandingNeedFromPrevious;
      const fulfilledAmountThisStep = Math.min(currentResource, aggregatedDemand);
      const newUnsatisfiedAmount = aggregatedDemand - fulfilledAmountThisStep;

      return {
        totalCollected: currentStatus.totalCollected + fulfilledAmountThisStep,
        priorUnsatisfied: newUnsatisfiedAmount,
      };
    }, { totalCollected: 0, priorUnsatisfied: 0 });

  console.log(iterativeOutcome.totalCollected);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));