const processDataSet = (sourceData) => {
  const dataSegments = sourceData.split('\n');

  const [countItems, constraintValue] = dataSegments[0].split(' ').map(parseFloat);
  const numericSeries = dataSegments[1].split(' ').map(parseFloat);

  const analysisResult = numericSeries.reduce((accumulator, currentObservation) => {
    const potentialBenefit = currentObservation - accumulator.lowestPoint;

    if (potentialBenefit > accumulator.peakProfit) {
      accumulator.peakProfit = potentialBenefit;
      accumulator.profitOccurrences = 1;
    } else if (potentialBenefit === accumulator.peakProfit) {
      accumulator.profitOccurrences++;
    }

    accumulator.lowestPoint = Math.min(accumulator.lowestPoint, currentObservation);

    return accumulator;
  }, { lowestPoint: Infinity, peakProfit: 0, profitOccurrences: 0 });

  const finalTally = Math.floor(constraintValue / 2);
  const outcome = Math.min(analysisResult.profitOccurrences, finalTally);

  return outcome;
};

console.log(processDataSet(require("fs").readFileSync("/dev/stdin", "utf8")));