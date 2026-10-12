(function main(){
  const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n");
  const [itemCount, binCount] = inputLines.shift().split(' ').map(Number);
  const itemWeights = inputLines.map(Number);

  const initialOverallWeight = itemWeights.reduce((accumulator, currentWeight) => accumulator + currentWeight, 0);

  const distributionInitialState = {
    storageBins: Array(binCount).fill(0).map(() => ({ currentSum: 0, contents: [] })),
    remainingTotalWeight: initialOverallWeight,
    activeBinIndex: 0,
    peakBinWeight: 0,
    priorIterationAverage: initialOverallWeight / binCount
  };

  const weightAllocationReducer = (currentState, incomingWeight) => {
    let { storageBins, remainingTotalWeight, activeBinIndex, peakBinWeight, priorIterationAverage } = currentState;

    const currentBin = storageBins[activeBinIndex];
    const decisionCriterionMet = priorIterationAverage - (2 * currentBin.currentSum + incomingWeight) / 2 > 0;

    if (!decisionCriterionMet) {
      peakBinWeight = Math.max(peakBinWeight, currentBin.currentSum);
      activeBinIndex++;
    }

    const targetBin = storageBins[activeBinIndex];
    targetBin.currentSum += incomingWeight;
    targetBin.contents.push(incomingWeight);
    remainingTotalWeight -= incomingWeight;

    const availableBinSlots = binCount - activeBinIndex - 1;
    const nextIterationAverage = availableBinSlots === 0
        ? (remainingTotalWeight > 0 ? Infinity : NaN)
        : remainingTotalWeight / availableBinSlots;

    return {
      storageBins,
      remainingTotalWeight,
      activeBinIndex,
      peakBinWeight,
      priorIterationAverage: nextIterationAverage
    };
  };

  const finalDistributionState = itemWeights.reduce(weightAllocationReducer, distributionInitialState);

  finalDistributionState.peakBinWeight = Math.max(finalDistributionState.peakBinWeight, finalDistributionState.storageBins[finalDistributionState.activeBinIndex].currentSum);
  console.log(finalDistributionState.peakBinWeight);
})();
