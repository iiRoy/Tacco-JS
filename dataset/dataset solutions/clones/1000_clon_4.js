const calculateBestYield = (priceSeries) => {
  const entryCount = Number(priceSeries[0]);
  const numericalPoints = priceSeries.slice(1, entryCount).map(val => Number(val));

  const initialProcessingState = {
    topProfit: -Infinity,
    lowestEncountered: Infinity
  };

  const finalProcessingState = numericalPoints.reduce((accumulator, currentDatum) => {
    const potentialBenefit = currentDatum - accumulator.lowestEncountered;
    const newTopProfit = Math.max(accumulator.topProfit, potentialBenefit);
    const newLowestEncountered = Math.min(accumulator.lowestEncountered, currentDatum);

    return {
      topProfit: newTopProfit,
      lowestEncountered: newLowestEncountered
    };
  }, initialProcessingState);

  return finalProcessingState.topProfit;
};

let accumulatedInputData = [];

process.stdin.on("data", (dataSegment) => {
  accumulatedInputData.push(dataSegment);
});

process.stdin.on("end", () => {
  const completeRawInput = accumulatedInputData.join('');
  const relevantLines = completeRawInput.split("\n").filter(lineItem => lineItem.trim() !== "");

  const finalCalculatedOutput = calculateBestYield(relevantLines);
  process.stdout.write(finalCalculatedOutput.toString() + "\n");
});

process.stdin.resume();
process.stdin.setEncoding("utf8");